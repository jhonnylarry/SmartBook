package cl.smartbook.gestion_academica.modulo_catalogo_materias.model.dto;

import java.time.LocalDateTime;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;

public record MateriaCatalogoDTO(
        Long id,
        String nombre,
        NivelEnsenanza nivel,
        String area,
        boolean activo,
        LocalDateTime fechaCreacion
) {}
