package cl.smartbook.gestion_academica.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.smartbook.gestion_academica.client.dto.UsuarioDTO;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AuthClient {

    private final WebClient authWebClient;

    public AuthClient(@Qualifier("authWebClient") WebClient authWebClient) {
        this.authWebClient = authWebClient;
    }

    public UsuarioDTO obtenerUsuario(Long idUsuario, String authHeader) {
        try {
            return authWebClient.get()
                    .uri("/api/v1/usuarios/{id}", idUsuario)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .bodyToMono(UsuarioDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new ReferenciaInvalidaException("Usuario no existe con id: " + idUsuario);
        } catch (Exception e) {
            log.error("Error al consultar servicio-auth. idUsuario={}", idUsuario, e);
            throw new ServicioNoDisponibleException("No se pudo consultar el usuario.");
        }
    }

    public void verificarUsuarioEsDocente(Long idDocente, String authHeader) {
        UsuarioDTO usuario = obtenerUsuario(idDocente, authHeader);
        if (!"DOCENTE".equals(usuario.rol())) {
            throw new ReferenciaInvalidaException(
                    "El usuario con id " + idDocente + " no tiene rol DOCENTE");
        }
    }
}
