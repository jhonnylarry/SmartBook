package cl.smartbook.anotacion.client;

import cl.smartbook.anotacion.client.dto.CursoDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
public class AcademicaClient {

    private final WebClient academicaWebClient;

    public AcademicaClient(@Qualifier("academicaWebClient") WebClient academicaWebClient) {
        this.academicaWebClient = academicaWebClient;
    }

    /**
     * FAIL-CLOSED: lanza AccessDeniedException si el docente NO dicta en el curso.
     * Lanza ServicioNoDisponibleException si el servicio cae.
     */
    public void verificarDocenteDictaCurso(Long idCurso, String authHeader) {
        try {
            academicaWebClient.get()
                    .uri("/api/v1/asignaturas/dicto-curso/{idCurso}", idCurso)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.FORBIDDEN || e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new AccessDeniedException(
                        "El docente no dicta en el curso " + idCurso);
            }
            log.error("Error al verificar asignatura docente, curso={}", idCurso, e);
            throw new ServicioNoDisponibleException("No se pudo verificar el acceso del docente al curso.");
        } catch (Exception e) {
            log.error("Error al verificar asignatura docente, curso={}", idCurso, e);
            throw new ServicioNoDisponibleException("No se pudo verificar el acceso del docente al curso.");
        }
    }

    /**
     * Best-effort: retorna null si falla, nunca lanza.
     */
    public String nombreCurso(Long idCurso, String authHeader) {
        try {
            CursoDTO curso = academicaWebClient.get()
                    .uri("/api/v1/cursos/{id}", idCurso)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .bodyToMono(CursoDTO.class)
                    .block();
            return curso != null ? curso.nombre() : null;
        } catch (Exception e) {
            log.warn("No se pudo obtener nombre del curso {}.", idCurso, e);
            return null;
        }
    }
}
