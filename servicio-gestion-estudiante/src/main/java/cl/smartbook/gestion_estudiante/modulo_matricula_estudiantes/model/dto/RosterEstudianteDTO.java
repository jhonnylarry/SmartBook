package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

/**
 * Referencia mínima de un estudiante de un curso, para el directorio de contactos de mensajería.
 * Incluye idUsuario (la cuenta auth, destinatario de los mensajes); NO incluye RUT ni fecha de
 * nacimiento (minimización de datos de menores, Ley 19.628).
 */
public record RosterEstudianteDTO(
        Long idEstudiante,
        Long idUsuario,
        String nombre,
        String apellido,
        Long idCurso
) {}
