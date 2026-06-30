package cl.smartbook.gestion_academica.modulo_gestion_notas.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.EstadoInvalidoException;
import cl.smartbook.gestion_academica.client.EstudianteClient;
import cl.smartbook.gestion_academica.client.MensajeriaClient;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.client.dto.ApoderadoRefDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Evaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.EvaluacionRepository;
import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.service.CierreAsignaturaService;
import cl.smartbook.gestion_academica.modulo_periodos_academicos.service.PeriodoAcademicoService;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.BoletinAsignaturaDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.NotaBoletinDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.NotaDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.dto.PromedioEstudianteDTO;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.entity.Nota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.ActualizarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.model.request.AgregarNota;
import cl.smartbook.gestion_academica.modulo_gestion_notas.repository.NotaRepository;
import cl.smartbook.gestion_academica.seguridad.SeguridadDocente;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotaService {

    private final NotaRepository notaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final EstudianteClient estudianteClient;
    private final CierreAsignaturaService cierreService;
    private final PeriodoAcademicoService periodoService;
    private final MensajeriaClient mensajeriaClient;
    private final SeguridadDocente seguridadDocente;

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

    /** Notas del estudiante autenticado: el idEstudiante se resuelve desde el JWT (sin id en la ruta → sin IDOR). */
    @Transactional(readOnly = true)
    public List<NotaDTO> listarMias(String authHeader) {
        Long idEstudiante = estudianteClient.obtenerMiEstudiante(authHeader).id();
        return listarPorEstudiante(idEstudiante);
    }

    /** Notas de un hijo del apoderado autenticado: solo si gestion-estudiante confirma el vínculo (anti-IDOR). */
    @Transactional(readOnly = true)
    public List<NotaDTO> listarDeHijo(Long idEstudiante, String authHeader) {
        estudianteClient.verificarApoderadoDe(idEstudiante, authHeader);
        return listarPorEstudiante(idEstudiante);
    }

    @Transactional(readOnly = true)
    public List<NotaDTO> listarPorEvaluacion(Long idEvaluacion) {
        // Mínimo privilegio: un DOCENTE solo lee notas de evaluaciones de SUS asignaturas (404 si no existe).
        Evaluacion ev = evaluacionRepository.findById(idEvaluacion)
                .orElseThrow(() -> new EntityNotFoundException("Evaluacion no encontrada con id: " + idEvaluacion));
        seguridadDocente.verificarDictaAsignatura(ev.getIdAsignatura());
        return notaRepository.findByIdEvaluacion(idEvaluacion).stream().map(this::toDTO).toList();
    }

    // ── Boletín con promedio ponderado ──

    /** Boletín del estudiante autenticado (id resuelto desde el JWT, sin id en la ruta → sin IDOR). */
    @Transactional(readOnly = true)
    public List<BoletinAsignaturaDTO> miBoletin(String authHeader) {
        return boletinDe(estudianteClient.obtenerMiEstudiante(authHeader).id());
    }

    /** Boletín de un hijo del apoderado autenticado: solo si gestion-estudiante confirma el vínculo (anti-IDOR). */
    @Transactional(readOnly = true)
    public List<BoletinAsignaturaDTO> boletinDeHijo(Long idEstudiante, String authHeader) {
        estudianteClient.verificarApoderadoDe(idEstudiante, authHeader);
        return boletinDe(idEstudiante);
    }

    /** Boletín por asignatura del estudiante: agrupa sus notas y calcula el promedio ponderado de cada asignatura. */
    @Transactional(readOnly = true)
    public List<BoletinAsignaturaDTO> boletinDe(Long idEstudiante) {
        List<Nota> notas = notaRepository.findByIdEstudiante(idEstudiante);
        if (notas.isEmpty()) {
            return List.of();
        }
        List<Long> idsEvaluacion = notas.stream().map(Nota::getIdEvaluacion).distinct().toList();
        Map<Long, Evaluacion> evaluaciones = evaluacionRepository.findAllById(idsEvaluacion).stream()
                .collect(Collectors.toMap(Evaluacion::getId, e -> e));

        Map<Long, List<Nota>> porAsignatura = notas.stream()
                .filter(n -> evaluaciones.containsKey(n.getIdEvaluacion()))
                .collect(Collectors.groupingBy(n -> evaluaciones.get(n.getIdEvaluacion()).getIdAsignatura()));

        Map<Long, String> nombresAsignatura = asignaturaRepository.findAllById(porAsignatura.keySet()).stream()
                .collect(Collectors.toMap(Asignatura::getId, Asignatura::getNombre));

        List<BoletinAsignaturaDTO> boletin = new ArrayList<>();
        for (var entrada : porAsignatura.entrySet()) {
            Long idAsignatura = entrada.getKey();
            List<Nota> notasAsignatura = entrada.getValue();
            List<NotaBoletinDTO> filas = notasAsignatura.stream()
                    .map(n -> {
                        Evaluacion ev = evaluaciones.get(n.getIdEvaluacion());
                        return new NotaBoletinDTO(ev.getId(), ev.getNombre(), ev.getPonderacion(), n.getCalificacion());
                    })
                    .sorted(Comparator.comparing(NotaBoletinDTO::nombreEvaluacion))
                    .toList();
            boletin.add(new BoletinAsignaturaDTO(idAsignatura,
                    nombresAsignatura.getOrDefault(idAsignatura, "Asignatura #" + idAsignatura),
                    promedioPonderado(notasAsignatura, evaluaciones), filas));
        }
        boletin.sort(Comparator.comparing(BoletinAsignaturaDTO::nombreAsignatura));
        return boletin;
    }

    /** Promedio ponderado de cada estudiante en una asignatura (libro de notas del docente). */
    @Transactional(readOnly = true)
    public List<PromedioEstudianteDTO> promediosDeAsignatura(Long idAsignatura) {
        // Mínimo privilegio: un DOCENTE solo ve promedios de SUS asignaturas; ADMIN/DIRECTOR cualquiera.
        seguridadDocente.verificarDictaAsignatura(idAsignatura);
        List<Evaluacion> evaluaciones = evaluacionRepository.findByIdAsignatura(idAsignatura);
        if (evaluaciones.isEmpty()) {
            return List.of();
        }
        Map<Long, Evaluacion> mapaEval = evaluaciones.stream()
                .collect(Collectors.toMap(Evaluacion::getId, e -> e));
        List<Nota> notas = notaRepository.findByIdEvaluacionIn(mapaEval.keySet().stream().toList());
        return notas.stream()
                .collect(Collectors.groupingBy(Nota::getIdEstudiante)).entrySet().stream()
                .map(e -> new PromedioEstudianteDTO(e.getKey(), promedioPonderado(e.getValue(), mapaEval), e.getValue().size()))
                .sorted(Comparator.comparing(PromedioEstudianteDTO::idEstudiante))
                .toList();
    }

    /** Σ(calificación × ponderación) / Σ(ponderación), 1 decimal. null si no hay ponderación acumulada. */
    private BigDecimal promedioPonderado(List<Nota> notas, Map<Long, Evaluacion> evaluaciones) {
        BigDecimal sumaPonderacion = BigDecimal.ZERO;
        BigDecimal sumaCalificacionPonderada = BigDecimal.ZERO;
        for (Nota n : notas) {
            Evaluacion ev = evaluaciones.get(n.getIdEvaluacion());
            if (ev == null || ev.getPonderacion() == null || n.getCalificacion() == null) {
                continue;
            }
            sumaPonderacion = sumaPonderacion.add(ev.getPonderacion());
            sumaCalificacionPonderada = sumaCalificacionPonderada.add(n.getCalificacion().multiply(ev.getPonderacion()));
        }
        if (sumaPonderacion.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return sumaCalificacionPonderada.divide(sumaPonderacion, 1, RoundingMode.HALF_UP);
    }

    @Transactional
    public NotaDTO crear(AgregarNota req, String authHeader) {
        Evaluacion ev = evaluacionRepository.findById(req.getIdEvaluacion())
                .orElseThrow(() -> new ReferenciaInvalidaException("Evaluacion no existe con id: " + req.getIdEvaluacion()));
        seguridadDocente.verificarDictaAsignatura(ev.getIdAsignatura());
        verificarNoCerrada(ev);
        estudianteClient.verificarEstudianteExiste(req.getIdEstudiante(), authHeader);

        Nota nota = new Nota();
        nota.setIdEvaluacion(req.getIdEvaluacion());
        nota.setIdEstudiante(req.getIdEstudiante());
        nota.setCalificacion(req.getCalificacion());
        log.info("Creando nota para estudiante {} en evaluacion {}",
                req.getIdEstudiante(), req.getIdEvaluacion());
        Nota guardada = notaRepository.save(nota);
        notificarApoderados(ev, guardada.getIdEstudiante(), guardada.getCalificacion(), authHeader, false);
        return toDTO(guardada);
    }

    @Transactional
    public NotaDTO actualizar(Long id, ActualizarNota req, String authHeader) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota no encontrada con id: " + id));

        Evaluacion ev = evaluacionRepository.findById(req.getIdEvaluacion())
                .orElseThrow(() -> new ReferenciaInvalidaException("Evaluacion no existe con id: " + req.getIdEvaluacion()));
        seguridadDocente.verificarDictaAsignatura(ev.getIdAsignatura());
        verificarNoCerrada(ev);
        estudianteClient.verificarEstudianteExiste(req.getIdEstudiante(), authHeader);

        nota.setIdEvaluacion(req.getIdEvaluacion());
        nota.setIdEstudiante(req.getIdEstudiante());
        nota.setCalificacion(req.getCalificacion());
        Nota guardada = notaRepository.save(nota);
        notificarApoderados(ev, guardada.getIdEstudiante(), guardada.getCalificacion(), authHeader, true);
        return toDTO(guardada);
    }

    @Transactional
    public void eliminar(Long id) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota no encontrada con id: " + id));
        evaluacionRepository.findById(nota.getIdEvaluacion()).ifPresent(this::verificarNoCerrada);
        notaRepository.deleteById(id);
    }

    private NotaDTO toDTO(Nota n) {
        return new NotaDTO(n.getId(), n.getIdEvaluacion(), n.getIdEstudiante(), n.getCalificacion());
    }

    /**
     * Bloquea modificar notas de una asignatura cerrada en el periodo de la evaluación (→ 409).
     * Si la evaluación no tiene idPeriodo (evaluaciones de legado), se deriva por su fecha — así el
     * cierre también aplica a evaluaciones antiguas cuya fecha cae dentro de un periodo cerrado.
     */
    private void verificarNoCerrada(Evaluacion ev) {
        Long idPeriodo = ev.getIdPeriodo() != null ? ev.getIdPeriodo() : periodoService.periodoParaFecha(ev.getFecha());
        if (cierreService.estaCerrada(ev.getIdAsignatura(), idPeriodo)) {
            throw new EstadoInvalidoException(
                    "La asignatura está cerrada para este periodo; no se pueden modificar sus notas.");
        }
    }

    /**
     * Avisa a los apoderados del estudiante que se registró/actualizó una nota (reenvía el JWT del
     * docente → mensajería lo toma como remitente). Best-effort: ningún fallo afecta el guardado.
     */
    private void notificarApoderados(Evaluacion ev, Long idEstudiante, java.math.BigDecimal calificacion,
                                     String authHeader, boolean esActualizacion) {
        try {
            List<ApoderadoRefDTO> apoderados = estudianteClient.obtenerApoderados(idEstudiante, authHeader);
            if (apoderados.isEmpty()) {
                return;
            }
            String asignatura = asignaturaRepository.findById(ev.getIdAsignatura())
                    .map(Asignatura::getNombre).orElse("la asignatura");
            String estudiante;
            try {
                var e = estudianteClient.obtenerEstudiante(idEstudiante, authHeader);
                estudiante = e.nombre() + " " + e.apellido();
            } catch (Exception e) {
                estudiante = "el estudiante";
            }
            String asunto = (esActualizacion ? "Nota actualizada en " : "Nueva calificación en ") + asignatura;
            String contenido = (esActualizacion ? "Se actualizó la nota a " : "Se registró la nota ") + calificacion
                    + " en la evaluación \"" + ev.getNombre() + "\" de " + asignatura + " para " + estudiante + ".";
            for (ApoderadoRefDTO ap : apoderados) {
                if (ap.idUsuario() != null) {
                    mensajeriaClient.enviarMensaje(ap.idUsuario(), asunto, contenido, authHeader);
                }
            }
        } catch (Exception e) {
            log.warn("Aviso de nota a apoderados falló (estudiante {}): {}", idEstudiante, e.getMessage());
        }
    }

}
