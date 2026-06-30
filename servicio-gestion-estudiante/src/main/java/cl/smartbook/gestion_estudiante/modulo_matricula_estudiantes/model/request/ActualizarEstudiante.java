package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarEstudiante {

    @NotBlank(message = "El nombre no puede quedar vacío si se envía")
    private String nombre;

    @NotBlank(message = "El apellido no puede quedar vacío si se envía")
    private String apellido;

    private String rut;

    private LocalDate fechaNacimiento;

    @Size(max = 250, message = "La dirección no puede exceder 250 caracteres")
    private String direccion;

    @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
    private String telefono;
}
