package cl.smartbook.auth.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain) throws ServletException, IOException {

        var authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        var token = authHeader.substring(7);

        if (!jwtService.esValido(token)) {
            log.debug("Token inválido en request a {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            var claims = jwtService.parsearToken(token);
            var userId = claims.getSubject();
            var rol = claims.get("rol", String.class);
            var username = claims.get("username", String.class);

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));
            var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
            auth.setDetails(userId);

            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            log.warn("Error al procesar token JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
