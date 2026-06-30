package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApoderadoDTO(
        Long id,
        Long idEstudiante,
        Long idUsuario,
        String tipo,
        String nombre,
        String apellido,
        String rut,
        String email,
        String telefono,
        String parentesco
) {}
