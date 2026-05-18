package cl.smartbook.reportes.modulo_reportes.controller;

import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteAnotacionesDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteCursoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteNotasDTO;
import cl.smartbook.reportes.modulo_reportes.service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Generación y consulta de reportes del colegio")
public class ReporteController {

    private final ReporteService reporteService;

    @Operation(summary = "Reporte de notas de un estudiante")
    @GetMapping("/notas/{idEstudiante}")
    @PreAuthorize("hasAnyRole('DIRECTOR','DOCENTE','ADMINISTRADOR')")
    ResponseEntity<ReporteNotasDTO> reporteNotas(
            @PathVariable Long idEstudiante,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(reporteService.generarReporteNotas(idEstudiante, authHeader));
    }

    @Operation(summary = "Reporte de anotaciones conductuales de un estudiante")
    @GetMapping("/anotaciones/{idEstudiante}")
    @PreAuthorize("hasAnyRole('DIRECTOR','DOCENTE','ADMINISTRADOR','INSPECTOR')")
    ResponseEntity<ReporteAnotacionesDTO> reporteAnotaciones(
            @PathVariable Long idEstudiante,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(reporteService.generarReporteAnotaciones(idEstudiante, authHeader));
    }

    @Operation(summary = "Reporte completo de un curso")
    @GetMapping("/curso/{idCurso}")
    @PreAuthorize("hasAnyRole('DIRECTOR','DOCENTE','ADMINISTRADOR')")
    ResponseEntity<ReporteCursoDTO> reporteCurso(
            @PathVariable Long idCurso,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(reporteService.generarReporteCurso(idCurso, authHeader));
    }

    @Operation(summary = "Historial de reportes del usuario autenticado")
    @GetMapping("/historial")
    @PreAuthorize("hasAnyRole('DIRECTOR','DOCENTE','ADMINISTRADOR')")
    ResponseEntity<List<ReporteDTO>> historial() {
        return ResponseEntity.ok(reporteService.historialPorUsuario(extraerUserId()));
    }

    @Operation(summary = "Detalle de un reporte específico del historial")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR','DOCENTE','ADMINISTRADOR')")
    ResponseEntity<ReporteDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reporteService.getById(id));
    }

    private Long extraerUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getDetails().toString());
    }
}
