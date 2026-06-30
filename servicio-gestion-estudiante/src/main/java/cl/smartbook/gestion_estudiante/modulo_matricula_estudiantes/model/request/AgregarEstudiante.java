package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarEstudiante {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    private String apellido;

    @Pattern(
            regexp = "^\\d{1,8}-[\\dKk]$",
            message = "Formato de RUT inválido (ej: 12345678-9)"
    )
    @Size(max = 12, message = "RUT demasiado largo")
    private String rut;

    private LocalDate fechaNacimiento;

    @Size(max = 250, message = "La dirección no puede exceder 250 caracteres")
    private String direccion;

    @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
    private String telefono;
}
