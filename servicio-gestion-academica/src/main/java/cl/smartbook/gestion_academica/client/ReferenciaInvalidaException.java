package cl.smartbook.gestion_academica.client;

public class ReferenciaInvalidaException extends RuntimeException {

    public ReferenciaInvalidaException(String mensaje) {
        super(mensaje);
    }
}
