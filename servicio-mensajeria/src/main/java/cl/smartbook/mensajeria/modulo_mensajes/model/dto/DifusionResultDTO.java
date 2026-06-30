package cl.smartbook.mensajeria.modulo_mensajes.model.dto;

import java.util.UUID;

/** Resultado de una difusión: cuántos destinatarios y el lote que correlaciona las copias. */
public record DifusionResultDTO(UUID loteDifusion, String grupoId, int enviados) {}
