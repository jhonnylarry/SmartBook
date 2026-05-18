package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.EvaluacionDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarEvaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarEvaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service.EvaluacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Evaluaciones", description = "Gestión de evaluaciones por asignatura")
@RestController
@RequestMapping("/api/v1/evaluaciones")
@RequiredArgsConstructor
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    @Operation(summary = "Listar todas las evaluaciones")
    @GetMapping
    public ResponseEntity<List<EvaluacionDTO>> listar() {
        return ResponseEntity.ok(evaluacionService.listar());
    }

    @Operation(summary = "Obtener evaluacion por ID")
    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(evaluacionService.buscarPorId(id));
    }

    @Operation(summary = "Listar evaluaciones de una asignatura")
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<List<EvaluacionDTO>> listarPorAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(evaluacionService.listarPorAsignatura(idAsignatura));
    }

    @Operation(summary = "Crear nueva evaluacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<EvaluacionDTO> crear(@Valid @RequestBody AgregarEvaluacion request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluacionService.crear(request));
    }

    @Operation(summary = "Actualizar evaluacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> actualizar(@PathVariable Long id,
                                                    @Valid @RequestBody ActualizarEvaluacion request) {
        return ResponseEntity.ok(evaluacionService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar evaluacion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        evaluacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
