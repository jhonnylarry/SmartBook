package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AntecedenteAcademicoDTO(
        Long id,
        Long idHojaVida,
        String colegioProcedencia,
        LocalDate fechaIngreso,
        String viveCon,
        Double promedioGeneral
) {}
