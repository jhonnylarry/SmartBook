package cl.smartbook.gestion_academica.modulo_docente_especialidad.model.request;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Reemplaza el conjunto completo de especialidades de un docente. */
@Data
public class ActualizarEspecialidades {

    @NotNull
    private List<@Size(max = 120) String> materias = new ArrayList<>();
}
