package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarObjetivoAprendizaje {

    @Size(max = 50)
    private String codigo;

    @Size(max = 1000)
    private String descripcion;

    private Long idAsignatura;

    @Size(max = 50)
    private String nivel;
}
