package cl.smartbook.gestion_academica.modulo_docente_especialidad.model.dto;

import java.util.List;

/** Especialidades (materias) de un docente, agrupadas. */
public record DocenteEspecialidadesDTO(Long idDocente, List<String> materias) {
}
