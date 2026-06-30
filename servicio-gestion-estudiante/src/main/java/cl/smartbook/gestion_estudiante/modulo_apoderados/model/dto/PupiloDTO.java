package cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.TipoApoderado;

/** Vista que un apoderado tiene de uno de sus estudiantes a cargo (pupilo). */
public record PupiloDTO(
        Long idEstudiante,
        String nombreEstudiante,
        String apellidoEstudiante,
        String rut,
        Long idCurso,
        TipoApoderado tipo,
        String parentesco) {
}
