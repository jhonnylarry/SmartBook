package cl.smartbook.gestion_estudiante.client.dto;

import lombok.Data;

@Data
public class UsuarioCreadoResponse {

    private Long id;
    private String username;
    private String email;
    private String rol;
    private Boolean activo;
}
