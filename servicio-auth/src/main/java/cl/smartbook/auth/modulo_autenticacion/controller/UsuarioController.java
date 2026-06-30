package cl.smartbook.auth.modulo_autenticacion.controller;

import java.util.List;
import java.util.Set;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.auth.modulo_autenticacion.model.dto.PerfilPublicoDto;
import cl.smartbook.auth.modulo_autenticacion.model.dto.UsuarioDto;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import cl.smartbook.auth.modulo_autenticacion.model.request.ActualizarUsuario;
import cl.smartbook.auth.modulo_autenticacion.model.request.AgregarUsuario;
import cl.smartbook.auth.modulo_autenticacion.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Usuarios", description = "CRUD de usuarios del sistema")
@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Listar todos los usuarios")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listar() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }

    @Operation(summary = "Perfiles públicos de usuarios por IDs (username + rol)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/perfiles")
    public ResponseEntity<List<PerfilPublicoDto>> perfiles(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(usuarioService.perfiles(ids));
    }

    @Operation(summary = "Perfiles de usuarios por rol (directorio de contactos; acotado por whitelist, nunca expone menores)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/por-rol")
    public ResponseEntity<List<PerfilPublicoDto>> porRol(@RequestParam(required = false) Set<Rol> roles) {
        return ResponseEntity.ok(usuarioService.usuariosPorRol(roles));
    }

    @Operation(summary = "Obtener usuario por ID")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @Operation(summary = "Verifica si un usuario existe (uso interno entre servicios; no expone datos)")
    @ApiResponse(responseCode = "204", description = "El usuario existe")
    @ApiResponse(responseCode = "404", description = "El usuario no existe")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','DOCENTE','INSPECTOR')")
    @GetMapping("/{id}/existe")
    public ResponseEntity<Void> existe(@PathVariable Long id) {
        return usuarioService.existe(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Crear nuevo usuario STAFF (administrador/director/docente/inspector/administrativo)")
    @ApiResponse(responseCode = "201", description = "Usuario creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos, duplicado, o rol estudiante/apoderado (van por matrícula)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<UsuarioDto> crear(@Valid @RequestBody AgregarUsuario request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.agregar(request));
    }

    @Operation(summary = "Crear cuenta interna de matrícula (solo ESTUDIANTE/APODERADO)",
            description = "Usado por gestion-estudiante al matricular; no crea roles staff.")
    @ApiResponse(responseCode = "201", description = "Usuario creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos, duplicado, o rol no permitido (solo estudiante/apoderado)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping("/internos")
    public ResponseEntity<UsuarioDto> crearInterno(@Valid @RequestBody AgregarUsuario request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.agregarInterno(request));
    }

    @Operation(summary = "Actualizar usuario existente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuario request) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar usuario")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
