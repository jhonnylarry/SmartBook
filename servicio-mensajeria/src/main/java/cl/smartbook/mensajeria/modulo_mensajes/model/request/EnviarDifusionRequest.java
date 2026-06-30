package cl.smartbook.mensajeria.modulo_mensajes.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Envío a un grupo de difusión: el id del grupo proviene de GET /mensajes/grupos. */
public record EnviarDifusionRequest(
        @NotBlank String grupoId,
        @NotBlank @Size(max = 200) String asunto,
        @NotBlank @Size(max = 2000) String contenido
) {}
