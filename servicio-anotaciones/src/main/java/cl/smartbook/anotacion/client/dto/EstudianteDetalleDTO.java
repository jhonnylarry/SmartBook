package cl.smartbook.anotacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EstudianteDetalleDTO(
        Long id,
        String nombre,
        String apellido,
        String rut,
        String fechaNacimiento,
        String direccion,
        String telefono,
        List<MatriculaDTO> matriculas
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MatriculaDTO(Long idCurso, String estado) {}
}
