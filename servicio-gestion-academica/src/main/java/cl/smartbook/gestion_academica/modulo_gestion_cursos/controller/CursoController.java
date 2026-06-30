package cl.smartbook.gestion_academica.modulo_gestion_cursos.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
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

import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.dto.CursoDTO;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.request.ActualizarCurso;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.request.AgregarCurso;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.service.CursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Cursos", description = "Gestión de cursos académicos")
@RestController
@RequestMapping("/api/v1/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @Operation(summary = "Listar todos los cursos")
    @GetMapping
    public ResponseEntity<List<CursoDTO>> listar() {
        return ResponseEntity.ok(cursoService.listar());
    }

    @Operation(summary = "Obtener curso por ID")
    @GetMapping("/{id}")
    public ResponseEntity<CursoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.buscarPorId(id));
    }

    @Operation(summary = "Crear nuevo curso")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<CursoDTO> crear(
            @Valid @RequestBody AgregarCurso request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.crear(request, authHeader));
    }

    @Operation(summary = "Actualizar curso")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<CursoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarCurso request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(cursoService.actualizar(id, request, authHeader));
    }

    @Operation(summary = "Eliminar curso")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
