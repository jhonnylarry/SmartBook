package cl.smartbook.mensajeria.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Perfil público de un usuario (servicio-auth /usuarios/perfiles y /usuarios/por-rol). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record PerfilDTO(Long id, String username, String rol) {}
