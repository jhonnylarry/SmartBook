package cl.smartbook.gestion_academica.modulo_periodos_academicos.controller;

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

import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.dto.PeriodoAcademicoDTO;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.request.ActualizarPeriodo;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.request.AgregarPeriodo;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.service.PeriodoAcademicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Periodos Académicos", description = "Gestión de periodos académicos (trimestres/semestres)")
@RestController
@RequestMapping("/api/v1/periodos")
@RequiredArgsConstructor
public class PeriodoAcademicoController {

    private final PeriodoAcademicoService periodoService;

    @Operation(summary = "Listar periodos académicos")
    @GetMapping
    public ResponseEntity<List<PeriodoAcademicoDTO>> listar() {
        return ResponseEntity.ok(periodoService.listar());
    }

    @Operation(summary = "Obtener periodo académico por ID")
    @GetMapping("/{id}")
    public ResponseEntity<PeriodoAcademicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(periodoService.buscarPorId(id));
    }

    @Operation(summary = "Crear periodo académico")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<PeriodoAcademicoDTO> crear(@Valid @RequestBody AgregarPeriodo request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(periodoService.crear(request));
    }

    @Operation(summary = "Actualizar periodo académico")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<PeriodoAcademicoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPeriodo request) {
        return ResponseEntity.ok(periodoService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar periodo académico")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        periodoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
