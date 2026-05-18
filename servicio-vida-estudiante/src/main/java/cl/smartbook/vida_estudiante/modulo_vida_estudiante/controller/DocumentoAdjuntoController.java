package cl.smartbook.vida_estudiante.modulo_vida_estudiante.controller;

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

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.DocumentoAdjuntoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarDocumentoAdjunto;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarDocumentoAdjunto;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.service.DocumentoAdjuntoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Documentos Adjuntos", description = "Gestion de documentos adjuntos (solo metadata, sin upload de bytes)")
@RestController
@RequestMapping("/api/v1/documentos-adjuntos")
@RequiredArgsConstructor
public class DocumentoAdjuntoController {

    private final DocumentoAdjuntoService service;

    @Operation(summary = "Listar todos los documentos adjuntos")
    @GetMapping
    public ResponseEntity<List<DocumentoAdjuntoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener documento adjunto por ID")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentoAdjuntoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Listar documentos adjuntos por hoja de vida")
    @GetMapping("/hoja-vida/{idHojaVida}")
    public ResponseEntity<List<DocumentoAdjuntoDTO>> listarPorHojaVida(@PathVariable Long idHojaVida) {
        return ResponseEntity.ok(service.listarPorHojaVida(idHojaVida));
    }

    @Operation(summary = "Registrar metadata de documento adjunto")
    @ApiResponse(responseCode = "201", description = "Creado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<DocumentoAdjuntoDTO> crear(@Valid @RequestBody AgregarDocumentoAdjunto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Actualizar metadata de documento adjunto")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<DocumentoAdjuntoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarDocumentoAdjunto request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @Operation(summary = "Eliminar documento adjunto")
    @ApiResponse(responseCode = "204", description = "Eliminado")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
