package cl.smartbook.gestion_estudiante.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Autenticación de servicio-a-servicio para las LECTURAS internas que hace el agregador de perfil
 * (anotacion → gestion-estudiante) en nombre de roles que no pueden leer directo (APODERADO/ESTUDIANTE).
 * Si llega un X-Internal-Token válido en un GET/HEAD, autentica como SERVICIO_INTERNO (solo lectura).
 * El anti-IDOR real lo aplica anotacion ANTES de llamar. El gateway elimina este header de las
 * peticiones entrantes (default-filter RemoveRequestHeader), así que no es forjable desde afuera.
 */
@Slf4j
@Component
public class InternalTokenFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Internal-Token";

    private final String expectedToken;

    public InternalTokenFilter(@Value("${smartbook.internal.service-token}") String expectedToken) {
        this.expectedToken = expectedToken;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        String token = request.getHeader(HEADER);

        if (token != null
                && !token.isBlank()
                && constantTimeEquals(token, expectedToken)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String method = request.getMethod();
            if (!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) {
                log.warn("InternalToken rechazado en método no-GET: {} {}", method, request.getRequestURI());
                chain.doFilter(request, response);
                return;
            }

            var auth = new UsernamePasswordAuthenticationToken(
                    "servicio-interno", null,
                    List.of(new SimpleGrantedAuthority("ROLE_SERVICIO_INTERNO")));
            auth.setDetails("servicio-interno");
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    /** Comparación en tiempo constante para no filtrar el secreto por timing attack. */
    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}
