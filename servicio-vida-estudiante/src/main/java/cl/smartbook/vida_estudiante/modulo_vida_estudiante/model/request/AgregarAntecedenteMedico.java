package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarAntecedenteMedico {

    @NotNull
    private Long idHojaVida;

    @Size(max = 5)
    private String tipoSangre;

    @Size(max = 500)
    private String alergias;

    @Size(max = 500)
    private String enfermedadesCronicas;

    @Size(max = 500)
    private String medicacion;

    @Size(max = 100)
    private String previsionSalud;
}
