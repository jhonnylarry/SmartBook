package cl.smartbook.evento_calendario.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Asignatura (gestion-academica /asignaturas/mias y /asignaturas/curso/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AsignaturaRefDTO(Long id, String nombre, Long idCurso, Long idDocente) {}
