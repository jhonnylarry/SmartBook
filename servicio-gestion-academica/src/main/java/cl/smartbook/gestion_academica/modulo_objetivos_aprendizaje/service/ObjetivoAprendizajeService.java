package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.dto.ObjetivoAprendizajeDTO;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.entity.ObjetivoAprendizaje;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request.ActualizarObjetivoAprendizaje;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.request.AgregarObjetivoAprendizaje;
import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.repository.ObjetivoAprendizajeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ObjetivoAprendizajeService {

    private final ObjetivoAprendizajeRepository objetivoRepository;
    private final AsignaturaRepository asignaturaRepository;

    @Transactional(readOnly = true)
    public List<ObjetivoAprendizajeDTO> listar() {
        return objetivoRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ObjetivoAprendizajeDTO buscarPorId(Long id) {
        ObjetivoAprendizaje objetivo = objetivoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Objetivo no encontrado con id: " + id));
        return toDTO(objetivo);
    }

    @Transactional(readOnly = true)
    public List<ObjetivoAprendizajeDTO> listarPorAsignatura(Long idAsignatura) {
        return objetivoRepository.findByIdAsignatura(idAsignatura).stream().map(this::toDTO).toList();
    }

    @Transactional
    public ObjetivoAprendizajeDTO crear(AgregarObjetivoAprendizaje req) {
        if (!asignaturaRepository.existsById(req.getIdAsignatura())) {
            throw new ReferenciaInvalidaException("Asignatura no existe con id: " + req.getIdAsignatura());
        }

        ObjetivoAprendizaje objetivo = new ObjetivoAprendizaje();
        objetivo.setCodigo(req.getCodigo());
        objetivo.setDescripcion(req.getDescripcion());
        objetivo.setIdAsignatura(req.getIdAsignatura());
        objetivo.setNivel(req.getNivel());
        log.info("Creando objetivo de aprendizaje: {}", req.getCodigo());
        return toDTO(objetivoRepository.save(objetivo));
    }

    @Transactional
    public ObjetivoAprendizajeDTO actualizar(Long id, ActualizarObjetivoAprendizaje req) {
        ObjetivoAprendizaje objetivo = objetivoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Objetivo no encontrado con id: " + id));

        if (req.getCodigo() != null) objetivo.setCodigo(req.getCodigo());
        if (req.getDescripcion() != null) objetivo.setDescripcion(req.getDescripcion());
        if (req.getNivel() != null) objetivo.setNivel(req.getNivel());
        if (req.getIdAsignatura() != null) {
            if (!asignaturaRepository.existsById(req.getIdAsignatura())) {
                throw new ReferenciaInvalidaException("Asignatura no existe con id: " + req.getIdAsignatura());
            }
            objetivo.setIdAsignatura(req.getIdAsignatura());
        }

        return toDTO(objetivoRepository.save(objetivo));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!objetivoRepository.existsById(id)) {
            throw new EntityNotFoundException("Objetivo no encontrado con id: " + id);
        }
        objetivoRepository.deleteById(id);
    }

    private ObjetivoAprendizajeDTO toDTO(ObjetivoAprendizaje o) {
        return new ObjetivoAprendizajeDTO(
                o.getId(),
                o.getCodigo(),
                o.getDescripcion(),
                o.getIdAsignatura(),
                o.getNivel());
    }
}
