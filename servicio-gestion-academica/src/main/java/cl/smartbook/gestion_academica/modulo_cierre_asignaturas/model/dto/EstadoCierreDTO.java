package cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.dto;

import java.time.LocalDateTime;

public record EstadoCierreDTO(
        Long idAsignatura,
        Long idPeriodo,
        boolean cerrada,
        LocalDateTime fechaCierre
) {}
