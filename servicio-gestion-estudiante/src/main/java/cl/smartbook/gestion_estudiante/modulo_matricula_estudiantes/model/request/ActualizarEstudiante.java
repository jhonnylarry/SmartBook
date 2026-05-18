package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActualizarEstudiante {

    @NotBlank(message = "El nombre no puede quedar vacío si se envía")
    private String nombre;

    @NotBlank(message = "El apellido no puede quedar vacío si se envía")
    private String apellido;

    private String rut;

    private LocalDate fechaNacimiento;
}
