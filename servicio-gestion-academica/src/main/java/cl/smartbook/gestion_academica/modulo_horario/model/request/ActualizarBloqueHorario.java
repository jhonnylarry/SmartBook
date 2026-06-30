package cl.smartbook.gestion_academica.modulo_horario.model.request;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import cl.smartbook.gestion_academica.modulo_horario.model.entity.DiaSemana;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarBloqueHorario {

    @NotNull
    private Long idAsignatura;

    @NotNull
    private DiaSemana diaSemana;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaInicio;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaFin;

    @Size(max = 50)
    private String sala;
}
