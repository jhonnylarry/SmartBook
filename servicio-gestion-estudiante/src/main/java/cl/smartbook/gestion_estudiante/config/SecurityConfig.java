package cl.smartbook.gestion_estudiante.config;

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
            // Ambos filtros anclados a UsernamePasswordAuthenticationFilter; el InternalTokenFilter
            // corre primero (autentica SERVICIO_INTERNO si el X-Internal-Token es válido) y JwtAuthFilter
            // respeta esa autenticación (no la sobrescribe).
            .addFilterBefore(internalTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Evita el doble registro de InternalTokenFilter como filtro de servlet (solo en la security chain). */
    @Bean
    FilterRegistrationBean<InternalTokenFilter> internalTokenFilterRegistration(InternalTokenFilter filter) {
        FilterRegistrationBean<InternalTokenFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
