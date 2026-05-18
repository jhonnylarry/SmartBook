package cl.smartbook.reportes.modulo_reportes.model.dto;

import cl.smartbook.reportes.modulo_reportes.model.dto.external.EstudianteExternoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.NotaExternaDTO;

import java.util.List;

public record ReporteNotasDTO(
        Long idEstudiante,
        EstudianteExternoDTO estudiante,
        List<NotaExternaDTO> notas,
        List<String> errores
) {}
