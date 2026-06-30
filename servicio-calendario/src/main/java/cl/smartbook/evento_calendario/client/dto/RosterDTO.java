package cl.smartbook.evento_calendario.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Estudiante de un curso (gestion-estudiante /estudiantes/curso/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record RosterDTO(Long idEstudiante, Long idUsuario, String nombre, String apellido, Long idCurso) {}
