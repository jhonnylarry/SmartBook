package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula;
import lombok.Data;

@Data
public class ActualizarMatricula {

    private Long idCurso;

    private EstadoMatricula estado;
}
