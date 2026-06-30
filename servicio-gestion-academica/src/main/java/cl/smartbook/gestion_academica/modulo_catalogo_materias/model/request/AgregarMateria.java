package cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarMateria {

    @NotBlank
    @Size(max = 120)
    private String nombre;

    @NotNull
    private NivelEnsenanza nivel;

    @Size(max = 120)
    private String area;
}
