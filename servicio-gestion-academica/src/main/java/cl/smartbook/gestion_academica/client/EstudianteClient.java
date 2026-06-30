package cl.smartbook.gestion_academica.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

import cl.smartbook.gestion_academica.client.dto.ApoderadoRefDTO;
import cl.smartbook.gestion_academica.client.dto.EstudianteDTO;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class EstudianteClient {

    private final WebClient estudianteWebClient;

    public EstudianteClient(@Qualifier("estudianteWebClient") WebClient estudianteWebClient) {
        this.estudianteWebClient = estudianteWebClient;
    }

    public EstudianteDTO obtenerEstudiante(Long idEstudiante, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .bodyToMono(EstudianteDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new ReferenciaInvalidaException("Estudiante no existe con id: " + idEstudiante);
        } catch (Exception e) {
            log.error("Error al consultar gestion-estudiante. idEstudiante={}", idEstudiante, e);
            throw new ServicioNoDisponibleException("No se pudo consultar el estudiante.");
        }
    }

    public void verificarEstudianteExiste(Long idEstudiante, String authHeader) {
        obtenerEstudiante(idEstudiante, authHeader);
    }

    /**
     * Verifica en gestion-estudiante que el apoderado autenticado (JWT reenviado) sea tutor del
     * estudiante. Lanza AccessDeniedException (→ 403) si no lo es. Base del control anti-IDOR del portal de apoderado.
     */
    public void verificarApoderadoDe(Long idEstudiante, String authHeader) {
        try {
            estudianteWebClient.get()
                    .uri("/api/v1/apoderados/verificar/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException.Forbidden | WebClientResponseException.NotFound e) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "No autorizado sobre el estudiante " + idEstudiante);
        } catch (Exception e) {
            log.error("Error al verificar apoderado del estudiante {}", idEstudiante, e);
            throw new ServicioNoDisponibleException("No se pudo verificar el apoderado.");
        }
    }

    /**
     * Apoderados de un estudiante (para notificarles). Best-effort: ante cualquier fallo devuelve
     * lista vacía (el aviso de notas nunca debe romper el guardado de la nota).
     */
    public List<ApoderadoRefDTO> obtenerApoderados(Long idEstudiante, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/apoderados/estudiante/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .bodyToFlux(ApoderadoRefDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudieron obtener los apoderados del estudiante {} para el aviso de nota: {}",
                    idEstudiante, e.getMessage());
            return List.of();
        }
    }

    /** Ficha del estudiante autenticado (derivada del JWT en gestion-estudiante, sin id en la ruta). */
    public EstudianteDTO obtenerMiEstudiante(String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/me")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .bodyToMono(EstudianteDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new ReferenciaInvalidaException("El usuario autenticado no tiene ficha de estudiante");
        } catch (Exception e) {
            log.error("Error al consultar /estudiantes/me", e);
            throw new ServicioNoDisponibleException("No se pudo consultar el estudiante.");
        }
    }
}
