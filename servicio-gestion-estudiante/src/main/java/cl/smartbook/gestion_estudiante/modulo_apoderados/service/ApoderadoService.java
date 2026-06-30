package cl.smartbook.gestion_estudiante.modulo_apoderados.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto.ApoderadoDTO;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto.PupiloDTO;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.Apoderado;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.TipoApoderado;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.request.ActualizarApoderado;
import cl.smartbook.gestion_estudiante.modulo_apoderados.repository.ApoderadoRepository;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Estudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.EstudianteRepository;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.MatriculaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApoderadoService {

    private final ApoderadoRepository apoderadoRepository;
    private final EstudianteRepository estudianteRepository;
    private final MatriculaRepository matriculaRepository;

    @Transactional(readOnly = true)
    public List<ApoderadoDTO> listarPorEstudiante(Long idEstudiante) {
        return apoderadoRepository.findByIdEstudiante(idEstudiante).stream()
                .map(this::toDto)
                .toList();
    }

    /** Apoderados de todos los estudiantes con matrícula vigente de un curso (batch para mensajería). */
    @Transactional(readOnly = true)
    public List<ApoderadoDTO> apoderadosDeCurso(Long idCurso) {
        List<Long> idsEstudiante = matriculaRepository.findByIdCursoAndEstado(idCurso, EstadoMatricula.VIGENTE).stream()
                .map(m -> m.getEstudiante().getId())
                .toList();
        if (idsEstudiante.isEmpty()) {
            return List.of();
        }
        return apoderadoRepository.findByIdEstudianteIn(idsEstudiante).stream()
                .map(this::toDto)
                .toList();
    }

    /** Pupilos (estudiantes a cargo) del apoderado autenticado, identificado por su idUsuario (JWT). */
    @Transactional(readOnly = true)
    public List<PupiloDTO> misPupilos(Long idUsuario) {
        return apoderadoRepository.findByIdUsuario(idUsuario).stream()
                .map(this::toPupilo)
                .toList();
    }

    /** True si el usuario (apoderado) es tutor del estudiante indicado. Base del control anti-IDOR. */
    @Transactional(readOnly = true)
    public boolean esApoderadoDe(Long idUsuario, Long idEstudiante) {
        return apoderadoRepository.existsByIdUsuarioAndIdEstudiante(idUsuario, idEstudiante);
    }

    private PupiloDTO toPupilo(Apoderado a) {
        Estudiante e = estudianteRepository.findById(a.getIdEstudiante()).orElse(null);
        List<Matricula> mats = matriculaRepository.findByEstudianteId(a.getIdEstudiante());
        Long idCurso = mats.stream()
                .filter(m -> m.getEstado() == EstadoMatricula.VIGENTE)
                .map(Matricula::getIdCurso)
                .findFirst()
                .orElseGet(() -> mats.stream().map(Matricula::getIdCurso).findFirst().orElse(null));
        return new PupiloDTO(
                a.getIdEstudiante(),
                e != null ? e.getNombre() : null,
                e != null ? e.getApellido() : null,
                e != null ? e.getRut() : null,
                idCurso,
                a.getTipo(),
                a.getParentesco());
    }

    @Transactional(readOnly = true)
    public ApoderadoDTO buscarPorId(Long id) {
        return toDto(buscarEntidadOFallar(id));
    }

    @Transactional
    public ApoderadoDTO actualizar(Long id, ActualizarApoderado request) {
        var apoderado = buscarEntidadOFallar(id);
        if (request.getNombre() != null) apoderado.setNombre(request.getNombre());
        if (request.getApellido() != null) apoderado.setApellido(request.getApellido());
        if (request.getTelefono() != null) apoderado.setTelefono(request.getTelefono());
        if (request.getEmail() != null) apoderado.setEmail(request.getEmail());
        if (request.getParentesco() != null) apoderado.setParentesco(request.getParentesco());
        log.info("Actualizando apoderado id={}", id);
        return toDto(apoderadoRepository.save(apoderado));
    }

    /**
     * Método interno reutilizable para persistir un apoderado a partir de datos planos.
     * Se llama dentro de un contexto @Transactional del servicio orquestador.
     */
    public Apoderado crearApoderado(String nombre, String apellido, String rut,
                                    String email, String telefono, String parentesco,
                                    Long idEstudiante, Long idUsuario, TipoApoderado tipo) {
        var apoderado = new Apoderado();
        apoderado.setNombre(nombre);
        apoderado.setApellido(apellido);
        apoderado.setRut(rut);
        apoderado.setEmail(email);
        apoderado.setTelefono(telefono);
        apoderado.setParentesco(parentesco);
        apoderado.setIdEstudiante(idEstudiante);
        apoderado.setIdUsuario(idUsuario);
        apoderado.setTipo(tipo);
        log.info("Creando apoderado {} {} tipo={} para estudiante id={}", nombre, apellido, tipo, idEstudiante);
        return apoderadoRepository.save(apoderado);
    }

    private Apoderado buscarEntidadOFallar(Long id) {
        return apoderadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Apoderado no encontrado con id: " + id));
    }

    public ApoderadoDTO toDto(Apoderado a) {
        return new ApoderadoDTO(
                a.getId(),
                a.getIdEstudiante(),
                a.getIdUsuario(),
                a.getTipo(),
                a.getNombre(),
                a.getApellido(),
                a.getRut(),
                a.getEmail(),
                a.getTelefono(),
                a.getParentesco());
    }
}
