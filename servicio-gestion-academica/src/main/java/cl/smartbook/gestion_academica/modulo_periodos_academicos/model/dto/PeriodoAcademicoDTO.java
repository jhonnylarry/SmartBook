package cl.smartbook.gestion_academica.modulo_periodos_academicos.model.dto;

import java.time.LocalDate;

public record PeriodoAcademicoDTO(
        Long id,
        String nombre,
        Integer anio,
        LocalDate fechaInicio,
        LocalDate fechaFin
) {}
