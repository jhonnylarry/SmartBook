package cl.smartbook.mensajeria.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Apoderado (gestion-estudiante /apoderados/curso/{id} y /apoderados/estudiante/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ApoderadoRefDTO(Long idUsuario, String nombre, String apellido) {}
