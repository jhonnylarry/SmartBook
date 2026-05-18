package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarHojaVidaEstudiante {

    @NotNull
    private Long idEstudiante;

    @NotBlank
    @Size(max = 10)
    private String anioAcademico;

    @Size(max = 2000)
    private String observaciones;
}
