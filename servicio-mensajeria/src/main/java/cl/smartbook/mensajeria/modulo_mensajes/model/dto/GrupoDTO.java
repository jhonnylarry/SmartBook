package cl.smartbook.mensajeria.modulo_mensajes.model.dto;

/**
 * Grupo de difusión disponible para el remitente. `id` codifica tipo y alcance
 * (p.ej. "ALUMNOS_CURSO:1", "ANUNCIO_GENERAL", "TODOS_DOCENTES"); se reenvía al enviar la difusión.
 */
public record GrupoDTO(String id, String nombre, String descripcion) {}
