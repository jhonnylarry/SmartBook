package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AntecedenteFamiliarDTO(
        Long id,
        Long idHojaVida,
        String nombre,
        String parentesco,
        String telefono,
        String ocupacion,
        Boolean esContactoEmergencia
) {}
