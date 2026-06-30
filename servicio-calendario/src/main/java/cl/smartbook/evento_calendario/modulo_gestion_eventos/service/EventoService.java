package cl.smartbook.evento_calendario.modulo_gestion_eventos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.dto.EventoDto;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.Evento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.ActualizarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.AgregarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.repository.EventoRepository;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.service.CalendarioScopeService.ScopeUsuario;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository repository;
    private final CalendarioScopeService scopeService;

    /** Sentinel para evitar 'IN ()' cuando una lista de scope viene vacía. */
    private static final List<Long> SENTINEL = List.of(-1L);

    private EventoDto toDTO(Evento e) {
        return new EventoDto(
                e.getId(),
                e.getTitulo(),
                e.getDescripcion(),
                e.getFechaInicio(),
                e.getFechaFin(),
                e.getTipo(),
                e.getAmbito(),
                e.getIdAsignatura(),
                e.getIdCurso(),
                e.getIdEstudiante(),
                e.getIdCreador(),
                e.getFechaCreacion());
    }

    // ── Calendario personal (feed por rol, resuelto server-side) ──
    @Transactional(readOnly = true)
    public List<EventoDto> miCalendario(LocalDateTime desde, LocalDateTime hasta,
                                        Long idUsuario, String rol, String authHeader) {
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("El parámetro 'hasta' debe ser posterior o igual a 'desde'");
        }
        ScopeUsuario scope = scopeService.resolver(idUsuario, rol, authHeader);
        List<Evento> eventos = scope.verTodo()
                ? repository.findEventosContenidosEnRango(desde, hasta)
                : repository.findVisiblesParaUsuario(desde, hasta,
                        orSentinel(scope.cursos()), orSentinel(scope.asignaturas()), orSentinel(scope.estudiantes()),
                        idUsuario == null ? -1L : idUsuario);
        return eventos.stream().map(this::toDTO).toList();
    }

    private static List<Long> orSentinel(List<Long> xs) {
        return (xs == null || xs.isEmpty()) ? SENTINEL : xs;
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listar() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public EventoDto buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listarPorRango(LocalDateTime desde, LocalDateTime hasta) {
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("El parámetro 'hasta' debe ser posterior o igual a 'desde'");
        }
        return repository.findEventosContenidosEnRango(desde, hasta).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listarPorTipo(TipoEvento tipo) {
        return repository.findByTipo(tipo).stream().map(this::toDTO).toList();
    }

    @Transactional
    public EventoDto crear(AgregarEvento request, Long idUsuario, String rol, String authHeader) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new IllegalArgumentException("fechaFin debe ser posterior o igual a fechaInicio");
        }
        AmbitoEvento ambito = request.getAmbito();
        validarCamposAmbito(ambito, request);
        // Autorización fail-closed: un docente solo dirige a su scope; GLOBAL solo dirección; PERSONAL cualquiera.
        scopeService.autorizarCreacion(ambito, request.getIdAsignatura(), request.getIdCurso(),
                request.getIdEstudiante(), idUsuario, rol, authHeader);

        var evento = new Evento();
        evento.setTitulo(request.getTitulo());
        evento.setDescripcion(request.getDescripcion());
        evento.setFechaInicio(request.getFechaInicio());
        evento.setFechaFin(request.getFechaFin());
        evento.setTipo(request.getTipo());
        evento.setAmbito(ambito);
        // Guardar SOLO el id que aplica al ámbito (los demás a null → sin scope mixto).
        evento.setIdAsignatura(ambito == AmbitoEvento.ASIGNATURA ? request.getIdAsignatura() : null);
        evento.setIdCurso(ambito == AmbitoEvento.CURSO ? request.getIdCurso() : null);
        evento.setIdEstudiante(ambito == AmbitoEvento.ESTUDIANTE ? request.getIdEstudiante() : null);
        evento.setIdCreador(idUsuario);
        log.info("Creando evento ambito={} creador={}", ambito, idUsuario);
        return toDTO(repository.save(evento));
    }

    /** Cada ámbito dirigido exige su id de destino. */
    private void validarCamposAmbito(AmbitoEvento ambito, AgregarEvento r) {
        boolean ok = switch (ambito) {
            case CURSO -> r.getIdCurso() != null;
            case ASIGNATURA -> r.getIdAsignatura() != null;
            case ESTUDIANTE -> r.getIdEstudiante() != null;
            case GLOBAL, PERSONAL -> true;
        };
        if (!ok) {
            throw new IllegalArgumentException("Falta el destinatario obligatorio para el ámbito " + ambito);
        }
    }

    @Transactional
    public EventoDto actualizar(Long id, ActualizarEvento request, Long idUsuario, String rol) {
        var evento = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado con id: " + id));
        verificarAutoria(evento, idUsuario, rol);

        if (request.getTitulo() != null) evento.setTitulo(request.getTitulo());
        if (request.getDescripcion() != null) evento.setDescripcion(request.getDescripcion());
        if (request.getTipo() != null) evento.setTipo(request.getTipo());
        // El ámbito y el scope (idAsignatura/idCurso/idEstudiante) se fijan al crear; no se modifican en update.

        var inicio = request.getFechaInicio() != null ? request.getFechaInicio() : evento.getFechaInicio();
        var fin = request.getFechaFin() != null ? request.getFechaFin() : evento.getFechaFin();
        if (fin.isBefore(inicio)) {
            throw new IllegalArgumentException("fechaFin debe ser posterior o igual a fechaInicio");
        }
        evento.setFechaInicio(inicio);
        evento.setFechaFin(fin);

        log.info("Actualizando evento id={}", id);
        return toDTO(repository.save(evento));
    }

    @Transactional
    public void eliminar(Long id, Long idUsuario, String rol) {
        var evento = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado con id: " + id));
        verificarAutoria(evento, idUsuario, rol);
        log.info("Eliminando evento id={}", id);
        repository.delete(evento);
    }

    /** Solo el creador del evento o un DIRECTOR/ADMINISTRADOR puede modificarlo o eliminarlo. */
    private void verificarAutoria(Evento evento, Long idUsuario, String rol) {
        boolean direccion = "ADMINISTRADOR".equals(rol) || "DIRECTOR".equals(rol);
        if (!direccion && (evento.getIdCreador() == null || !evento.getIdCreador().equals(idUsuario))) {
            throw new AccessDeniedException("Solo el creador o un director/administrador puede modificar este evento.");
        }
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listarPorAsignatura(Long idAsignatura) {
        return repository.findByIdAsignatura(idAsignatura).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listarGlobales() {
        return repository.findGlobales().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listarFeed(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return repository.findGlobales().stream().map(this::toDTO).toList();
        }
        return repository.findFeed(ids).stream().map(this::toDTO).toList();
    }
}
