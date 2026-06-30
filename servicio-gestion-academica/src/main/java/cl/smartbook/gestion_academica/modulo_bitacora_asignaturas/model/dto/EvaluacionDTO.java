package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EvaluacionDTO(
        Long id,
        String nombre,
        LocalDate fecha,
        Long idAsignatura,
        BigDecimal ponderacion,
        Long idPeriodo
) {}
