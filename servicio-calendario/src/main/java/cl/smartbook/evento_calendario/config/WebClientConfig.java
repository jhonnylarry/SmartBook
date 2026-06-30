package cl.smartbook.evento_calendario.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * WebClients para resolver el scope del calendario (qué eventos ve cada usuario) consultando a
 * gestion-academica (asignaturas/cursos del docente) y gestion-estudiante (curso del alumno,
 * pupilos del apoderado, roster de un curso). Patrón copiado de servicio-mensajeria.
 */
@Configuration
public class WebClientConfig {

    @Value("${smartbook.client.gestion-estudiante.url:http://localhost:5002}")
    private String estudianteUrl;

    @Value("${smartbook.client.gestion-academica.url:http://localhost:5003}")
    private String academicaUrl;

    private HttpClient httpClient() {
        return HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofSeconds(5));
    }

    @Bean
    WebClient estudianteWebClient() {
        return WebClient.builder()
                .baseUrl(estudianteUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient()))
                .build();
    }

    @Bean
    WebClient academicaWebClient() {
        return WebClient.builder()
                .baseUrl(academicaUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient()))
                .build();
    }
}
