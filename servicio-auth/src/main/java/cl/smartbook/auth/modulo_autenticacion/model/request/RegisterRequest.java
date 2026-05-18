package cl.smartbook.auth.modulo_autenticacion.model.request;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El username es obligatorio")
        @Size(max = 50, message = "El username no puede exceder 50 caracteres")
        String username,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Formato de email inválido")
        @Size(max = 100, message = "El email no puede exceder 100 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Rol rol) {
}
