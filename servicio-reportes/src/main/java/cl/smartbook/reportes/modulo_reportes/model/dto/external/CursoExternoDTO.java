package cl.smartbook.reportes.modulo_reportes.model.dto.external;

public record CursoExternoDTO(
        Long id,
        String nombre,
        Integer anio,
        Long idDocenteJefe
) {}
