package cl.smartbook.gestion_estudiante.client;

public class UsuarioYaExisteException extends RuntimeException {

    public UsuarioYaExisteException(String message) {
        super(message);
    }
}
