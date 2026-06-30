package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.AuthClient;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.AsignaturaDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.service.DocenteEspecialidadService;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.repository.CursoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsignaturaService {

    private final AsignaturaRepository asignaturaRepository;
    private final CursoRepository cursoRepository;
    private final AuthClient authClient;
    private final DocenteEspecialidadService docenteEspecialidadService;

    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listar() {
        return asignaturaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listarPorCurso(Long idCurso) {
        return asignaturaRepository.findByIdCurso(idCurso).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listarPorDocente(Long idDocente) {
        return asignaturaRepository.findByIdDocente(idDocente).stream().map(this::toDTO).toList();
    }

    /** Asignaturas del docente autenticado (su idUsuario == idDocente; sin id en la ruta → sin enumeración). */
    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listarMias() {
        return asignaturaRepository.findByIdDocente(idUsuarioActual()).stream().map(this::toDTO).toList();
    }

    /** True si el docente autenticado dicta alguna asignatura del curso (verificación de pertenencia). */
    @Transactional(readOnly = true)
    public boolean dictoCurso(Long idCurso) {
        Long idDocente = idUsuarioActual();
        return idDocente != null && asignaturaRepository.existsByIdDocenteAndIdCurso(idDocente, idCurso);
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

    @Transactional(readOnly = true)
    public AsignaturaDTO buscarPorId(Long id) {
        Asignatura asignatura = asignaturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asignatura no encontrada con id: " + id));
        return toDTO(asignatura);
    }

    @Transactional
    public AsignaturaDTO crear(AgregarAsignatura req, String authHeader) {
        if (!cursoRepository.existsById(req.getIdCurso())) {
            throw new ReferenciaInvalidaException("Curso no existe con id: " + req.getIdCurso());
        }
        authClient.verificarUsuarioEsDocente(req.getIdDocente(), authHeader);
        verificarEspecialidad(req.getIdDocente(), req.getNombre());

        Asignatura asignatura = new Asignatura();
        asignatura.setNombre(req.getNombre());
        asignatura.setIdCurso(req.getIdCurso());
        asignatura.setIdDocente(req.getIdDocente());
        log.info("Creando asignatura: {}", req.getNombre());
        return toDTO(asignaturaRepository.save(asignatura));
    }

    @Transactional
    public AsignaturaDTO actualizar(Long id, ActualizarAsignatura req, String authHeader) {
        Asignatura asignatura = asignaturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asignatura no encontrada con id: " + id));

        if (!cursoRepository.existsById(req.getIdCurso())) {
            throw new ReferenciaInvalidaException("Curso no existe con id: " + req.getIdCurso());
        }
        authClient.verificarUsuarioEsDocente(req.getIdDocente(), authHeader);
        verificarEspecialidad(req.getIdDocente(), req.getNombre());

        asignatura.setNombre(req.getNombre());
        asignatura.setIdCurso(req.getIdCurso());
        asignatura.setIdDocente(req.getIdDocente());
        return toDTO(asignaturaRepository.save(asignatura));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!asignaturaRepository.existsById(id)) {
            throw new EntityNotFoundException("Asignatura no encontrada con id: " + id);
        }
        asignaturaRepository.deleteById(id);
    }

    /** Un docente solo dicta materias de su especialidad: la materia debe estar en sus especialidades. */
    private void verificarEspecialidad(Long idDocente, String materia) {
        if (!docenteEspecialidadService.puedeDictar(idDocente, materia)) {
            throw new ReferenciaInvalidaException(
                    "El docente no tiene la especialidad para dictar \"" + (materia == null ? "" : materia.trim()) + "\".");
        }
    }

    private AsignaturaDTO toDTO(Asignatura a) {
        return new AsignaturaDTO(a.getId(), a.getNombre(), a.getIdCurso(), a.getIdDocente());
    }
}
