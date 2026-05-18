package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record BitacoraClaseDTO(
        Long id,
        Long idAsignatura,
        Long idDocente,
        LocalDate fecha,
        String contenido,
        String objetivosCubiertos,
        LocalDateTime fechaCreacion
) {}
