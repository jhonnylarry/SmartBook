package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AntecedenteMedicoDTO(
        Long id,
        Long idHojaVida,
        String tipoSangre,
        String alergias,
        String enfermedadesCronicas,
        String medicacion,
        String previsionSalud
) {}
