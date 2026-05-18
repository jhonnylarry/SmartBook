package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request;

import java.time.LocalDateTime;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarEvento {

    @Size(max = 150)
    private String titulo;

    @Size(max = 500)
    private String descripcion;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private TipoEvento tipo;

    private Long idCreador;
}
