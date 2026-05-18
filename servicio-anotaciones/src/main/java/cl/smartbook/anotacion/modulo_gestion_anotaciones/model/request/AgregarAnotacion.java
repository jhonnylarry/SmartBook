package cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request;

import java.time.LocalDateTime;

import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.GravedadAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.TipoAnotacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarAnotacion {

    @NotNull
    private Long idEstudiante;

    @NotNull
    private Long idDocente;

    @NotNull
    private TipoAnotacion tipo;

    @NotNull
    private GravedadAnotacion gravedad;

    @NotBlank
    @Size(max = 1000)
    private String descripcion;

    private LocalDateTime fecha;
}
