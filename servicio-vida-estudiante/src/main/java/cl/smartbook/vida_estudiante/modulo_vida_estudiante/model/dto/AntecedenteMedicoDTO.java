package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto;

public record AntecedenteMedicoDTO(
        Long id,
        Long idHojaVida,
        String tipoSangre,
        String alergias,
        String enfermedadesCronicas,
        String medicacion,
        String previsionSalud) {
}
