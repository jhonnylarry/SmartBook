package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.dto;

public record ObjetivoAprendizajeDTO(
        Long id,
        String codigo,
        String descripcion,
        Long idAsignatura,
        String nivel
) {}
