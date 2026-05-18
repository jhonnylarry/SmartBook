package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarAntecedenteFamiliar {

    @NotNull
    private Long idHojaVida;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotBlank
    @Size(max = 50)
    private String parentesco;

    @Size(max = 20)
    private String telefono;

    @Size(max = 100)
    private String ocupacion;

    private boolean esContactoEmergencia;
}
