package cl.smartbook.gestion_academica.modulo_catalogo_materias.controller;

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

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.dto.MateriaCatalogoDTO;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request.ActualizarMateria;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request.AgregarMateria;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.service.MateriaCatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Catálogo de Materias", description = "Gestión del catálogo de materias por nivel de enseñanza")
@RestController
@RequestMapping("/api/v1/materias")
@RequiredArgsConstructor
public class MateriaCatalogoController {

    private final MateriaCatalogoService materiaCatalogoService;

    @Operation(summary = "Listar todas las materias del catálogo")
    @GetMapping
    public ResponseEntity<List<MateriaCatalogoDTO>> listar() {
        return ResponseEntity.ok(materiaCatalogoService.listar());
    }

    @Operation(summary = "Listar materias por nivel de enseñanza")
    @GetMapping("/nivel/{nivel}")
    public ResponseEntity<List<MateriaCatalogoDTO>> listarPorNivel(@PathVariable NivelEnsenanza nivel) {
        return ResponseEntity.ok(materiaCatalogoService.listarPorNivel(nivel));
    }

    @Operation(summary = "Obtener materia por ID")
    @GetMapping("/{id}")
    public ResponseEntity<MateriaCatalogoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(materiaCatalogoService.buscarPorId(id));
    }

    @Operation(summary = "Agregar materia al catálogo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<MateriaCatalogoDTO> crear(@Valid @RequestBody AgregarMateria request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materiaCatalogoService.crear(request));
    }

    @Operation(summary = "Actualizar materia del catálogo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<MateriaCatalogoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarMateria request) {
        return ResponseEntity.ok(materiaCatalogoService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar materia del catálogo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        materiaCatalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
