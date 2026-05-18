package cl.smartbook.mensajeria.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI mensajeriaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartBook — Servicio Mensajería")
                        .description("Mensajería interna entre usuarios del colegio")
                        .version("1.0.0"));
    }
}
