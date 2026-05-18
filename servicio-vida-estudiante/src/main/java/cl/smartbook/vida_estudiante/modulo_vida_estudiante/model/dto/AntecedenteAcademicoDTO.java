package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AntecedenteAcademicoDTO(
        Long id,
        Long idHojaVida,
        String colegioProcedencia,
        LocalDate fechaIngreso,
        String viveCon,
        BigDecimal promedioGeneral) {
}
