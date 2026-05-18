package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.controller;

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

import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.dto.ObjetivoAprendizajeDTO;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request.ActualizarObjetivoAprendizaje;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request.AgregarObjetivoAprendizaje;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.service.ObjetivoAprendizajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Objetivos de Aprendizaje",
     description = "Gestión de objetivos curriculares por asignatura")
@RestController
@RequestMapping("/api/v1/objetivos-aprendizaje")
@RequiredArgsConstructor
public class ObjetivoAprendizajeController {

    private final ObjetivoAprendizajeService objetivoService;

    @Operation(summary = "Listar todos los objetivos")
    @GetMapping
    public ResponseEntity<List<ObjetivoAprendizajeDTO>> listar() {
        return ResponseEntity.ok(objetivoService.listar());
    }

    @Operation(summary = "Obtener objetivo por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ObjetivoAprendizajeDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(objetivoService.buscarPorId(id));
    }

    @Operation(summary = "Listar objetivos por asignatura")
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<List<ObjetivoAprendizajeDTO>> listarPorAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(objetivoService.listarPorAsignatura(idAsignatura));
    }

    @Operation(summary = "Crear nuevo objetivo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<ObjetivoAprendizajeDTO> crear(@Valid @RequestBody AgregarObjetivoAprendizaje request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(objetivoService.crear(request));
    }

    @Operation(summary = "Actualizar objetivo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ObjetivoAprendizajeDTO> actualizar(@PathVariable Long id,
                                                              @Valid @RequestBody ActualizarObjetivoAprendizaje request) {
        return ResponseEntity.ok(objetivoService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar objetivo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        objetivoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
