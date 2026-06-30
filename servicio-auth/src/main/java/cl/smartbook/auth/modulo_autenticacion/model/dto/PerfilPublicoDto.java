package cl.smartbook.auth.modulo_autenticacion.model.dto;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;

public record PerfilPublicoDto(Long id, String username, Rol rol) {}
