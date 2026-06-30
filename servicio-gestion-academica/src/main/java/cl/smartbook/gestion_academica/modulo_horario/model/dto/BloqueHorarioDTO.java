package cl.smartbook.gestion_academica.modulo_horario.model.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import cl.smartbook.gestion_academica.modulo_horario.model.entity.DiaSemana;

public record BloqueHorarioDTO(
        Long id,
        Long idAsignatura,
        String nombreAsignatura,
        DiaSemana diaSemana,
        @JsonFormat(pattern = "HH:mm") LocalTime horaInicio,
        @JsonFormat(pattern = "HH:mm") LocalTime horaFin,
        String sala) {
}
