package cl.smartbook.evento_calendario.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Pupilo de un apoderado (gestion-estudiante /apoderados/me) — para derivar curso/estudiante de sus pupilos. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record PupiloRefDTO(Long idEstudiante, Long idCurso) {}
