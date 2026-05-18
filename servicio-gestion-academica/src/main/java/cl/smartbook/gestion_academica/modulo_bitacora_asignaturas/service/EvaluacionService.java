package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.EvaluacionDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Evaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarEvaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarEvaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.EvaluacionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final AsignaturaRepository asignaturaRepository;

    @Transactional(readOnly = true)
    public List<EvaluacionDTO> listar() {
        return evaluacionRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public EvaluacionDTO buscarPorId(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evaluacion no encontrada con id: " + id));
        return toDTO(evaluacion);
    }

    @Transactional(readOnly = true)
    public List<EvaluacionDTO> listarPorAsignatura(Long idAsignatura) {
        return evaluacionRepository.findByIdAsignatura(idAsignatura).stream().map(this::toDTO).toList();
    }

    @Transactional
    public EvaluacionDTO crear(AgregarEvaluacion req) {
        if (!asignaturaRepository.existsById(req.getIdAsignatura())) {
            throw new ReferenciaInvalidaException("Asignatura no existe con id: " + req.getIdAsignatura());
        }

        Evaluacion evaluacion = new Evaluacion();
        evaluacion.setNombre(req.getNombre());
        evaluacion.setFecha(req.getFecha());
        evaluacion.setIdAsignatura(req.getIdAsignatura());
        evaluacion.setPonderacion(req.getPonderacion());
        log.info("Creando evaluacion: {}", req.getNombre());
        return toDTO(evaluacionRepository.save(evaluacion));
    }

    @Transactional
    public EvaluacionDTO actualizar(Long id, ActualizarEvaluacion req) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evaluacion no encontrada con id: " + id));

        if (!asignaturaRepository.existsById(req.getIdAsignatura())) {
            throw new ReferenciaInvalidaException("Asignatura no existe con id: " + req.getIdAsignatura());
        }

        evaluacion.setNombre(req.getNombre());
        evaluacion.setFecha(req.getFecha());
        evaluacion.setIdAsignatura(req.getIdAsignatura());
        evaluacion.setPonderacion(req.getPonderacion());
        return toDTO(evaluacionRepository.save(evaluacion));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!evaluacionRepository.existsById(id)) {
            throw new EntityNotFoundException("Evaluacion no encontrada con id: " + id);
        }
        evaluacionRepository.deleteById(id);
    }

    private EvaluacionDTO toDTO(Evaluacion e) {
        return new EvaluacionDTO(e.getId(), e.getNombre(), e.getFecha(), e.getIdAsignatura(), e.getPonderacion());
    }
}
