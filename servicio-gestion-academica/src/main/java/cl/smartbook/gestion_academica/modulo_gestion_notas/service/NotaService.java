package cl.smartbook.gestion_academica.modulo_gestion_notas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.EstudianteClient;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.EvaluacionRepository;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.NotaDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.entity.Nota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.ActualizarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.AgregarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.repository.NotaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotaService {

    private final NotaRepository notaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final EstudianteClient estudianteClient;

    @Transactional(readOnly = true)
    public List<NotaDTO> listar() {
        return notaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public NotaDTO buscarPorId(Long id) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota no encontrada con id: " + id));
        return toDTO(nota);
    }

    @Transactional(readOnly = true)
    public List<NotaDTO> listarPorEstudiante(Long idEstudiante) {
        return notaRepository.findByIdEstudiante(idEstudiante).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<NotaDTO> listarPorEvaluacion(Long idEvaluacion) {
        return notaRepository.findByIdEvaluacion(idEvaluacion).stream().map(this::toDTO).toList();
    }

    @Transactional
    public NotaDTO crear(AgregarNota req, String authHeader) {
        if (!evaluacionRepository.existsById(req.getIdEvaluacion())) {
            throw new ReferenciaInvalidaException("Evaluacion no existe con id: " + req.getIdEvaluacion());
        }
        estudianteClient.verificarEstudianteExiste(req.getIdEstudiante(), authHeader);

        Nota nota = new Nota();
        nota.setIdEvaluacion(req.getIdEvaluacion());
        nota.setIdEstudiante(req.getIdEstudiante());
        nota.setCalificacion(req.getCalificacion());
        log.info("Creando nota para estudiante {} en evaluacion {}",
                req.getIdEstudiante(), req.getIdEvaluacion());
        return toDTO(notaRepository.save(nota));
    }

    @Transactional
    public NotaDTO actualizar(Long id, ActualizarNota req, String authHeader) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota no encontrada con id: " + id));

        if (!evaluacionRepository.existsById(req.getIdEvaluacion())) {
            throw new ReferenciaInvalidaException("Evaluacion no existe con id: " + req.getIdEvaluacion());
        }
        estudianteClient.verificarEstudianteExiste(req.getIdEstudiante(), authHeader);

        nota.setIdEvaluacion(req.getIdEvaluacion());
        nota.setIdEstudiante(req.getIdEstudiante());
        nota.setCalificacion(req.getCalificacion());
        return toDTO(notaRepository.save(nota));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!notaRepository.existsById(id)) {
            throw new EntityNotFoundException("Nota no encontrada con id: " + id);
        }
        notaRepository.deleteById(id);
    }

    private NotaDTO toDTO(Nota n) {
        return new NotaDTO(n.getId(), n.getIdEvaluacion(), n.getIdEstudiante(), n.getCalificacion());
    }
}
