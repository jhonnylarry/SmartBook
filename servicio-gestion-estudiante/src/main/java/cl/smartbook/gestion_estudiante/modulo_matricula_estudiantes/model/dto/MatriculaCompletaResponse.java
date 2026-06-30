package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

import java.util.List;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto.ApoderadoDTO;

public record MatriculaCompletaResponse(
        EstudianteDTO estudiante,
        ApoderadoDTO apoderadoTitular,
        ApoderadoDTO tutor,
        MatriculaDTO matricula,
        List<CredencialDTO> credenciales) {
}
