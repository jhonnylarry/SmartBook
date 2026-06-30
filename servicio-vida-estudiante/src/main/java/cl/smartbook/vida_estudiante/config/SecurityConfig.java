package cl.smartbook.vida_estudiante.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final InternalTokenFilter internalTokenFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**", "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            // Ambos filtros se anclan a UsernamePasswordAuthenticationFilter (no se puede anclar a
            // un filtro propio). El InternalTokenFilter se agrega primero → corre antes que el
            // JwtAuthFilter: si el X-Internal-Token es válido autentica como SERVICIO_INTERNO, y
            // JwtAuthFilter respeta esa autenticación (no la sobrescribe).
            .addFilterBefore(internalTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Evita que InternalTokenFilter sea registrado automáticamente como filtro de servlet
     * por Spring Boot (doble ejecución: una fuera de la security chain + una dentro).
     * Solo debe correr dentro de la cadena de Spring Security.
     */
    @Bean
    FilterRegistrationBean<InternalTokenFilter> internalTokenFilterRegistration(
            InternalTokenFilter filter) {
        FilterRegistrationBean<InternalTokenFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
