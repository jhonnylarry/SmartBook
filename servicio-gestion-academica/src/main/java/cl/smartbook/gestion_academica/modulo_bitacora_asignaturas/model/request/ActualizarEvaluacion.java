package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarEvaluacion {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private Long idAsignatura;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "100.00", inclusive = true)
    private BigDecimal ponderacion;
}
