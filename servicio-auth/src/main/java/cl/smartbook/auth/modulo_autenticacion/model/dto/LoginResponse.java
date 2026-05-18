package cl.smartbook.auth.modulo_autenticacion.model.dto;

public record LoginResponse(
        String token,
        Long expiraEn,
        UsuarioDto usuario) {
}
