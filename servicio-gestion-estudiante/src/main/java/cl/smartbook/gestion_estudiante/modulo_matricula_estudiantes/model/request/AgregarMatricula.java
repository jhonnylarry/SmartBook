package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AgregarMatricula {

    @NotNull(message = "El idEstudiante es obligatorio")
    private Long idEstudiante;

    @NotNull(message = "El idCurso es obligatorio")
    private Long idCurso;
}
