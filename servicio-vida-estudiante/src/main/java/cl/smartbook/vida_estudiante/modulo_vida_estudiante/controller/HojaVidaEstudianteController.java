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

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.HojaVidaEstudianteDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarHojaVidaEstudiante;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarHojaVidaEstudiante;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.service.HojaVidaEstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Hojas de Vida", description = "Gestión de hojas de vida del estudiante")
@RestController
@RequestMapping("/api/v1/hojas-vida")
@RequiredArgsConstructor
public class HojaVidaEstudianteController {

    private final HojaVidaEstudianteService service;

    @Operation(summary = "Listar todas las hojas de vida")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping
    public ResponseEntity<List<HojaVidaEstudianteDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener hoja de vida por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping("/{id}")
    public ResponseEntity<HojaVidaEstudianteDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Buscar hojas de vida por estudiante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','SERVICIO_INTERNO')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<HojaVidaEstudianteDTO>> buscarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(service.buscarPorEstudiante(idEstudiante));
    }

    @Operation(summary = "Crear hoja de vida")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<HojaVidaEstudianteDTO> crear(@Valid @RequestBody AgregarHojaVidaEstudiante request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Actualizar hoja de vida")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<HojaVidaEstudianteDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarHojaVidaEstudiante request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @Operation(summary = "Eliminar hoja de vida")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
