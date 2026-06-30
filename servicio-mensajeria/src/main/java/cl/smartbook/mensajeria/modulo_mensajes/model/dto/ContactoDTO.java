package cl.smartbook.mensajeria.modulo_mensajes.model.dto;

/**
 * Contacto permitido para el usuario autenticado, según la matriz de permisos.
 * `origen` describe la relación (COMPAÑERO, DOCENTE, ALUMNO, APODERADO, STAFF, GENERAL) para agruparlos en la UI.
 */
public record ContactoDTO(Long idUsuario, String nombre, String rol, String origen) {}
