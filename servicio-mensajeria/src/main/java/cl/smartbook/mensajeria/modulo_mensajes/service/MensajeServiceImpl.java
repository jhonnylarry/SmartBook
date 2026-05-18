package cl.smartbook.mensajeria.modulo_mensajes.service;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.MensajeDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.entity.Mensaje;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.AgregarMensajeRequest;
import cl.smartbook.mensajeria.modulo_mensajes.repository.MensajeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MensajeServiceImpl implements MensajeService {

    private final MensajeRepository mensajeRepository;
    private final WebClient authWebClient;

    @Override
    public MensajeDTO enviar(AgregarMensajeRequest request, String authHeader) {
        // idRemitente siempre se extrae del JWT — se ignora lo que venga en el body
        Long idRemitente = extraerUserIdDelJwt();

        validarUsuario(idRemitente, "remitente", authHeader);
        validarUsuario(request.idDestinatario(), "destinatario", authHeader);

        var mensaje = Mensaje.builder()
                .idRemitente(idRemitente)
                .idDestinatario(request.idDestinatario())
                .asunto(request.asunto())
                .contenido(request.contenido())
                .leido(false)
                .build();

        log.info("Enviando mensaje de idRemitente={} a idDestinatario={}", idRemitente, request.idDestinatario());
        return toDTO(mensajeRepository.save(mensaje));
    }

    private Long extraerUserIdDelJwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        try {
            return Long.parseLong(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido: no se pudo extraer el ID de usuario");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MensajeDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeDTO> listarRecibidos(Long idUsuario) {
        return mensajeRepository.findByIdDestinatarioOrderByFechaEnvioDesc(idUsuario)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeDTO> listarEnviados(Long idUsuario) {
        return mensajeRepository.findByIdRemitenteOrderByFechaEnvioDesc(idUsuario)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public MensajeDTO marcarLeido(Long id) {
        var mensaje = findOrThrow(id);
        mensaje.setLeido(true);
        log.info("Marcando mensaje id={} como leído", id);
        return toDTO(mensajeRepository.save(mensaje));
    }

    @Override
    public void eliminar(Long id) {
        findOrThrow(id);
        log.info("Eliminando mensaje id={}", id);
        mensajeRepository.deleteById(id);
    }

    private Mensaje findOrThrow(Long id) {
        return mensajeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mensaje no encontrado con id: " + id));
    }

    private void validarUsuario(Long idUsuario, String rol, String authHeader) {
        try {
            authWebClient.get()
                    .uri("/api/v1/usuarios/{id}", idUsuario)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .onStatus(status -> status.value() == 404,
                            resp -> resp.createException().map(ex ->
                                    new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                            "El " + rol + " con id " + idUsuario + " no existe")))
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            resp -> resp.createException())
                    .toBodilessEntity()
                    .block();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (WebClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El " + rol + " con id " + idUsuario + " no existe");
        } catch (Exception ex) {
            log.error("servicio-auth no disponible al validar {} {}: {}", rol, idUsuario, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Servicio de autenticacion no disponible");
        }
    }

    private MensajeDTO toDTO(Mensaje m) {
        return new MensajeDTO(
                m.getId(),
                m.getIdRemitente(),
                m.getIdDestinatario(),
                m.getAsunto(),
                m.getContenido(),
                m.getFechaEnvio(),
                m.getLeido()
        );
    }
}
