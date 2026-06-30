package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.dto;

import java.time.LocalDateTime;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;

public record EventoDto(
        Long id,
        String titulo,
        String descripcion,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        TipoEvento tipo,
        AmbitoEvento ambito,
        Long idAsignatura,
        Long idCurso,
        Long idEstudiante,
        Long idCreador,
        LocalDateTime fechaCreacion
) {}
