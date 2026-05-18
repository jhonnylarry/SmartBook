package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.ActualizarMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.AgregarMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.EstudianteRepository;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.MatriculaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final EstudianteRepository estudianteRepository;

    @Transactional(readOnly = true)
    public List<MatriculaDTO> listarTodas() {
        return matriculaRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public MatriculaDTO buscarPorId(Long id) {
        return toDto(buscarEntidadOFallar(id));
    }

    @Transactional(readOnly = true)
    public List<MatriculaDTO> listarPorEstudiante(Long idEstudiante) {
        return matriculaRepository.findByEstudianteId(idEstudiante).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public MatriculaDTO matricular(AgregarMatricula request) {
        var estudiante = estudianteRepository.findById(request.getIdEstudiante())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Estudiante no encontrado con id: " + request.getIdEstudiante()));

        var m = new Matricula();
        m.setEstudiante(estudiante);
        m.setIdCurso(request.getIdCurso());

        log.info("Matriculando estudiante id={} en curso id={}",
                request.getIdEstudiante(), request.getIdCurso());
        return toDto(matriculaRepository.save(m));
    }

    @Transactional
    public MatriculaDTO actualizar(Long id, ActualizarMatricula request) {
        var m = buscarEntidadOFallar(id);
        if (request.getIdCurso() != null) m.setIdCurso(request.getIdCurso());
        if (request.getEstado() != null) m.setEstado(request.getEstado());
        log.info("Actualizando matrícula id={}", id);
        return toDto(matriculaRepository.save(m));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!matriculaRepository.existsById(id)) {
            throw new EntityNotFoundException("Matrícula no encontrada con id: " + id);
        }
        log.info("Eliminando matrícula id={}", id);
        matriculaRepository.deleteById(id);
    }

    private Matricula buscarEntidadOFallar(Long id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Matrícula no encontrada con id: " + id));
    }

    private MatriculaDTO toDto(Matricula m) {
        Long idEstudiante = m.getEstudiante() != null ? m.getEstudiante().getId() : null;
        return new MatriculaDTO(
                m.getId(),
                idEstudiante,
                m.getIdCurso(),
                m.getFechaMatricula(),
                m.getEstado());
    }
}
