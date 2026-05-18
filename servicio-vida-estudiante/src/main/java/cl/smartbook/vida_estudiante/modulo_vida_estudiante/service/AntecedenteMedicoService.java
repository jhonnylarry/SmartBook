package cl.smartbook.vida_estudiante.modulo_vida_estudiante.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.AntecedenteMedicoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.AntecedenteMedico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarAntecedenteMedico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarAntecedenteMedico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.AntecedenteMedicoRepository;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.HojaVidaEstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AntecedenteMedicoService {

    private final AntecedenteMedicoRepository repository;
    private final HojaVidaEstudianteRepository hojaVidaRepository;

    private AntecedenteMedicoDTO toDTO(AntecedenteMedico e) {
        return new AntecedenteMedicoDTO(
                e.getId(),
                e.getIdHojaVida(),
                e.getTipoSangre(),
                e.getAlergias(),
                e.getEnfermedadesCronicas(),
                e.getMedicacion(),
                e.getPrevisionSalud());
    }

    @Transactional(readOnly = true)
    public List<AntecedenteMedicoDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AntecedenteMedicoDTO> listarPorHojaVida(Long idHojaVida) {
        return repository.findAllByIdHojaVida(idHojaVida).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public AntecedenteMedicoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente medico no encontrado con id: " + id));
    }

    @Transactional
    public AntecedenteMedicoDTO crear(AgregarAntecedenteMedico request) {
        if (!hojaVidaRepository.existsById(request.getIdHojaVida())) {
            throw new EntityNotFoundException("Hoja de vida no encontrada con id: " + request.getIdHojaVida());
        }
        var entidad = new AntecedenteMedico();
        entidad.setIdHojaVida(request.getIdHojaVida());
        entidad.setTipoSangre(request.getTipoSangre());
        entidad.setAlergias(request.getAlergias());
        entidad.setEnfermedadesCronicas(request.getEnfermedadesCronicas());
        entidad.setMedicacion(request.getMedicacion());
        entidad.setPrevisionSalud(request.getPrevisionSalud());
        var saved = toDTO(repository.save(entidad));
        log.info("Antecedente medico creado id={} idHojaVida={}", saved.id(), saved.idHojaVida());
        return saved;
    }

    @Transactional
    public AntecedenteMedicoDTO actualizar(Long id, ActualizarAntecedenteMedico request) {
        var entidad = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente medico no encontrado con id: " + id));
        if (request.getTipoSangre() != null) entidad.setTipoSangre(request.getTipoSangre());
        if (request.getAlergias() != null) entidad.setAlergias(request.getAlergias());
        if (request.getEnfermedadesCronicas() != null) entidad.setEnfermedadesCronicas(request.getEnfermedadesCronicas());
        if (request.getMedicacion() != null) entidad.setMedicacion(request.getMedicacion());
        if (request.getPrevisionSalud() != null) entidad.setPrevisionSalud(request.getPrevisionSalud());
        log.info("Antecedente medico actualizado id={}", id);
        return toDTO(repository.save(entidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Antecedente medico no encontrado con id: " + id);
        }
        repository.deleteById(id);
        log.info("Antecedente medico eliminado id={}", id);
    }
}
