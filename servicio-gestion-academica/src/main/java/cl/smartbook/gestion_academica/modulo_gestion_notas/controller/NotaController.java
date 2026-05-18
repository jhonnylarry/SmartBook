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

import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.NotaDTO;
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
    @GetMapping
    public ResponseEntity<List<NotaDTO>> listar() {
        return ResponseEntity.ok(notaService.listar());
    }

    @Operation(summary = "Obtener nota por ID")
    @GetMapping("/{id}")
    public ResponseEntity<NotaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notaService.buscarPorId(id));
    }

    @Operation(summary = "Listar notas de un estudiante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'DOCENTE', 'INSPECTOR', 'ADMINISTRATIVO')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<NotaDTO>> listarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(notaService.listarPorEstudiante(idEstudiante));
    }

    @Operation(summary = "Listar notas de una evaluacion")
    @GetMapping("/evaluacion/{idEvaluacion}")
    public ResponseEntity<List<NotaDTO>> listarPorEvaluacion(@PathVariable Long idEvaluacion) {
        return ResponseEntity.ok(notaService.listarPorEvaluacion(idEvaluacion));
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
