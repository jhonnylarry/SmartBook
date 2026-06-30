package cl.smartbook.anotacion.client;

import cl.smartbook.anotacion.client.dto.ApoderadoDTO;
import cl.smartbook.anotacion.client.dto.EstudianteDTO;
import cl.smartbook.anotacion.client.dto.EstudianteDetalleDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

@Slf4j
@Component
public class EstudianteClient {

    private static final String INTERNAL_HEADER = "X-Internal-Token";

    private final WebClient estudianteWebClient;
    private final String internalToken;

    public EstudianteClient(@Qualifier("estudianteWebClient") WebClient estudianteWebClient,
                            @Value("${smartbook.internal.service-token}") String internalToken) {
        this.estudianteWebClient = estudianteWebClient;
        this.internalToken = internalToken;
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
     * estudiante. Lanza AccessDeniedException (→ 403) si no lo es. Base del control anti-IDOR.
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

    /**
     * Detalle completo del estudiante incluyendo matrícula vigente. FAIL-CLOSED: lanza si no existe.
     * Lectura de datos del agregador: usa el token de servicio interno (la autorización anti-IDOR ya
     * se hizo en el service antes de llamar aquí), por lo que funciona también para APODERADO/ESTUDIANTE.
     */
    public EstudianteDetalleDTO obtenerEstudianteDetalle(Long idEstudiante, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header(INTERNAL_HEADER, internalToken)
                    .retrieve()
                    .bodyToMono(EstudianteDetalleDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new ReferenciaInvalidaException("Estudiante no existe con id: " + idEstudiante);
        } catch (Exception e) {
            log.error("Error al consultar detalle de estudiante. idEstudiante={}", idEstudiante, e);
            throw new ServicioNoDisponibleException("No se pudo consultar el estudiante.");
        }
    }

    /** Resuelve el idCurso de la matrícula VIGENTE del estudiante. FAIL-CLOSED: lanza si no tiene. */
    public Long resolverIdCursoVigente(Long idEstudiante, String authHeader) {
        EstudianteDetalleDTO detalle = obtenerEstudianteDetalle(idEstudiante, authHeader);
        if (detalle.matriculas() == null || detalle.matriculas().isEmpty()) {
            throw new ReferenciaInvalidaException("El estudiante " + idEstudiante + " no tiene matrícula vigente.");
        }
        return detalle.matriculas().stream()
                .filter(m -> "VIGENTE".equalsIgnoreCase(m.estado()))
                .map(EstudianteDetalleDTO.MatriculaDTO::idCurso)
                .findFirst()
                .orElseThrow(() -> new ReferenciaInvalidaException(
                        "El estudiante " + idEstudiante + " no tiene matrícula en estado VIGENTE."));
    }

    /** Best-effort: retorna lista vacía si falla, nunca lanza. Usa token de servicio interno. */
    public List<ApoderadoDTO> apoderadosDe(Long idEstudiante, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/apoderados/estudiante/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header(INTERNAL_HEADER, internalToken)
                    .retrieve()
                    .bodyToFlux(ApoderadoDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo obtener apoderados del estudiante {}. Retornando lista vacía.", idEstudiante, e);
            return List.of();
        }
    }
}
