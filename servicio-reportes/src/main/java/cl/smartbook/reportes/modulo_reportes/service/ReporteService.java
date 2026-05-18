package cl.smartbook.reportes.modulo_reportes.service;

import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteAnotacionesDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteCursoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteNotasDTO;

import java.util.List;

public interface ReporteService {

    ReporteNotasDTO generarReporteNotas(Long idEstudiante, String authHeader);

    ReporteAnotacionesDTO generarReporteAnotaciones(Long idEstudiante, String authHeader);

    ReporteCursoDTO generarReporteCurso(Long idCurso, String authHeader);

    List<ReporteDTO> historialPorUsuario(Long idUsuario);

    ReporteDTO getById(Long id);
}
