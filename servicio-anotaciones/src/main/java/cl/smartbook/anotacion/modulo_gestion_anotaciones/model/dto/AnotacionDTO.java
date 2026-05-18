package cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto;

import java.time.LocalDateTime;

import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.GravedadAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.TipoAnotacion;

public record AnotacionDTO(
        Long id,
        Long idEstudiante,
        Long idDocente,
        TipoAnotacion tipo,
        GravedadAnotacion gravedad,
        String descripcion,
        LocalDateTime fecha,
        LocalDateTime fechaCreacion
) {}
