package cl.smartbook.gestion_academica.client;

/**
 * Estado de un recurso impide la operación (p. ej. registrar una nota en una
 * asignatura cerrada). Se mapea a 409 CONFLICT en el GlobalExceptionHandler.
 */
public class EstadoInvalidoException extends RuntimeException {

    public EstadoInvalidoException(String mensaje) {
        super(mensaje);
    }
}
