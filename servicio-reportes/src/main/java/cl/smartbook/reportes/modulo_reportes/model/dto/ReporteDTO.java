package cl.smartbook.reportes.modulo_reportes.model.dto;

import cl.smartbook.reportes.modulo_reportes.model.entity.TipoReporte;

import java.time.LocalDateTime;

public record ReporteDTO(
        Long id,
        TipoReporte tipo,
        Long idReferencia,
        String datosJson,
        LocalDateTime fechaGeneracion,
        Long idSolicitante
) {}
