package cl.smartbook.mensajeria.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import cl.smartbook.mensajeria.client.dto.PerfilDTO;
import cl.smartbook.mensajeria.client.dto.UsuarioRefDTO;
import lombok.extern.slf4j.Slf4j;

/** Llamadas a servicio-auth para resolver el directorio de contactos. Best-effort: ante fallo devuelve vacío. */
@Slf4j
@Component
public class AuthClient {

    private final WebClient authWebClient;

    public AuthClient(@Qualifier("authWebClient") WebClient authWebClient) {
        this.authWebClient = authWebClient;
    }

    /** Perfiles de los roles dados (acotado por la whitelist del solicitante en servicio-auth). */
    public List<PerfilDTO> usuariosPorRol(String rolesCsv, String authHeader) {
        try {
            return authWebClient.get()
                    .uri(uri -> uri.path("/api/v1/usuarios/por-rol").queryParam("roles", rolesCsv).build())
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(PerfilDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("usuariosPorRol({}) falló: {}", rolesCsv, e.getMessage());
            return List.of();
        }
    }

    /** Perfiles públicos por ids (username + rol; acotado a DOCENTE/DIRECTOR en auth). */
    public List<PerfilDTO> perfiles(List<Long> ids, String authHeader) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        String idsCsv = ids.stream().map(String::valueOf).reduce((a, b) -> a + "," + b).orElse("");
        try {
            return authWebClient.get()
                    .uri(uri -> uri.path("/api/v1/usuarios/perfiles").queryParam("ids", idsCsv).build())
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(PerfilDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("perfiles({}) falló: {}", idsCsv, e.getMessage());
            return List.of();
        }
    }

    /** Todos los usuarios (solo accesible para staff directivo/administrativo). */
    public List<UsuarioRefDTO> usuariosTodos(String authHeader) {
        try {
            return authWebClient.get()
                    .uri("/api/v1/usuarios")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().bodyToFlux(UsuarioRefDTO.class).collectList().block();
        } catch (Exception e) {
            log.warn("usuariosTodos falló: {}", e.getMessage());
            return List.of();
        }
    }

    /** True si el usuario existe (servicio-auth /usuarios/{id}/existe → 204/404). Fail-closed: ante error, false. */
    public boolean existe(Long idUsuario, String authHeader) {
        try {
            authWebClient.get()
                    .uri("/api/v1/usuarios/{id}/existe", idUsuario)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve().toBodilessEntity().block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
