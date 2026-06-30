package cl.smartbook.mensajeria.modulo_mensajes.controller;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.ContactoDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.dto.DifusionResultDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.dto.GrupoDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.dto.MensajeDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.AgregarMensajeRequest;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.EnviarDifusionRequest;
import cl.smartbook.mensajeria.modulo_mensajes.service.DifusionService;
import cl.smartbook.mensajeria.modulo_mensajes.service.DirectorioContactosService;
import cl.smartbook.mensajeria.modulo_mensajes.service.MensajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mensajes")
@RequiredArgsConstructor
@Tag(name = "Mensajes", description = "Mensajeria interna entre usuarios del colegio")
public class MensajeController {

    private final MensajeService mensajeService;
    private final DirectorioContactosService directorio;
    private final DifusionService difusionService;

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
        return ResponseEntity.ok(mensajeService.getById(id, extraerUserId()));
    }

    @Operation(summary = "Enviar una difusión a un grupo predefinido")
    @PostMapping("/difusion")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<DifusionResultDTO> difundir(
            @Valid @RequestBody EnviarDifusionRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(difusionService.enviarGrupo(extraerUserId(), rolDesdeJwt(), request, authHeader));
    }

    @Operation(summary = "Contactos individuales permitidos según la matriz de permisos")
    @GetMapping("/contactos")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<List<ContactoDTO>> contactos(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(directorio.contactos(extraerUserId(), rolDesdeJwt(), authHeader));
    }

    @Operation(summary = "Grupos de difusión permitidos para el remitente")
    @GetMapping("/grupos")
    @PreAuthorize("isAuthenticated()")
    ResponseEntity<List<GrupoDTO>> grupos(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(directorio.grupos(extraerUserId(), rolDesdeJwt(), authHeader));
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
        return ResponseEntity.ok(mensajeService.marcarLeido(id, extraerUserId()));
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
