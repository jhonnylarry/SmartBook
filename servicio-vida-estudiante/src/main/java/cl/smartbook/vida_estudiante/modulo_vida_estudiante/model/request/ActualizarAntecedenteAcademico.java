package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarAntecedenteAcademico {

    @Size(max = 200)
    private String colegioProcedencia;

    private LocalDate fechaIngreso;

    @Size(max = 100)
    private String viveCon;

    @DecimalMin("1.0")
    @DecimalMax("7.0")
    private BigDecimal promedioGeneral;
}
