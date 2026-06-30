package cl.smartbook.gestion_academica.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;

/**
 * Cliente hacia servicio-mensajeria para enviar avisos (p. ej. nueva nota al apoderado).
 * Best-effort: cualquier fallo se registra y se ignora — nunca debe afectar la operación principal.
 * El remitente del mensaje lo toma mensajería del JWT reenviado (el docente que registró la nota).
 */
@Slf4j
@Component
public class MensajeriaClient {

    private final WebClient mensajeriaWebClient;

    public MensajeriaClient(@Qualifier("mensajeriaWebClient") WebClient mensajeriaWebClient) {
        this.mensajeriaWebClient = mensajeriaWebClient;
    }

    private record MensajeRequest(Long idDestinatario, String asunto, String contenido) {}

    public void enviarMensaje(Long idDestinatario, String asunto, String contenido, String authHeader) {
        try {
            mensajeriaWebClient.post()
                    .uri("/api/v1/mensajes")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(new MensajeRequest(idDestinatario, asunto, contenido))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo enviar el aviso a destinatario {}: {}", idDestinatario, e.getMessage());
        }
    }
}
