package cl.smartbook.evento_calendario.modulo_gestion_eventos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.dto.EventoDto;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.Evento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.ActualizarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.request.AgregarEvento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.repository.EventoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository repository;

    private EventoDto toDTO(Evento e) {
        return new EventoDto(
                e.getId(),
                e.getTitulo(),
                e.getDescripcion(),
                e.getFechaInicio(),
                e.getFechaFin(),
                e.getTipo(),
                e.getIdCreador(),
                e.getFechaCreacion());
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
    public EventoDto crear(AgregarEvento request) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new IllegalArgumentException("fechaFin debe ser posterior o igual a fechaInicio");
        }
        var evento = new Evento();
        evento.setTitulo(request.getTitulo());
        evento.setDescripcion(request.getDescripcion());
        evento.setFechaInicio(request.getFechaInicio());
        evento.setFechaFin(request.getFechaFin());
        evento.setTipo(request.getTipo());
        evento.setIdCreador(request.getIdCreador());
        log.info("Creando evento: {}", request.getTitulo());
        return toDTO(repository.save(evento));
    }

    @Transactional
    public EventoDto actualizar(Long id, ActualizarEvento request) {
        var evento = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado con id: " + id));

        if (request.getTitulo() != null) evento.setTitulo(request.getTitulo());
        if (request.getDescripcion() != null) evento.setDescripcion(request.getDescripcion());
        if (request.getTipo() != null) evento.setTipo(request.getTipo());
        if (request.getIdCreador() != null) evento.setIdCreador(request.getIdCreador());

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
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Evento no encontrado con id: " + id);
        }
        log.info("Eliminando evento id={}", id);
        repository.deleteById(id);
    }
}
