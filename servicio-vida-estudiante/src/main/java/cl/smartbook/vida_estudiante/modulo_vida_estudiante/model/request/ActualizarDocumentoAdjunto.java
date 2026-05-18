package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarDocumentoAdjunto {

    @Size(max = 200)
    private String nombre;

    @Size(max = 100)
    private String tipoMime;

    @Pattern(regexp = "^https?://[\\w\\-.]+(:\\d+)?(/.*)?$", message = "URL invalida; debe ser http o https")
    @Size(max = 500)
    private String url;

    private Long subidoPor;
}
