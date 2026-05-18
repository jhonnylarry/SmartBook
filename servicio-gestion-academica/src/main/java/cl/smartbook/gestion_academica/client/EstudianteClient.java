package cl.smartbook.gestion_academica.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
}
