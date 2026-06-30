package cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto;

import java.math.BigDecimal;

/** Promedio ponderado de un estudiante en una asignatura (para el libro de notas del docente). */
public record PromedioEstudianteDTO(
        Long idEstudiante,
        BigDecimal promedio,
        int cantidadNotas) {
}
