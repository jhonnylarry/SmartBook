package cl.smartbook.gestion_academica.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Referencia mínima de un apoderado (solo lo necesario para notificarle). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ApoderadoRefDTO(
        Long idUsuario,
        String nombre,
        String apellido
) {}
