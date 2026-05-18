package cl.smartbook.gestion_estudiante.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;

@Configuration
public class OpenApiConfiguration {
    @Bean
    public OpenAPI documentacionApi() {
        return new OpenAPI();
    }
}