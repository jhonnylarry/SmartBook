package cl.smartbook.mensajeria.modulo_mensajes.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MensajeDTO(
        Long id,
        Long idRemitente,
        Long idDestinatario,
        String asunto,
        String contenido,
        LocalDateTime fechaEnvio,
        Boolean leido,
        UUID loteDifusion
) {}
