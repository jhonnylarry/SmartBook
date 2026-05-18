package cl.smartbook.mensajeria.modulo_mensajes.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AgregarMensajeRequest(
        // idRemitente se toma del SecurityContext (JWT sub). Campo ignorado si viene en el body.
        Long idRemitente,

        @NotNull(message = "El idDestinatario es obligatorio")
        Long idDestinatario,

        @NotBlank(message = "El asunto no puede estar vacio")
        @Size(max = 200, message = "El asunto no puede superar los 200 caracteres")
        String asunto,

        @NotBlank(message = "El contenido no puede estar vacio")
        @Size(max = 2000, message = "El contenido no puede superar los 2000 caracteres")
        String contenido
) {}
