package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarObjetivoAprendizaje {

    @NotBlank
    @Size(max = 50)
    private String codigo;

    @NotBlank
    @Size(max = 1000)
    private String descripcion;

    @NotNull
    private Long idAsignatura;

    @NotBlank
    @Size(max = 50)
    private String nivel;
}
