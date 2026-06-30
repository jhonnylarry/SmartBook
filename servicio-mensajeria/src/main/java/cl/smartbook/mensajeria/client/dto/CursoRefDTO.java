package cl.smartbook.mensajeria.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Curso (gestion-academica /cursos) — para nombrar los grupos de difusión. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CursoRefDTO(Long id, String nombre) {}
