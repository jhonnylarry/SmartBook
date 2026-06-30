package cl.smartbook.gestion_academica.modulo_cierre_asignaturas.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.EstadoInvalidoException;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.dto.EstadoCierreDTO;
import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.entity.CierreAsignatura;
import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.repository.CierreAsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.repository.PeriodoAcademicoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CierreAsignaturaService {

    private final CierreAsignaturaRepository cierreRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final PeriodoAcademicoRepository periodoRepository;

    /** Todos los periodos cerrados de una asignatura (para que la UI conozca su estado de un vistazo). */
    @Transactional(readOnly = true)
    public List<EstadoCierreDTO> listarCierres(Long idAsignatura) {
        return cierreRepository.findByIdAsignatura(idAsignatura).stream()
                .map(c -> new EstadoCierreDTO(c.getIdAsignatura(), c.getIdPeriodo(), true, c.getFechaCierre()))
                .toList();
    }

    @Transactional(readOnly = true)
    public EstadoCierreDTO estado(Long idAsignatura, Long idPeriodo) {
        return cierreRepository.findByIdAsignaturaAndIdPeriodo(idAsignatura, idPeriodo)
                .map(c -> new EstadoCierreDTO(idAsignatura, idPeriodo, true, c.getFechaCierre()))
                .orElse(new EstadoCierreDTO(idAsignatura, idPeriodo, false, null));
    }

    /** True si la asignatura está cerrada en ese periodo. Periodo null → nunca bloquea (legado/sin periodo). */
    @Transactional(readOnly = true)
    public boolean estaCerrada(Long idAsignatura, Long idPeriodo) {
        if (idAsignatura == null || idPeriodo == null) {
            return false;
        }
        return cierreRepository.existsByIdAsignaturaAndIdPeriodo(idAsignatura, idPeriodo);
    }

    @Transactional
    public EstadoCierreDTO cerrar(Long idAsignatura, Long idPeriodo) {
        if (!asignaturaRepository.existsById(idAsignatura)) {
            throw new EntityNotFoundException("Asignatura no encontrada con id: " + idAsignatura);
        }
        if (!periodoRepository.existsById(idPeriodo)) {
            throw new ReferenciaInvalidaException("Periodo academico no existe con id: " + idPeriodo);
        }
        if (cierreRepository.existsByIdAsignaturaAndIdPeriodo(idAsignatura, idPeriodo)) {
            throw new EstadoInvalidoException("La asignatura ya está cerrada para este periodo.");
        }
        CierreAsignatura cierre = new CierreAsignatura();
        cierre.setIdAsignatura(idAsignatura);
        cierre.setIdPeriodo(idPeriodo);
        cierre.setIdUsuarioCierre(idUsuarioActual());
        CierreAsignatura guardado = cierreRepository.save(cierre);
        log.info("Cierre de asignatura {} en periodo {} por usuario {}", idAsignatura, idPeriodo, idUsuarioActual());
        return new EstadoCierreDTO(idAsignatura, idPeriodo, true, guardado.getFechaCierre());
    }

    @Transactional
    public EstadoCierreDTO reabrir(Long idAsignatura, Long idPeriodo) {
        CierreAsignatura cierre = cierreRepository.findByIdAsignaturaAndIdPeriodo(idAsignatura, idPeriodo)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La asignatura no está cerrada en el periodo " + idPeriodo));
        cierreRepository.delete(cierre);
        log.info("Reapertura de asignatura {} en periodo {} por usuario {}", idAsignatura, idPeriodo, idUsuarioActual());
        return new EstadoCierreDTO(idAsignatura, idPeriodo, false, null);
    }

    /** id del usuario autenticado desde el JWT (Authentication.details), o null si no disponible. */
    private Long idUsuarioActual() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return null;
        }
        try {
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
