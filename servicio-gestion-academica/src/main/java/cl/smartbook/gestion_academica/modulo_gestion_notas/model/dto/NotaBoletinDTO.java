package cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto;

import java.math.BigDecimal;

/** Una nota dentro del boletín: la evaluación, su ponderación y la calificación obtenida. */
public record NotaBoletinDTO(
        Long idEvaluacion,
        String nombreEvaluacion,
        BigDecimal ponderacion,
        BigDecimal calificacion) {
}
