package cl.smartbook.evento_calendario.modulo_gestion_eventos.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.dto.EventoDto;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.ActualizarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.AgregarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.service.EventoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Eventos", description = "Gestión del calendario escolar")
@RestController
@RequestMapping("/api/v1/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService service;

    @Operation(summary = "Mi calendario: eventos visibles para el usuario autenticado según su rol")
    @GetMapping("/mi-calendario")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventoDto>> miCalendario(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(service.miCalendario(desde, hasta, extraerUserId(), rolDesdeJwt(), authHeader));
    }

    @Operation(summary = "Listar TODOS los eventos sin filtrar (vista global; solo dirección)")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    public ResponseEntity<List<EventoDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener evento por ID (solo dirección; los demás roles usan /mi-calendario)")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    public ResponseEntity<EventoDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Listar eventos en un rango sin filtrar por usuario (solo dirección)")
    @GetMapping("/rango")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    public ResponseEntity<List<EventoDto>> listarPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(service.listarPorRango(desde, hasta));
    }

    @Operation(summary = "Listar eventos por tipo sin filtrar por usuario (solo dirección)")
    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    public ResponseEntity<List<EventoDto>> listarPorTipo(@PathVariable TipoEvento tipo) {
        return ResponseEntity.ok(service.listarPorTipo(tipo));
    }

    @Operation(summary = "Listar eventos de una asignatura (solo eventos de ámbito ASIGNATURA de esa asignatura)")
    @GetMapping("/asignatura/{idAsignatura}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventoDto>> listarPorAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(service.listarPorAsignatura(idAsignatura));
    }

    @Operation(summary = "Listar eventos globales (ámbito GLOBAL: visibles para todo el colegio)")
    @GetMapping("/globales")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventoDto>> listarGlobales() {
        return ResponseEntity.ok(service.listarGlobales());
    }

    @Operation(summary = "Feed combinado: globales + asignaturas indicadas (solo dirección)")
    @GetMapping("/feed")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    public ResponseEntity<List<EventoDto>> listarFeed(
            @RequestParam(required = false) List<Long> asignaturas) {
        return ResponseEntity.ok(service.listarFeed(asignaturas));
    }

    @Operation(summary = "Crear nuevo evento (autorización por ámbito en el servicio)")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventoDto> crear(
            @Valid @RequestBody AgregarEvento request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crear(request, extraerUserId(), rolDesdeJwt(), authHeader));
    }

    @Operation(summary = "Actualizar evento (solo el creador o dirección)")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventoDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEvento request) {
        return ResponseEntity.ok(service.actualizar(id, request, extraerUserId(), rolDesdeJwt()));
    }

    @Operation(summary = "Eliminar evento (solo el creador o dirección)")
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id, extraerUserId(), rolDesdeJwt());
        return ResponseEntity.noContent().build();
    }

    /** idUsuario del JWT (claim sub) expuesto por JwtAuthFilter en Authentication.details. */
    private Long extraerUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return null;
        }
        try {
            return Long.parseLong(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** Rol del usuario autenticado desde el JWT (authority ROLE_<rol>). */
    private String rolDesdeJwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            for (GrantedAuthority a : auth.getAuthorities()) {
                String authority = a.getAuthority();
                if (authority != null && authority.startsWith("ROLE_")) {
                    return authority.substring("ROLE_".length());
                }
            }
        }
        return "";
    }
}
