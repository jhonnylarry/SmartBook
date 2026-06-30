package cl.smartbook.mensajeria.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import cl.smartbook.mensajeria.client.dto.ApoderadoRefDTO;
import cl.smartbook.mensajeria.client.dto.EstudianteMeDTO;
import cl.smartbook.mensajeria.client.dto.PupiloRefDTO;
import cl.smartbook.mensajeria.client.dto.RosterDTO;
import lombok.extern.slf4j.Slf4j;

/** Llamadas a gestion-estudiante para el directorio de contactos. Best-effort: ante fallo devuelve vacío/null. */
@Slf4j
@Component
public class EstudianteClient {

    private final WebClient estudianteWebClient;

    public EstudianteClient(@Qualifier("estudianteWebClient") WebClient estudianteWebClient) {
        this.estudianteWebClient = estudianteWebClient;
    }

    /** Compañeros del curso vigente del estudiante autenticado (self). */
    public List<RosterDTO> misCompaneros(String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/mis-companeros")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(RosterDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("misCompaneros falló: {}", e.getMessage());
            return List.of();
        }
    }

    /** Roster de estudiantes de un curso (consumido por staff/docente). */
    public List<RosterDTO> estudiantesDeCurso(Long idCurso, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/curso/{id}", idCurso)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(RosterDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("estudiantesDeCurso({}) falló: {}", idCurso, e.getMessage());
            return List.of();
        }
    }

    /** Apoderados de los estudiantes de un curso (batch). */
    public List<ApoderadoRefDTO> apoderadosDeCurso(Long idCurso, String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/apoderados/curso/{id}", idCurso)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(ApoderadoRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("apoderadosDeCurso({}) falló: {}", idCurso, e.getMessage());
            return List.of();
        }
    }

    /** Ficha del estudiante autenticado (para derivar su curso vigente). */
    public EstudianteMeDTO miEstudiante(String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/estudiantes/me")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToMono(EstudianteMeDTO.class).block();
        } catch (Exception e) {
            log.warn("miEstudiante falló: {}", e.getMessage());
            return null;
        }
    }

    /** Pupilos del apoderado autenticado (con su curso). */
    public List<PupiloRefDTO> misPupilos(String authHeader) {
        try {
            return estudianteWebClient.get()
                    .uri("/api/v1/apoderados/me")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(PupiloRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("misPupilos falló: {}", e.getMessage());
            return List.of();
        }
    }
}
