package cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto;

import java.math.BigDecimal;
import java.util.List;

/** Boletín de una asignatura: las notas del estudiante y su promedio ponderado (null si no hay ponderación). */
public record BoletinAsignaturaDTO(
        Long idAsignatura,
        String nombreAsignatura,
        BigDecimal promedio,
        List<NotaBoletinDTO> notas) {
}
