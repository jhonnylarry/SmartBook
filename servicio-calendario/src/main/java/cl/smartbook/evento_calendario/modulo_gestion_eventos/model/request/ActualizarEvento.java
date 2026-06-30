package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request;

import java.time.LocalDateTime;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // Nota: el scope (idAsignatura) se fija al crear y NO se modifica en update,
    // por eso no se expone aquí (evita un contrato engañoso y futuras regresiones).

    @JsonIgnore
    private Long idCreador;
}
