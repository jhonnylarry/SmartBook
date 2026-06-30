package cl.smartbook.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/register"
                ).permitAll()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                // Alta interna de matrícula (estudiante/apoderado): mismos roles que el alta de matrícula.
                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/internos").hasAnyRole("ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO")
                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios").hasAnyRole("ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO")
                .requestMatchers(HttpMethod.PUT, "/api/v1/usuarios/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/usuarios/**").hasRole("ADMINISTRADOR")
                // Verificación de existencia (uso interno): tan restrictiva como su @PreAuthorize (defensa en profundidad).
                .requestMatchers(HttpMethod.GET, "/api/v1/usuarios/*/existe")
                    .hasAnyRole("ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO", "DOCENTE", "INSPECTOR")
                .requestMatchers(HttpMethod.GET, "/api/v1/usuarios/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
