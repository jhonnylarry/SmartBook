package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import java.time.LocalDate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MatriculaCompletaRequest {

    @Valid
    @NotNull(message = "Los datos del estudiante son obligatorios")
    private DatosEstudiante estudiante;

    @Valid
    @NotNull(message = "Los datos del apoderado titular son obligatorios")
    private DatosApoderado apoderadoTitular;

    @Valid
    @NotNull(message = "Los datos del tutor (apoderado suplente) son obligatorios")
    private DatosApoderado tutor;

    @NotNull(message = "El id del curso es obligatorio")
    private Long idCurso;

    @Data
    public static class DatosEstudiante {

        @NotBlank(message = "El nombre del estudiante es obligatorio")
        private String nombre;

        @NotBlank(message = "El apellido del estudiante es obligatorio")
        private String apellido;

        @Pattern(
                regexp = "^\\d{1,8}-[\\dKk]$",
                message = "Formato de RUT inválido (ej: 12345678-9)"
        )
        private String rut;

        private LocalDate fechaNacimiento;

        @Size(max = 250, message = "La dirección no puede exceder 250 caracteres")
        private String direccion;

        @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
        private String telefono;

        @NotBlank(message = "El email del estudiante es obligatorio")
        @Email(message = "Formato de email inválido")
        private String email;

        private String password;
    }

    @Data
    public static class DatosApoderado {

        @NotBlank(message = "El nombre del apoderado es obligatorio")
        private String nombre;

        @NotBlank(message = "El apellido del apoderado es obligatorio")
        private String apellido;

        @Pattern(
                regexp = "^\\d{1,8}-[\\dKk]$",
                message = "Formato de RUT inválido (ej: 12345678-9)"
        )
        private String rut;

        @NotBlank(message = "El email del apoderado es obligatorio")
        @Email(message = "Formato de email inválido")
        private String email;

        private String telefono;
        private String parentesco;
        private String password;
    }
}
