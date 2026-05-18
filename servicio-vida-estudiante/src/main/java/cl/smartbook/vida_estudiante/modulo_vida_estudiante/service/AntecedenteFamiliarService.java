package cl.smartbook.vida_estudiante.modulo_vida_estudiante.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.AntecedenteFamiliarDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.AntecedenteFamiliar;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarAntecedenteFamiliar;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarAntecedenteFamiliar;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.AntecedenteFamiliarRepository;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.HojaVidaEstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AntecedenteFamiliarService {

    private final AntecedenteFamiliarRepository repository;
    private final HojaVidaEstudianteRepository hojaVidaRepository;

    private AntecedenteFamiliarDTO toDTO(AntecedenteFamiliar e) {
        return new AntecedenteFamiliarDTO(
                e.getId(),
                e.getIdHojaVida(),
                e.getNombre(),
                e.getParentesco(),
                e.getTelefono(),
                e.getOcupacion(),
                e.isEsContactoEmergencia());
    }

    @Transactional(readOnly = true)
    public List<AntecedenteFamiliarDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AntecedenteFamiliarDTO> listarPorHojaVida(Long idHojaVida) {
        return repository.findAllByIdHojaVida(idHojaVida).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public AntecedenteFamiliarDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente familiar no encontrado con id: " + id));
    }

    @Transactional
    public AntecedenteFamiliarDTO crear(AgregarAntecedenteFamiliar request) {
        if (!hojaVidaRepository.existsById(request.getIdHojaVida())) {
            throw new EntityNotFoundException("Hoja de vida no encontrada con id: " + request.getIdHojaVida());
        }
        var entidad = new AntecedenteFamiliar();
        entidad.setIdHojaVida(request.getIdHojaVida());
        entidad.setNombre(request.getNombre());
        entidad.setParentesco(request.getParentesco());
        entidad.setTelefono(request.getTelefono());
        entidad.setOcupacion(request.getOcupacion());
        entidad.setEsContactoEmergencia(request.isEsContactoEmergencia());
        var saved = toDTO(repository.save(entidad));
        log.info("Antecedente familiar creado id={} idHojaVida={}", saved.id(), saved.idHojaVida());
        return saved;
    }

    @Transactional
    public AntecedenteFamiliarDTO actualizar(Long id, ActualizarAntecedenteFamiliar request) {
        var entidad = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente familiar no encontrado con id: " + id));
        if (request.getNombre() != null) entidad.setNombre(request.getNombre());
        if (request.getParentesco() != null) entidad.setParentesco(request.getParentesco());
        if (request.getTelefono() != null) entidad.setTelefono(request.getTelefono());
        if (request.getOcupacion() != null) entidad.setOcupacion(request.getOcupacion());
        if (request.getEsContactoEmergencia() != null) entidad.setEsContactoEmergencia(request.getEsContactoEmergencia());
        log.info("Antecedente familiar actualizado id={}", id);
        return toDTO(repository.save(entidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Antecedente familiar no encontrado con id: " + id);
        }
        repository.deleteById(id);
        log.info("Antecedente familiar eliminado id={}", id);
    }
}
