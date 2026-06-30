package cl.smartbook.anotacion.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${smartbook.client.auth.url}")
    private String authUrl;

    @Value("${smartbook.client.gestion-estudiante.url}")
    private String gestionEstudianteUrl;

    @Value("${smartbook.client.vida.url}")
    private String vidaUrl;

    @Value("${smartbook.client.academica.url}")
    private String academicaUrl;

    @Bean("authWebClient")
    public WebClient authWebClient() {
        return buildClient(authUrl);
    }

    @Bean("estudianteWebClient")
    public WebClient estudianteWebClient() {
        return buildClient(gestionEstudianteUrl);
    }

    @Bean("vidaWebClient")
    public WebClient vidaWebClient() {
        return buildClient(vidaUrl);
    }

    @Bean("academicaWebClient")
    public WebClient academicaWebClient() {
        return buildClient(academicaUrl);
    }

    private WebClient buildClient(String baseUrl) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofSeconds(5));
        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
