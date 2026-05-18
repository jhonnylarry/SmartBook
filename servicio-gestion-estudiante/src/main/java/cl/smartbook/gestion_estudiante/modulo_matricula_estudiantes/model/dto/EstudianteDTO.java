package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

import java.time.LocalDate;

public record EstudianteDTO(
        Long id,
        Long idUsuario,
        String nombre,
        String apellido,
        String rut,
        LocalDate fechaNacimiento) {
}
