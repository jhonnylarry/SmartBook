package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarAntecedenteFamiliar {

    @Size(max = 100)
    private String nombre;

    @Size(max = 50)
    private String parentesco;

    @Size(max = 20)
    private String telefono;

    @Size(max = 100)
    private String ocupacion;

    private Boolean esContactoEmergencia;
}
