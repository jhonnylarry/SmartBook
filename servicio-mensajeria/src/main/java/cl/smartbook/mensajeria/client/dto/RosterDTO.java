package cl.smartbook.mensajeria.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Estudiante de un curso (gestion-estudiante /estudiantes/mis-companeros y /estudiantes/curso/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record RosterDTO(Long idEstudiante, Long idUsuario, String nombre, String apellido, Long idCurso) {}
