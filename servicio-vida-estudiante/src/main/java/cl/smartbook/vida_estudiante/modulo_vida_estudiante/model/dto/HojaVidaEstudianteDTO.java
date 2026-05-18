package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto;

import java.time.LocalDateTime;

public record HojaVidaEstudianteDTO(
        Long id,
        Long idEstudiante,
        String anioAcademico,
        String observaciones,
        LocalDateTime fechaCreacion) {
}
