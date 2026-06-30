package cl.smartbook.evento_calendario.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Curso (gestion-academica /cursos) — incluye idDocenteJefe para resolver cursos donde el docente es jefe. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CursoRefDTO(Long id, String nombre, Long idDocenteJefe) {}
