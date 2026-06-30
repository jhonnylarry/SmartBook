package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CursoDTO(
        Long id,
        String nombre,
        Integer anio,
        Long idDocenteJefe,
        String nivel
) {}
