package cl.smartbook.reportes.config;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        return buildError(HttpStatus.UNAUTHORIZED.value(), "Token invalido o ausente", req.getRequestURI());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildError(HttpStatus.FORBIDDEN.value(), "Permiso insuficiente", req.getRequestURI());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest req) {
        return buildError(HttpStatus.NOT_FOUND.value(), ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, Object>> handleResponseStatus(
            ResponseStatusException ex, HttpServletRequest req) {
        return buildError(ex.getStatusCode().value(), ex.getReason(), req.getRequestURI());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return buildError(HttpStatus.BAD_REQUEST.value(), "Cuerpo de la petición inválido o malformado", req.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return buildError(HttpStatus.BAD_REQUEST.value(), "Parámetro inválido: '" + ex.getName() + "' debe ser numérico", req.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest req) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno del servidor", req.getRequestURI());
    }

    private ResponseEntity<Map<String, Object>> buildError(int status, String message, String path) {
        var body = Map.<String, Object>of(
                "timestamp", Instant.now().toString(),
                "status", status,
                "message", message != null ? message : "Error",
                "path", path,
                "traceId", UUID.randomUUID().toString()
        );
        return ResponseEntity.status(status).body(body);
    }
}
