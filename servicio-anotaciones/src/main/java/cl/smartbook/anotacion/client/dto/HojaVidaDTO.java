package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HojaVidaDTO(
        Long id,
        Long idEstudiante,
        Integer anioAcademico,
        String observaciones,
        LocalDateTime fechaCreacion
) {}
