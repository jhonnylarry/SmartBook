package cl.smartbook.gestion_estudiante.client.dto;

import lombok.Data;

@Data
public class CrearUsuarioRequest {

    private String username;
    private String email;
    private String password;
    private String rol;
}
