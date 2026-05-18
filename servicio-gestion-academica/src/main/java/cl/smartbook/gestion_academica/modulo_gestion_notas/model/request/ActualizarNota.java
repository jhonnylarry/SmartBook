package cl.smartbook.gestion_academica.modulo_gestion_notas.model.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizarNota {

    @NotNull
    private Long idEvaluacion;

    @NotNull
    private Long idEstudiante;

    @NotNull
    @DecimalMin("1.0")
    @DecimalMax("7.0")
    private BigDecimal calificacion;
}
