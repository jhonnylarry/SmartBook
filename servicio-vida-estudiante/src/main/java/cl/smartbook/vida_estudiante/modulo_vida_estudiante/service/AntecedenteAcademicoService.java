package cl.smartbook.vida_estudiante.modulo_vida_estudiante.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.AntecedenteAcademicoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.AntecedenteAcademico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarAntecedenteAcademico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarAntecedenteAcademico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.AntecedenteAcademicoRepository;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.HojaVidaEstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AntecedenteAcademicoService {

    private final AntecedenteAcademicoRepository repository;
    private final HojaVidaEstudianteRepository hojaVidaRepository;

    private AntecedenteAcademicoDTO toDTO(AntecedenteAcademico e) {
        return new AntecedenteAcademicoDTO(
                e.getId(),
                e.getIdHojaVida(),
                e.getColegioProcedencia(),
                e.getFechaIngreso(),
                e.getViveCon(),
                e.getPromedioGeneral());
    }

    @Transactional(readOnly = true)
    public List<AntecedenteAcademicoDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AntecedenteAcademicoDTO> listarPorHojaVida(Long idHojaVida) {
        return repository.findAllByIdHojaVida(idHojaVida).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public AntecedenteAcademicoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente academico no encontrado con id: " + id));
    }

    @Transactional
    public AntecedenteAcademicoDTO crear(AgregarAntecedenteAcademico request) {
        if (!hojaVidaRepository.existsById(request.getIdHojaVida())) {
            throw new EntityNotFoundException("Hoja de vida no encontrada con id: " + request.getIdHojaVida());
        }
        var entidad = new AntecedenteAcademico();
        entidad.setIdHojaVida(request.getIdHojaVida());
        entidad.setColegioProcedencia(request.getColegioProcedencia());
        entidad.setFechaIngreso(request.getFechaIngreso());
        entidad.setViveCon(request.getViveCon());
        entidad.setPromedioGeneral(request.getPromedioGeneral());
        var saved = toDTO(repository.save(entidad));
        log.info("Antecedente academico creado id={} idHojaVida={}", saved.id(), saved.idHojaVida());
        return saved;
    }

    @Transactional
    public AntecedenteAcademicoDTO actualizar(Long id, ActualizarAntecedenteAcademico request) {
        var entidad = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente academico no encontrado con id: " + id));
        if (request.getColegioProcedencia() != null) entidad.setColegioProcedencia(request.getColegioProcedencia());
        if (request.getFechaIngreso() != null) entidad.setFechaIngreso(request.getFechaIngreso());
        if (request.getViveCon() != null) entidad.setViveCon(request.getViveCon());
        if (request.getPromedioGeneral() != null) entidad.setPromedioGeneral(request.getPromedioGeneral());
        log.info("Antecedente academico actualizado id={}", id);
        return toDTO(repository.save(entidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Antecedente academico no encontrado con id: " + id);
        }
        repository.deleteById(id);
        log.info("Antecedente academico eliminado id={}", id);
    }
}
