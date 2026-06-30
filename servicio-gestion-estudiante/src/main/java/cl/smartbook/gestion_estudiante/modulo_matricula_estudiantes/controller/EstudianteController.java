package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteBusquedaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDetalleDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.RosterEstudianteDTO;
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
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE','INSPECTOR','ADMINISTRATIVO')")
    @GetMapping
    public ResponseEntity<List<EstudianteDTO>> listar() {
        return ResponseEntity.ok(estudianteService.listarTodos());
    }

    @Operation(summary = "Buscador avanzado de estudiantes por nombre/RUT y/o curso (devuelve el curso vigente)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE','INSPECTOR','ADMINISTRATIVO')")
    @GetMapping("/buscar")
    public ResponseEntity<List<EstudianteBusquedaDTO>> buscar(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) Long idCurso) {
        return ResponseEntity.ok(estudianteService.buscar(texto, idCurso));
    }

    @Operation(summary = "Obtener perfil del estudiante autenticado (self)")
    @ApiResponse(responseCode = "404", description = "El usuario autenticado no es un estudiante")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<EstudianteDetalleDTO> me() {
        return ResponseEntity.ok(estudianteService.buscarPorIdUsuario(idUsuarioDesdeJwt()));
    }

    @Operation(summary = "Compañeros de curso del estudiante autenticado (self)")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @GetMapping("/mis-companeros")
    public ResponseEntity<List<RosterEstudianteDTO>> misCompaneros() {
        return ResponseEntity.ok(estudianteService.companerosDe(idUsuarioDesdeJwt()));
    }

    @Operation(summary = "Roster de estudiantes (con matrícula vigente) de un curso")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR','DOCENTE')")
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<RosterEstudianteDTO>> porCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(estudianteService.rosterDeCurso(idCurso));
    }

    @Operation(summary = "Obtener estudiante por ID (incluye matrículas)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE','INSPECTOR','ADMINISTRATIVO','SERVICIO_INTERNO')")
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

    /**
     * Extrae el id del usuario autenticado desde el JWT (claim {@code sub}) expuesto
     * por JwtAuthFilter en {@code Authentication.details}. Lanza EntityNotFoundException
     * (→ 404) si no está disponible o no es parseable como Long, en lugar de propagar
     * un 500.
     */
    private Long idUsuarioDesdeJwt() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getDetails() == null) {
                throw new jakarta.persistence.EntityNotFoundException(
                        "No se pudo determinar el usuario autenticado");
            }
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException ex) {
            throw new jakarta.persistence.EntityNotFoundException(
                    "No se pudo determinar el usuario autenticado");
        }
    }
}
