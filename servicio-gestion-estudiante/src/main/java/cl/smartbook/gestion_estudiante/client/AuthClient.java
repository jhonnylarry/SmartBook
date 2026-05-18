package cl.smartbook.gestion_estudiante.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.smartbook.gestion_estudiante.client.dto.CrearUsuarioRequest;
import cl.smartbook.gestion_estudiante.client.dto.UsuarioCreadoResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AuthClient {

    private final WebClient authWebClient;

    public AuthClient(@Qualifier("authWebClient") WebClient authWebClient) {
        this.authWebClient = authWebClient;
    }

    public UsuarioCreadoResponse crearUsuario(CrearUsuarioRequest req, String authHeader) {
        try {
            return authWebClient.post()
                    .uri("/api/v1/usuarios")
                    .header("Authorization", authHeader)
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(UsuarioCreadoResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            // Log del detalle completo (solo interno — no se expone al cliente)
            log.warn("Error al crear usuario en servicio-auth [HTTP {}] body: {}",
                    ex.getStatusCode(), ex.getResponseBodyAsString());

            if (ex.getStatusCode() == HttpStatus.CONFLICT) {
                throw new UsuarioYaExisteException(
                        "El email o username ya está registrado en servicio-auth");
            }
            // Para cualquier otro error HTTP devolvemos solo el código, sin el body interno
            throw new RuntimeException(
                    "Error al crear usuario en servicio-auth (HTTP " + ex.getStatusCode() + ")", ex);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo conectar con servicio-auth: " + ex.getMessage(), ex);
        }
    }
}
