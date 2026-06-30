package cl.smartbook.mensajeria.modulo_mensajes.service;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.MensajeDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.entity.Mensaje;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.AgregarMensajeRequest;
import cl.smartbook.mensajeria.modulo_mensajes.repository.MensajeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MensajeServiceImpl implements MensajeService {

    private final MensajeRepository mensajeRepository;
    private final DirectorioContactosService directorio;

    @Override
    public MensajeDTO enviar(AgregarMensajeRequest request, String authHeader) {
        Long idRemitente = idUsuarioDesdeJwt();
        // Matriz de permisos: el destinatario debe estar entre los contactos permitidos del remitente
        // (o haberle escrito antes — regla de respuesta). 403 genérico para no filtrar existencia.
        if (!directorio.puedeEnviar(idRemitente, rolDesdeJwt(), request.idDestinatario(), authHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Destinatario no permitido");
        }

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

    /** Rol del remitente desde el JWT (authority ROLE_<rol>), nunca de un header manipulable. */
    private String rolDesdeJwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            for (GrantedAuthority a : auth.getAuthorities()) {
                String authority = a.getAuthority();
                if (authority != null && authority.startsWith("ROLE_")) {
                    return authority.substring("ROLE_".length());
                }
            }
        }
        return "";
    }

    @Override
    @Transactional(readOnly = true)
    public MensajeDTO getById(Long id, Long idUsuarioAutenticado) {
        var mensaje = findOrThrow(id);
        if (!mensaje.getIdRemitente().equals(idUsuarioAutenticado)
                && !mensaje.getIdDestinatario().equals(idUsuarioAutenticado)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado");
        }
        return toDTO(mensaje);
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
    public MensajeDTO marcarLeido(Long id, Long idUsuarioAutenticado) {
        var mensaje = findOrThrow(id);
        if (!mensaje.getIdDestinatario().equals(idUsuarioAutenticado)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado");
        }
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

    /**
     * Extrae el id del usuario autenticado desde el JWT (claim {@code sub}) expuesto
     * por JwtAuthFilter en {@code Authentication.details}.
     */
    private Long idUsuarioDesdeJwt() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getDetails() == null) {
                return null;
            }
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException ex) {
            return null;
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
                m.getLeido(),
                m.getLoteDifusion()
        );
    }
}
