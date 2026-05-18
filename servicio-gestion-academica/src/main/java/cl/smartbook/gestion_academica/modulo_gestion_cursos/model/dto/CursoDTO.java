package cl.smartbook.gestion_academica.modulo_gestion_cursos.model.dto;

public record CursoDTO(
        Long id,
        String nombre,
        Integer anio,
        Long idDocenteJefe
) {}
