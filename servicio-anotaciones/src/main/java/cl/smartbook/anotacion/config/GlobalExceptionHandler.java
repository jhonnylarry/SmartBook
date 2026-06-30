package cl.smartbook.anotacion.config;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.server.ResponseStatusException;

import cl.smartbook.anotacion.client.ReferenciaInvalidaException;
import cl.smartbook.anotacion.client.ServicioNoDisponibleException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiError(
            Instant timestamp,
            int status,
            String code,
            String message,
            String path
    ) {}

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex,
                                                          HttpServletRequest request) {
        log.warn("[anotacion] AuthenticationException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError(
                Instant.now(), 401, "UNAUTHORIZED", "Token inválido o ausente", request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex,
                                                        HttpServletRequest request) {
        log.warn("[anotacion] AccessDeniedException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiError(
                Instant.now(), 403, "FORBIDDEN", "Permiso insuficiente", request.getRequestURI()));
    }

    @ExceptionHandler(ReferenciaInvalidaException.class)
    public ResponseEntity<ApiError> handleReferenciaInvalida(ReferenciaInvalidaException ex,
                                                              HttpServletRequest request) {
        log.warn("[anotacion] ReferenciaInvalida: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                ex.getMessage(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(ServicioNoDisponibleException.class)
    public ResponseEntity<ApiError> handleServicioNoDisponible(ServicioNoDisponibleException ex,
                                                                HttpServletRequest request) {
        log.error("[anotacion] ServicioNoDisponible: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiError(
                Instant.now(),
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "SERVICE_UNAVAILABLE",
                ex.getMessage(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFound(EntityNotFoundException ex,
                                                          HttpServletRequest request) {
        log.warn("[anotacion] EntityNotFound: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError(
                Instant.now(),
                HttpStatus.NOT_FOUND.value(),
                "NOT_FOUND",
                ex.getMessage(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex,
                                                          HttpServletRequest request) {
        var status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
        log.warn("[anotacion] {} {}", status.value(), ex.getReason());
        return ResponseEntity.status(status).body(new ApiError(
                Instant.now(),
                status.value(),
                status.name(),
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
                                                      HttpServletRequest request) {
        var first = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Datos de entrada invalidos");
        log.warn("[anotacion] Validation error: {}", first);
        return ResponseEntity.badRequest().body(new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                first,
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleNotReadable(HttpMessageNotReadableException ex,
                                                       HttpServletRequest request) {
        log.warn("[anotacion] HttpMessageNotReadable: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                "Cuerpo de la petición inválido o malformado",
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                        HttpServletRequest request) {
        log.warn("[anotacion] MethodArgumentTypeMismatch: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                "Parámetro inválido: '" + ex.getName() + "' debe ser numérico",
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex,
                                                           HttpServletRequest request) {
        log.warn("[anotacion] IllegalArgument: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                "Solicitud inválida",
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(WebClientException.class)
    public ResponseEntity<ApiError> handleWebClient(WebClientException ex, HttpServletRequest request) {
        log.error("[anotacion] Error comunicando con servicio externo: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiError(
                Instant.now(),
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "SERVICE_UNAVAILABLE",
                "Servicio externo no disponible, intente nuevamente",
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("[anotacion] Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(new ApiError(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Error interno del servidor",
                request.getRequestURI()
        ));
    }
}
