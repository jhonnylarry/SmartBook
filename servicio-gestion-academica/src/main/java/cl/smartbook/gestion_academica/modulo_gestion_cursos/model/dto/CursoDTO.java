package cl.smartbook.gestion_academica.modulo_gestion_cursos.model.dto;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;

public record CursoDTO(
        Long id,
        String nombre,
        Integer anio,
        Long idDocenteJefe,
        NivelEnsenanza nivel
) {}
