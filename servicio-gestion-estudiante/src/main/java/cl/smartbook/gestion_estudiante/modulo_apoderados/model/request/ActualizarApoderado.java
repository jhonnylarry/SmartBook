package cl.smartbook.gestion_estudiante.modulo_apoderados.model.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ActualizarApoderado {

    private String nombre;
    private String apellido;
    private String telefono;

    @Email(message = "Formato de email inválido")
    private String email;

    private String parentesco;
}
