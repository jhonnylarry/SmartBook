package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarAsignatura {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    private Long idCurso;

    @NotNull
    private Long idDocente;
}
