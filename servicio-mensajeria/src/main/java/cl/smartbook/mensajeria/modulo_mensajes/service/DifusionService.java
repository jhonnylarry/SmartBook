package cl.smartbook.mensajeria.modulo_mensajes.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.DifusionResultDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.entity.Mensaje;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.EnviarDifusionRequest;
import cl.smartbook.mensajeria.modulo_mensajes.repository.MensajeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Envía una difusión a un grupo predefinido: valida que el grupo sea permitido para el remitente,
 * resuelve sus destinatarios y persiste N copias de Mensaje correlacionadas por un mismo loteDifusion.
 * Cada copia es un mensaje real (leído/respondido individualmente).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DifusionService {

    private static final int MAX_LOTE = 500;

    private final DirectorioContactosService directorio;
    private final MensajeRepository mensajeRepository;

    @Transactional
    public DifusionResultDTO enviarGrupo(Long idRemitente, String rol, EnviarDifusionRequest req, String authHeader) {
        List<Long> destinatarios = directorio.destinatariosDeGrupo(idRemitente, rol, req.grupoId(), authHeader).stream()
                .filter(d -> d != null && !d.equals(idRemitente))
                .distinct()
                .toList();
        if (destinatarios.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Grupo no permitido o sin destinatarios");
        }
        if (destinatarios.size() > MAX_LOTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La difusión supera el máximo de " + MAX_LOTE + " destinatarios");
        }
        UUID lote = UUID.randomUUID();
        List<Mensaje> mensajes = destinatarios.stream()
                .map(d -> Mensaje.builder()
                        .idRemitente(idRemitente)
                        .idDestinatario(d)
                        .asunto(req.asunto())
                        .contenido(req.contenido())
                        .leido(false)
                        .loteDifusion(lote)
                        .build())
                .toList();
        mensajeRepository.saveAll(mensajes);
        log.info("Difusión {} ({}) de idRemitente={} a {} destinatarios", lote, req.grupoId(), idRemitente, mensajes.size());
        return new DifusionResultDTO(lote, req.grupoId(), mensajes.size());
    }
}
