package cl.smartbook.reportes.modulo_reportes.model.dto.external;

public record NotaExternaDTO(
        Long id,
        Long idEvaluacion,
        Long idEstudiante,
        Double calificacion
) {}
