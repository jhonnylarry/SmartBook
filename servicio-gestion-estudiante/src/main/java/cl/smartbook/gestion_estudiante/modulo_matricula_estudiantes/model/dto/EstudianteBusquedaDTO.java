package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

/**
 * Resultado del buscador avanzado de estudiantes (nombre + RUT + curso vigente).
 * {@code idCurso} es el curso de la matrícula VIGENTE del estudiante (nullable si no tiene una).
 * El nombre del curso lo resuelve el frontend con el catálogo de /cursos (gestion-estudiante solo
 * guarda el id del curso, sin FK a gestion-academica).
 */
public record EstudianteBusquedaDTO(
        Long id,
        Long idUsuario,
        String nombre,
        String apellido,
        String rut,
        Long idCurso
) {}
