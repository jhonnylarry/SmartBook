package cl.smartbook.gestion_academica.modulo_periodos_academicos.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarPeriodo {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    @Min(2000)
    private Integer anio;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;
}
