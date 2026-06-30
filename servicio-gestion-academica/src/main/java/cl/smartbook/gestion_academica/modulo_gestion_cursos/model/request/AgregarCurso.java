package cl.smartbook.gestion_academica.modulo_gestion_cursos.model.request;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarCurso {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    @Min(2000)
    private Integer anio;

    @NotNull
    private Long idDocenteJefe;

    private NivelEnsenanza nivel;
}
