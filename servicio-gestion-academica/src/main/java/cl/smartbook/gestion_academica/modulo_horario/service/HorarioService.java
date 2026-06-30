package cl.smartbook.gestion_academica.modulo_horario.service;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_horario.model.dto.BloqueHorarioDTO;
import cl.smartbook.gestion_academica.modulo_horario.model.entity.BloqueHorario;
import cl.smartbook.gestion_academica.modulo_horario.model.request.ActualizarBloqueHorario;
import cl.smartbook.gestion_academica.modulo_horario.model.request.AgregarBloqueHorario;
import cl.smartbook.gestion_academica.modulo_horario.repository.BloqueHorarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HorarioService {

    private final BloqueHorarioRepository bloqueRepository;
    private final AsignaturaRepository asignaturaRepository;

    @Transactional(readOnly = true)
    public List<BloqueHorarioDTO> listarPorAsignatura(Long idAsignatura) {
        return aDtos(bloqueRepository.findByIdAsignaturaOrderByDiaSemanaAscHoraInicioAsc(idAsignatura));
    }

    @Transactional(readOnly = true)
    public List<BloqueHorarioDTO> listarPorCurso(Long idCurso) {
        List<Long> ids = asignaturaRepository.findByIdCurso(idCurso).stream().map(Asignatura::getId).toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        return aDtos(bloqueRepository.findByIdAsignaturaInOrderByDiaSemanaAscHoraInicioAsc(ids));
    }

    @Transactional(readOnly = true)
    public List<BloqueHorarioDTO> listarPorDocente(Long idDocente) {
        List<Long> ids = asignaturaRepository.findByIdDocente(idDocente).stream().map(Asignatura::getId).toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        return aDtos(bloqueRepository.findByIdAsignaturaInOrderByDiaSemanaAscHoraInicioAsc(ids));
    }

    @Transactional
    public BloqueHorarioDTO crear(AgregarBloqueHorario req) {
        Asignatura asignatura = asignaturaExistente(req.getIdAsignatura());
        validarHoras(req.getHoraInicio(), req.getHoraFin());

        BloqueHorario bloque = new BloqueHorario();
        bloque.setIdAsignatura(req.getIdAsignatura());
        bloque.setDiaSemana(req.getDiaSemana());
        bloque.setHoraInicio(req.getHoraInicio());
        bloque.setHoraFin(req.getHoraFin());
        bloque.setSala(req.getSala());
        log.info("Creando bloque de horario: asignatura={} {} {}-{}", req.getIdAsignatura(),
                req.getDiaSemana(), req.getHoraInicio(), req.getHoraFin());
        return toDTO(bloqueRepository.save(bloque), asignatura.getNombre());
    }

    @Transactional
    public BloqueHorarioDTO actualizar(Long id, ActualizarBloqueHorario req) {
        BloqueHorario bloque = bloqueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bloque de horario no encontrado con id: " + id));
        Asignatura asignatura = asignaturaExistente(req.getIdAsignatura());
        validarHoras(req.getHoraInicio(), req.getHoraFin());

        bloque.setIdAsignatura(req.getIdAsignatura());
        bloque.setDiaSemana(req.getDiaSemana());
        bloque.setHoraInicio(req.getHoraInicio());
        bloque.setHoraFin(req.getHoraFin());
        bloque.setSala(req.getSala());
        log.info("Actualizando bloque de horario id={}", id);
        return toDTO(bloqueRepository.save(bloque), asignatura.getNombre());
    }

    @Transactional
    public void eliminar(Long id) {
        if (!bloqueRepository.existsById(id)) {
            throw new EntityNotFoundException("Bloque de horario no encontrado con id: " + id);
        }
        log.info("Eliminando bloque de horario id={}", id);
        bloqueRepository.deleteById(id);
    }

    private Asignatura asignaturaExistente(Long idAsignatura) {
        return asignaturaRepository.findById(idAsignatura)
                .orElseThrow(() -> new ReferenciaInvalidaException("La asignatura " + idAsignatura + " no existe"));
    }

    private void validarHoras(LocalTime inicio, LocalTime fin) {
        if (inicio == null || fin == null || !fin.isAfter(inicio)) {
            throw new ReferenciaInvalidaException("La hora de fin debe ser posterior a la hora de inicio");
        }
    }

    private List<BloqueHorarioDTO> aDtos(List<BloqueHorario> bloques) {
        if (bloques.isEmpty()) {
            return List.of();
        }
        List<Long> ids = bloques.stream().map(BloqueHorario::getIdAsignatura).distinct().toList();
        Map<Long, String> nombres = asignaturaRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Asignatura::getId, Asignatura::getNombre));
        return bloques.stream()
                .map(b -> toDTO(b, nombres.getOrDefault(b.getIdAsignatura(), "Asignatura #" + b.getIdAsignatura())))
                .toList();
    }

    private BloqueHorarioDTO toDTO(BloqueHorario b, String nombreAsignatura) {
        return new BloqueHorarioDTO(b.getId(), b.getIdAsignatura(), nombreAsignatura,
                b.getDiaSemana(), b.getHoraInicio(), b.getHoraFin(), b.getSala());
    }
}
