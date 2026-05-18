package cl.smartbook.evento_calendario.modulo_gestion_eventos.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @Operation(summary = "Listar todos los eventos")
    @GetMapping
    public ResponseEntity<List<EventoDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener evento por ID")
    @GetMapping("/{id}")
    public ResponseEntity<EventoDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Listar eventos en un rango de fechas")
    @GetMapping("/rango")
    public ResponseEntity<List<EventoDto>> listarPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(service.listarPorRango(desde, hasta));
    }

    @Operation(summary = "Listar eventos por tipo")
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<EventoDto>> listarPorTipo(@PathVariable TipoEvento tipo) {
        return ResponseEntity.ok(service.listarPorTipo(tipo));
    }

    @Operation(summary = "Crear nuevo evento")
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCENTE','DIRECTOR','ADMINISTRADOR')")
    public ResponseEntity<EventoDto> crear(@Valid @RequestBody AgregarEvento request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Actualizar evento")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCENTE','DIRECTOR','ADMINISTRADOR')")
    public ResponseEntity<EventoDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEvento request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @Operation(summary = "Eliminar evento")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
