package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request;

import java.time.LocalDateTime;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarEvento {

    @NotBlank
    @Size(max = 150)
    private String titulo;

    @Size(max = 500)
    private String descripcion;

    @NotNull
    private LocalDateTime fechaInicio;

    @NotNull
    private LocalDateTime fechaFin;

    @NotNull
    private TipoEvento tipo;

    /** Destinatario del evento. La validación cruzada (qué id exige cada ámbito) va en el service. */
    @NotNull
    private AmbitoEvento ambito;

    private Long idAsignatura;
    private Long idCurso;
    private Long idEstudiante;

    @JsonIgnore
    private Long idCreador;
}
