package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DocumentoAdjuntoDTO(
        Long id,
        Long idHojaVida,
        String nombre,
        String tipoMime,
        String url,
        String subidoPor,
        LocalDateTime fechaCarga
) {}
