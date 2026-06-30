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

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaCompletaResponse;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.ActualizarMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.AgregarMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.MatriculaCompletaRequest;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service.MatriculaCompletaService;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service.MatriculaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Matrículas", description = "CRUD de matrículas de estudiantes")
@RestController
@RequestMapping("/api/v1/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaService matriculaService;
    private final MatriculaCompletaService matriculaCompletaService;

    @Operation(summary = "Listar todas las matrículas (solo staff; relaciona a menores con cursos)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR','DOCENTE')")
    @GetMapping
    public ResponseEntity<List<MatriculaDTO>> listar() {
        return ResponseEntity.ok(matriculaService.listarTodas());
    }

    @Operation(summary = "Obtener matrícula por ID")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR','DOCENTE')")
    @GetMapping("/{id}")
    public ResponseEntity<MatriculaDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaService.buscarPorId(id));
    }

    @Operation(summary = "Listar matrículas de un estudiante")
    @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR','DOCENTE')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<MatriculaDTO>> listarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(matriculaService.listarPorEstudiante(idEstudiante));
    }

    @Operation(summary = "Crear nueva matrícula")
    @ApiResponse(responseCode = "201", description = "Matrícula creada")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<MatriculaDTO> crear(@Valid @RequestBody AgregarMatricula request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matriculaService.matricular(request));
    }

    @Operation(summary = "Actualizar estado o curso de una matrícula")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<MatriculaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarMatricula request) {
        return ResponseEntity.ok(matriculaService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar matrícula")
    @ApiResponse(responseCode = "204", description = "Matrícula eliminada")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        matriculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Matrícula compuesta: crea estudiante, apoderado titular, tutor y matrícula en un acto")
    @ApiResponse(responseCode = "201", description = "Matrícula compuesta creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Email o usuario ya registrado en servicio-auth")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping("/completa")
    public ResponseEntity<MatriculaCompletaResponse> matricularCompleto(
            @Valid @RequestBody MatriculaCompletaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matriculaCompletaService.matricularCompleto(request));
    }
}
