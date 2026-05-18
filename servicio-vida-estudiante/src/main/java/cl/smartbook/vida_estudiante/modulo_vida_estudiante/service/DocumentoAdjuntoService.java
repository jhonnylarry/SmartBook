package cl.smartbook.vida_estudiante.modulo_vida_estudiante.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.DocumentoAdjuntoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.DocumentoAdjunto;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarDocumentoAdjunto;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarDocumentoAdjunto;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.DocumentoAdjuntoRepository;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.HojaVidaEstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentoAdjuntoService {

    private final DocumentoAdjuntoRepository repository;
    private final HojaVidaEstudianteRepository hojaVidaRepository;

    private DocumentoAdjuntoDTO toDTO(DocumentoAdjunto e) {
        return new DocumentoAdjuntoDTO(
                e.getId(),
                e.getIdHojaVida(),
                e.getNombre(),
                e.getTipoMime(),
                e.getUrl(),
                e.getSubidoPor(),
                e.getFechaCarga());
    }

    @Transactional(readOnly = true)
    public List<DocumentoAdjuntoDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoAdjuntoDTO> listarPorHojaVida(Long idHojaVida) {
        return repository.findAllByIdHojaVida(idHojaVida).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public DocumentoAdjuntoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Documento adjunto no encontrado con id: " + id));
    }

    @Transactional
    public DocumentoAdjuntoDTO crear(AgregarDocumentoAdjunto request) {
        if (!hojaVidaRepository.existsById(request.getIdHojaVida())) {
            throw new EntityNotFoundException("Hoja de vida no encontrada con id: " + request.getIdHojaVida());
        }
        var entidad = new DocumentoAdjunto();
        entidad.setIdHojaVida(request.getIdHojaVida());
        entidad.setNombre(request.getNombre());
        entidad.setTipoMime(request.getTipoMime());
        entidad.setUrl(request.getUrl());
        entidad.setSubidoPor(request.getSubidoPor());
        var saved = toDTO(repository.save(entidad));
        log.info("Documento adjunto creado id={} idHojaVida={}", saved.id(), saved.idHojaVida());
        return saved;
    }

    @Transactional
    public DocumentoAdjuntoDTO actualizar(Long id, ActualizarDocumentoAdjunto request) {
        var entidad = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Documento adjunto no encontrado con id: " + id));
        if (request.getNombre() != null) entidad.setNombre(request.getNombre());
        if (request.getTipoMime() != null) entidad.setTipoMime(request.getTipoMime());
        if (request.getUrl() != null) entidad.setUrl(request.getUrl());
        if (request.getSubidoPor() != null) entidad.setSubidoPor(request.getSubidoPor());
        log.info("Documento adjunto actualizado id={}", id);
        return toDTO(repository.save(entidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Documento adjunto no encontrado con id: " + id);
        }
        repository.deleteById(id);
        log.info("Documento adjunto eliminado id={}", id);
    }
}
