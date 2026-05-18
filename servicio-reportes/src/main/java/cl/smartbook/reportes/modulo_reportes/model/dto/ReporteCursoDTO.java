package cl.smartbook.reportes.modulo_reportes.model.dto;

import cl.smartbook.reportes.modulo_reportes.model.dto.external.CursoExternoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.EstudianteExternoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.NotaExternaDTO;

import java.util.List;

public record ReporteCursoDTO(
        Long idCurso,
        CursoExternoDTO curso,
        List<EstudianteExternoDTO> estudiantes,
        List<NotaExternaDTO> notas,
        List<String> errores
) {}
