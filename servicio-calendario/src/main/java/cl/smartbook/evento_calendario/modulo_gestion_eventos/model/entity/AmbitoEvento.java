package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity;

/**
 * Ámbito (destinatario) de un evento del calendario. Define a quién va dirigido y, por tanto,
 * quién lo ve. El campo de referencia que aplica depende del ámbito:
 * <ul>
 *   <li>{@code GLOBAL}     — todo el colegio. Ningún id de scope.</li>
 *   <li>{@code CURSO}      — un curso completo. Usa {@code idCurso}.</li>
 *   <li>{@code ASIGNATURA} — una asignatura. Usa {@code idAsignatura}.</li>
 *   <li>{@code ESTUDIANTE} — un estudiante puntual. Usa {@code idEstudiante} (id de la entidad, no idUsuario).</li>
 *   <li>{@code PERSONAL}   — solo para el creador. Visible únicamente por {@code idCreador}.</li>
 * </ul>
 */
public enum AmbitoEvento {
    GLOBAL,
    CURSO,
    ASIGNATURA,
    ESTUDIANTE,
    PERSONAL
}
