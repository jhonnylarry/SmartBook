package cl.smartbook.auth.modulo_autenticacion.model.request;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarUsuario {

    @Email(message = "Formato de email inválido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String password;

    private Rol rol;

    private Boolean activo;
}
