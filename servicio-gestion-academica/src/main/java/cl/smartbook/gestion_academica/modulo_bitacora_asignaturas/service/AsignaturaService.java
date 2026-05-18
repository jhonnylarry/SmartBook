package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.AuthClient;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.AsignaturaDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarAsignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
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

    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listar() {
        return asignaturaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AsignaturaDTO> listarPorCurso(Long idCurso) {
        return asignaturaRepository.findByIdCurso(idCurso).stream().map(this::toDTO).toList();
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

    private AsignaturaDTO toDTO(Asignatura a) {
        return new AsignaturaDTO(a.getId(), a.getNombre(), a.getIdCurso(), a.getIdDocente());
    }
}
