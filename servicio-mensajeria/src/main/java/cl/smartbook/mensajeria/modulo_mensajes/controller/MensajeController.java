package cl.smartbook.mensajeria.modulo_mensajes.controller;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.MensajeDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.AgregarMensajeRequest;
import cl.smartbook.mensajeria.modulo_mensajes.service.MensajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mensajes")
@RequiredArgsConstructor
@Tag(name = "Mensajes", description = "Mensajeria interna entre usuarios del colegio")
public class MensajeController {

    private final MensajeService mensajeService;

    @Operation(summary = "Enviar un mensaje")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<MensajeDTO> enviar(
            @Valid @RequestBody AgregarMensajeRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mensajeService.enviar(request, authHeader));
    }

    @Operation(summary = "Detalle de un mensaje")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<MensajeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mensajeService.getById(id));
    }

    @Operation(summary = "Mensajes recibidos del usuario autenticado")
    @GetMapping("/recibidos")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<List<MensajeDTO>> recibidos() {
        return ResponseEntity.ok(mensajeService.listarRecibidos(extraerUserId()));
    }

    @Operation(summary = "Mensajes enviados del usuario autenticado")
    @GetMapping("/enviados")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<List<MensajeDTO>> enviados() {
        return ResponseEntity.ok(mensajeService.listarEnviados(extraerUserId()));
    }

    @Operation(summary = "Marcar mensaje como leido")
    @PutMapping("/{id}/leer")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<MensajeDTO> marcarLeido(@PathVariable Long id) {
        return ResponseEntity.ok(mensajeService.marcarLeido(id));
    }

    @Operation(summary = "Eliminar un mensaje")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mensajeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Long extraerUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getDetails().toString());
    }
}
