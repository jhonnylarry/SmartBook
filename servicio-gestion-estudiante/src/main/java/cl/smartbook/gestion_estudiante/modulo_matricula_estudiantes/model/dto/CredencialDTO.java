package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto;

public record CredencialDTO(
        String rol,
        String username,
        String email,
        String passwordTemporal) {
}
