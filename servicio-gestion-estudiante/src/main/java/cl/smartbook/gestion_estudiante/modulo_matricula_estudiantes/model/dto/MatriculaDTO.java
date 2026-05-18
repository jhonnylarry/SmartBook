package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

import java.time.LocalDateTime;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula;

public record MatriculaDTO(
        Long id,
        Long idEstudiante,
        Long idCurso,
        LocalDateTime fechaMatricula,
        EstadoMatricula estado) {
}
