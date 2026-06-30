package cl.smartbook.mensajeria.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Usuario (servicio-auth /usuarios) — para el directorio "general" de staff directivo/administrativo. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsuarioRefDTO(Long id, String username, String rol) {}
