package cl.smartbook.gestion_academica.modulo_periodos_academicos.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.dto.PeriodoAcademicoDTO;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.entity.PeriodoAcademico;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.request.ActualizarPeriodo;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.request.AgregarPeriodo;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.repository.PeriodoAcademicoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PeriodoAcademicoService {

    private final PeriodoAcademicoRepository periodoRepository;

    @Transactional(readOnly = true)
    public List<PeriodoAcademicoDTO> listar() {
        return periodoRepository.findAllByOrderByAnioDescFechaInicioAsc().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public PeriodoAcademicoDTO buscarPorId(Long id) {
        return toDTO(obtener(id));
    }

    @Transactional
    public PeriodoAcademicoDTO crear(AgregarPeriodo req) {
        validarFechas(req.getFechaInicio(), req.getFechaFin());
        validarSolape(req.getAnio(), req.getFechaInicio(), req.getFechaFin(), null);

        PeriodoAcademico p = new PeriodoAcademico();
        p.setNombre(req.getNombre());
        p.setAnio(req.getAnio());
        p.setFechaInicio(req.getFechaInicio());
        p.setFechaFin(req.getFechaFin());
        log.info("Creando periodo academico: {} ({})", req.getNombre(), req.getAnio());
        return toDTO(periodoRepository.save(p));
    }

    @Transactional
    public PeriodoAcademicoDTO actualizar(Long id, ActualizarPeriodo req) {
        PeriodoAcademico p = obtener(id);
        validarFechas(req.getFechaInicio(), req.getFechaFin());
        validarSolape(req.getAnio(), req.getFechaInicio(), req.getFechaFin(), id);

        p.setNombre(req.getNombre());
        p.setAnio(req.getAnio());
        p.setFechaInicio(req.getFechaInicio());
        p.setFechaFin(req.getFechaFin());
        log.info("Actualizando periodo academico {}", id);
        return toDTO(periodoRepository.save(p));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!periodoRepository.existsById(id)) {
            throw new EntityNotFoundException("Periodo academico no encontrado con id: " + id);
        }
        periodoRepository.deleteById(id);
        log.info("Eliminando periodo academico {}", id);
    }

    /** id del periodo cuyo rango contiene la fecha dada, o null si ninguno la cubre. */
    @Transactional(readOnly = true)
    public Long periodoParaFecha(LocalDate fecha) {
        if (fecha == null) {
            return null;
        }
        return periodoRepository.findFirstByFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(fecha, fecha)
                .map(PeriodoAcademico::getId)
                .orElse(null);
    }

    private PeriodoAcademico obtener(Long id) {
        return periodoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Periodo academico no encontrado con id: " + id));
    }

    private void validarFechas(LocalDate inicio, LocalDate fin) {
        if (fin.isBefore(inicio)) {
            throw new ReferenciaInvalidaException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }
    }

    /**
     * Dos periodos del mismo año no pueden solaparse en fechas. Solape estricto: se permite que un
     * periodo empiece el mismo día en que termina otro (trimestres contiguos comparten el día de borde).
     */
    private void validarSolape(Integer anio, LocalDate inicio, LocalDate fin, Long idExcluir) {
        boolean solapa = periodoRepository.findByAnio(anio).stream()
                .filter(p -> idExcluir == null || !p.getId().equals(idExcluir))
                .anyMatch(p -> inicio.isBefore(p.getFechaFin()) && p.getFechaInicio().isBefore(fin));
        if (solapa) {
            throw new ReferenciaInvalidaException(
                    "El periodo se solapa en fechas con otro periodo del año " + anio + ".");
        }
    }

    private PeriodoAcademicoDTO toDTO(PeriodoAcademico p) {
        return new PeriodoAcademicoDTO(p.getId(), p.getNombre(), p.getAnio(), p.getFechaInicio(), p.getFechaFin());
    }
}
