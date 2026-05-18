package cl.smartbook.reportes.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI reportesOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartBook — Servicio Reportes")
                        .description("Generación de reportes académicos, conductuales y de curso")
                        .version("1.0.0"));
    }
}
