package cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto;

import java.math.BigDecimal;

public record NotaDTO(
        Long id,
        Long idEvaluacion,
        Long idEstudiante,
        BigDecimal calificacion
) {}
