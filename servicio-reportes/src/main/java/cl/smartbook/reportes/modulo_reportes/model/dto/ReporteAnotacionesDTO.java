package cl.smartbook.reportes.modulo_reportes.model.dto;

import cl.smartbook.reportes.modulo_reportes.model.dto.external.AnotacionExternaDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.EstudianteExternoDTO;

import java.util.List;

public record ReporteAnotacionesDTO(
        Long idEstudiante,
        EstudianteExternoDTO estudiante,
        List<AnotacionExternaDTO> anotaciones,
        List<String> errores
) {}
