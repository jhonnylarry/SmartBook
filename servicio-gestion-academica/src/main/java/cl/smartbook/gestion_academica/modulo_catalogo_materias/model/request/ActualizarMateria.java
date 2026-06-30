package cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarMateria {

    @Size(max = 120)
    private String nombre;

    private NivelEnsenanza nivel;

    @Size(max = 120)
    private String area;

    private Boolean activo;
}
