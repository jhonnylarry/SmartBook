package cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request;

import java.time.LocalDateTime;

import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.GravedadAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.TipoAnotacion;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarAnotacion {

    private TipoAnotacion tipo;

    private GravedadAnotacion gravedad;

    @Size(max = 1000)
    private String descripcion;

    private LocalDateTime fecha;
}
