package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto;

public record AntecedenteFamiliarDTO(
        Long id,
        Long idHojaVida,
        String nombre,
        String parentesco,
        String telefono,
        String ocupacion,
        boolean esContactoEmergencia) {
}
