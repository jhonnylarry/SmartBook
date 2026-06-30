package cl.smartbook.gestion_academica.config;

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

    @Value("${smartbook.client.mensajeria.url}")
    private String mensajeriaUrl;

    private HttpClient httpClient() {
        return HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofSeconds(5));
    }

    @Bean("authWebClient")
    public WebClient authWebClient() {
        return WebClient.builder()
                .baseUrl(authUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient()))
                .build();
    }

    @Bean("estudianteWebClient")
    public WebClient estudianteWebClient() {
        return WebClient.builder()
                .baseUrl(gestionEstudianteUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient()))
                .build();
    }

    @Bean("mensajeriaWebClient")
    public WebClient mensajeriaWebClient() {
        return WebClient.builder()
                .baseUrl(mensajeriaUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient()))
                .build();
    }
}
