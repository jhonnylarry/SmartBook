package cl.smartbook.gestion_academica.modulo_gestion_notas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.BoletinAsignaturaDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.NotaDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.PromedioEstudianteDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.ActualizarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.AgregarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.service.NotaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Notas", description = "Gestión de notas de estudiantes")
@RestController
@RequestMapping("/api/v1/notas")
@RequiredArgsConstructor
public class NotaController {

    private final NotaService notaService;

    @Operation(summary = "Listar todas las notas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @GetMapping
    public ResponseEntity<List<NotaDTO>> listar() {
        return ResponseEntity.ok(notaService.listar());
    }

    @Operation(summary = "Obtener nota por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','INSPECTOR','ADMINISTRATIVO')")
    @GetMapping("/{id}")
    public ResponseEntity<NotaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notaService.buscarPorId(id));
    }

    @Operation(summary = "Listar notas de un estudiante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'INSPECTOR', 'ADMINISTRATIVO')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<NotaDTO>> listarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(notaService.listarPorEstudiante(idEstudiante));
    }

    @Operation(summary = "Listar mis notas (estudiante autenticado)")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @GetMapping("/mias")
    public ResponseEntity<List<NotaDTO>> misNotas(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(notaService.listarMias(authHeader));
    }

    @Operation(summary = "Listar notas de un hijo (apoderado autenticado, verificado anti-IDOR)")
    @PreAuthorize("hasRole('APODERADO')")
    @GetMapping("/hijo/{idEstudiante}")
    public ResponseEntity<List<NotaDTO>> notasDeHijo(
            @PathVariable Long idEstudiante,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(notaService.listarDeHijo(idEstudiante, authHeader));
    }

    @Operation(summary = "Listar notas de una evaluacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE')")
    @GetMapping("/evaluacion/{idEvaluacion}")
    public ResponseEntity<List<NotaDTO>> listarPorEvaluacion(@PathVariable Long idEvaluacion) {
        return ResponseEntity.ok(notaService.listarPorEvaluacion(idEvaluacion));
    }

    // ── Boletín con promedio ponderado ──

    @Operation(summary = "Mi boletín con promedios ponderados (estudiante autenticado)")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @GetMapping("/mi-boletin")
    public ResponseEntity<List<BoletinAsignaturaDTO>> miBoletin(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(notaService.miBoletin(authHeader));
    }

    @Operation(summary = "Boletín de un hijo (apoderado autenticado, verificado anti-IDOR)")
    @PreAuthorize("hasRole('APODERADO')")
    @GetMapping("/boletin/hijo/{idEstudiante}")
    public ResponseEntity<List<BoletinAsignaturaDTO>> boletinDeHijo(
            @PathVariable Long idEstudiante,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(notaService.boletinDeHijo(idEstudiante, authHeader));
    }

    @Operation(summary = "Boletín de un estudiante (staff)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','INSPECTOR','ADMINISTRATIVO')")
    @GetMapping("/boletin/estudiante/{idEstudiante}")
    public ResponseEntity<List<BoletinAsignaturaDTO>> boletinDeEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(notaService.boletinDe(idEstudiante));
    }

    @Operation(summary = "Promedios ponderados por estudiante en una asignatura (libro de notas del docente)")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMINISTRADOR','DIRECTOR')")
    @GetMapping("/promedios/asignatura/{idAsignatura}")
    public ResponseEntity<List<PromedioEstudianteDTO>> promediosDeAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(notaService.promediosDeAsignatura(idAsignatura));
    }

    @Operation(summary = "Registrar nueva nota")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<NotaDTO> crear(
            @Valid @RequestBody AgregarNota request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notaService.crear(request, authHeader));
    }

    @Operation(summary = "Actualizar nota")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<NotaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarNota request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(notaService.actualizar(id, request, authHeader));
    }

    @Operation(summary = "Eliminar nota")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
