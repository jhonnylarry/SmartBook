package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.AsignaturaDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service.AsignaturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Asignaturas", description = "Gestión de asignaturas por curso")
@RestController
@RequestMapping("/api/v1/asignaturas")
@RequiredArgsConstructor
public class AsignaturaController {

    private final AsignaturaService asignaturaService;

    @Operation(summary = "Listar todas las asignaturas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping
    public ResponseEntity<List<AsignaturaDTO>> listar() {
        return ResponseEntity.ok(asignaturaService.listar());
    }

    @Operation(summary = "Listar asignaturas de un curso")
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<AsignaturaDTO>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(asignaturaService.listarPorCurso(idCurso));
    }

    @Operation(summary = "Listar asignaturas de un docente (staff; el propio docente usa /mias)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR')")
    @GetMapping("/docente/{idDocente}")
    public ResponseEntity<List<AsignaturaDTO>> listarPorDocente(@PathVariable Long idDocente) {
        return ResponseEntity.ok(asignaturaService.listarPorDocente(idDocente));
    }

    @Operation(summary = "Mis asignaturas (docente autenticado, self)")
    @PreAuthorize("hasRole('DOCENTE')")
    @GetMapping("/mias")
    public ResponseEntity<List<AsignaturaDTO>> mias() {
        return ResponseEntity.ok(asignaturaService.listarMias());
    }

    @Operation(summary = "Verifica si el docente autenticado dicta en un curso (204 sí / 403 no)")
    @PreAuthorize("hasRole('DOCENTE')")
    @GetMapping("/dicto-curso/{idCurso}")
    public ResponseEntity<Void> dictoCurso(@PathVariable Long idCurso) {
        if (!asignaturaService.dictoCurso(idCurso)) {
            throw new AccessDeniedException("El docente no dicta en el curso " + idCurso);
        }
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener asignatura por ID")
    @GetMapping("/{id}")
    public ResponseEntity<AsignaturaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(asignaturaService.buscarPorId(id));
    }

    @Operation(summary = "Crear nueva asignatura")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<AsignaturaDTO> crear(
            @Valid @RequestBody AgregarAsignatura request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(asignaturaService.crear(request, authHeader));
    }

    @Operation(summary = "Actualizar asignatura")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<AsignaturaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAsignatura request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(asignaturaService.actualizar(id, request, authHeader));
    }

    @Operation(summary = "Eliminar asignatura")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        asignaturaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
