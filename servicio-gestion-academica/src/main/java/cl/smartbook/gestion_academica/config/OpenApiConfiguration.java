package cl.smartbook.gestion_academica.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfiguration {

    @Bean
    public OpenAPI documentacionApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Gestión Académica API")
                        .description("Microservicio SmartBook — cursos, asignaturas, evaluaciones y notas")
                        .version("1.0.0"));
    }
}
