package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.controller;

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

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDetalleDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.ActualizarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.AgregarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service.EstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Estudiantes", description = "CRUD de estudiantes matriculados")
@RestController
@RequestMapping("/api/v1/estudiantes")
@RequiredArgsConstructor
public class EstudianteController {

    private final EstudianteService estudianteService;

    @Operation(summary = "Listar todos los estudiantes")
    @GetMapping
    public ResponseEntity<List<EstudianteDTO>> listar() {
        return ResponseEntity.ok(estudianteService.listarTodos());
    }

    @Operation(summary = "Obtener estudiante por ID (incluye matrículas)")
    @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<EstudianteDetalleDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.buscarPorId(id));
    }

    @Operation(summary = "Crear nuevo estudiante")
    @ApiResponse(responseCode = "201", description = "Estudiante creado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<EstudianteDTO> crear(@Valid @RequestBody AgregarEstudiante request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(estudianteService.crearUsuarioYGuardar(request));
    }

    @Operation(summary = "Actualizar estudiante existente")
    @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<EstudianteDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstudiante request) {
        return ResponseEntity.ok(estudianteService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar estudiante")
    @ApiResponse(responseCode = "204", description = "Estudiante eliminado")
    @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        estudianteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
