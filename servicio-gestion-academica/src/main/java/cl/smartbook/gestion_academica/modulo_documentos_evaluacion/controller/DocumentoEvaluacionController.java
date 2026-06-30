package cl.smartbook.gestion_academica.modulo_documentos_evaluacion.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.dto.DocumentoEvaluacionDTO;
import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.entity.DocumentoEvaluacion;
import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.service.DocumentoEvaluacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Documentos de Evaluación",
        description = "PDFs adjuntos a una evaluación (p.ej. registro de prueba física)")
@RestController
@RequestMapping("/api/v1/evaluaciones")
@RequiredArgsConstructor
public class DocumentoEvaluacionController {

    private final DocumentoEvaluacionService documentoService;

    @Operation(summary = "Listar documentos (metadata) de una evaluación")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE')")
    @GetMapping("/{idEvaluacion}/documentos")
    public ResponseEntity<List<DocumentoEvaluacionDTO>> listar(@PathVariable Long idEvaluacion) {
        return ResponseEntity.ok(documentoService.listarPorEvaluacion(idEvaluacion));
    }

    @Operation(summary = "Subir un PDF a una evaluación")
    @PreAuthorize("hasAnyRole('DOCENTE','DIRECTOR','ADMINISTRADOR')")
    @PostMapping(path = "/{idEvaluacion}/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoEvaluacionDTO> subir(
            @PathVariable Long idEvaluacion,
            @RequestPart("file") MultipartFile file) {
        DocumentoEvaluacionDTO dto = documentoService.subir(idEvaluacion, file, currentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @Operation(summary = "Descargar el PDF de un documento")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE')")
    @GetMapping("/documentos/{idDoc}")
    public ResponseEntity<byte[]> descargar(@PathVariable Long idDoc) {
        DocumentoEvaluacion doc = documentoService.obtenerParaDescarga(idDoc);
        String encoded = URLEncoder.encode(doc.getNombreArchivo(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(doc.getTamanoBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"documento.pdf\"; filename*=UTF-8''" + encoded)
                .body(doc.getContenido());
    }

    @Operation(summary = "Eliminar un documento de evaluación")
    @PreAuthorize("hasAnyRole('DOCENTE','DIRECTOR','ADMINISTRADOR')")
    @DeleteMapping("/documentos/{idDoc}")
    public ResponseEntity<Void> eliminar(@PathVariable Long idDoc) {
        documentoService.eliminar(idDoc);
        return ResponseEntity.noContent().build();
    }

    /** Id del usuario autenticado (claim {@code sub}), expuesto por JwtAuthFilter en details. */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object details = auth != null ? auth.getDetails() : null;
        if (details == null) {
            return null;
        }
        try {
            return Long.valueOf(details.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
