package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto;

import java.time.LocalDateTime;

public record DocumentoAdjuntoDTO(
        Long id,
        Long idHojaVida,
        String nombre,
        String tipoMime,
        String url,
        Long subidoPor,
        LocalDateTime fechaCarga) {
}
