package cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.TipoApoderado;

public record ApoderadoDTO(
        Long id,
        Long idEstudiante,
        Long idUsuario,
        TipoApoderado tipo,
        String nombre,
        String apellido,
        String rut,
        String email,
        String telefono,
        String parentesco) {
}
