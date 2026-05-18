package cl.smartbook.reportes.modulo_reportes.model.dto.external;

import java.time.LocalDateTime;

public record AnotacionExternaDTO(
        Long id,
        Long idEstudiante,
        Long idDocente,
        String tipo,
        String gravedad,
        String descripcion,
        LocalDateTime fecha
) {}
