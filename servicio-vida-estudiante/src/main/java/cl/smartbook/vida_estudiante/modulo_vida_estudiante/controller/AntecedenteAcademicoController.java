package cl.smartbook.vida_estudiante.modulo_vida_estudiante.controller;

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

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.AntecedenteAcademicoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarAntecedenteAcademico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarAntecedenteAcademico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.service.AntecedenteAcademicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Antecedentes Académicos", description = "Gestión de antecedentes académicos del estudiante")
@RestController
@RequestMapping("/api/v1/antecedentes-academicos")
@RequiredArgsConstructor
public class AntecedenteAcademicoController {

    private final AntecedenteAcademicoService service;

    @Operation(summary = "Listar todos los antecedentes académicos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping
    public ResponseEntity<List<AntecedenteAcademicoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener antecedente académico por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping("/{id}")
    public ResponseEntity<AntecedenteAcademicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Listar antecedentes académicos por hoja de vida")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','SERVICIO_INTERNO')")
    @GetMapping("/hoja-vida/{idHojaVida}")
    public ResponseEntity<List<AntecedenteAcademicoDTO>> listarPorHojaVida(@PathVariable Long idHojaVida) {
        return ResponseEntity.ok(service.listarPorHojaVida(idHojaVida));
    }

    @Operation(summary = "Crear antecedente académico")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<AntecedenteAcademicoDTO> crear(@Valid @RequestBody AgregarAntecedenteAcademico request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Actualizar antecedente académico")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<AntecedenteAcademicoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAntecedenteAcademico request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @Operation(summary = "Eliminar antecedente académico")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
