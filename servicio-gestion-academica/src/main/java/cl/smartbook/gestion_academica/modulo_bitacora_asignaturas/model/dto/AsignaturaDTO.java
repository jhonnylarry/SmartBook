package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto;

public record AsignaturaDTO(
        Long id,
        String nombre,
        Long idCurso,
        Long idDocente
) {}
