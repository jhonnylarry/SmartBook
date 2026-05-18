package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

import java.time.LocalDate;
import java.util.List;

public record EstudianteDetalleDTO(
        Long id,
        Long idUsuario,
        String nombre,
        String apellido,
        String rut,
        LocalDate fechaNacimiento,
        List<MatriculaDTO> matriculas) {
}
