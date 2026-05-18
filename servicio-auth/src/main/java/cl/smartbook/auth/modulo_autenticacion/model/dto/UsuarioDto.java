package cl.smartbook.auth.modulo_autenticacion.model.dto;

import java.time.LocalDateTime;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;

public record UsuarioDto(
        Long id,
        String username,
        String email,
        Rol rol,
        boolean activo,
        LocalDateTime fechaCreacion) {
}
