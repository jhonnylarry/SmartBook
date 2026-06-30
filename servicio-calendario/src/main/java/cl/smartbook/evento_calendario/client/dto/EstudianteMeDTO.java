package cl.smartbook.evento_calendario.client.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Ficha del estudiante autenticado (gestion-estudiante /estudiantes/me) — para derivar su curso vigente. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record EstudianteMeDTO(Long id, Long idUsuario, List<MatriculaRefDTO> matriculas) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MatriculaRefDTO(Long idCurso, String estado) {}
}
