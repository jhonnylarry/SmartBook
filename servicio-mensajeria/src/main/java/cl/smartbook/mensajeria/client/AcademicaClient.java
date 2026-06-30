package cl.smartbook.mensajeria.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import cl.smartbook.mensajeria.client.dto.AsignaturaRefDTO;
import cl.smartbook.mensajeria.client.dto.CursoRefDTO;
import lombok.extern.slf4j.Slf4j;

/** Llamadas a gestion-academica para el directorio de contactos. Best-effort: ante fallo devuelve vacío. */
@Slf4j
@Component
public class AcademicaClient {

    private final WebClient academicaWebClient;

    public AcademicaClient(@Qualifier("academicaWebClient") WebClient academicaWebClient) {
        this.academicaWebClient = academicaWebClient;
    }

    /** Asignaturas del docente autenticado (self). */
    public List<AsignaturaRefDTO> asignaturasMias(String authHeader) {
        try {
            return academicaWebClient.get()
                    .uri("/api/v1/asignaturas/mias")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(AsignaturaRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("asignaturasMias falló: {}", e.getMessage());
            return List.of();
        }
    }

    /** Asignaturas (y por tanto docentes) de un curso. */
    public List<AsignaturaRefDTO> asignaturasDeCurso(Long idCurso, String authHeader) {
        try {
            return academicaWebClient.get()
                    .uri("/api/v1/asignaturas/curso/{id}", idCurso)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(AsignaturaRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("asignaturasDeCurso({}) falló: {}", idCurso, e.getMessage());
            return List.of();
        }
    }

    /** Todos los cursos (para nombrar los grupos de difusión). */
    public List<CursoRefDTO> cursos(String authHeader) {
        try {
            return academicaWebClient.get()
                    .uri("/api/v1/cursos")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(CursoRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("cursos falló: {}", e.getMessage());
            return List.of();
        }
    }
}
