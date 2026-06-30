package cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.dto;

import java.time.LocalDateTime;

/**
 * Metadata de un documento de evaluación. NO incluye el contenido binario;
 * los bytes se obtienen con el endpoint de descarga.
 */
public record DocumentoEvaluacionDTO(
        Long id,
        Long idEvaluacion,
        String nombreArchivo,
        String tipoMime,
        Long tamanoBytes,
        Long subidoPor,
        LocalDateTime fechaCarga
) {}
