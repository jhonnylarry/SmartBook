package cl.smartbook.anotacion.modulo_gestion_anotaciones.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.anotacion.client.AuthClient;
import cl.smartbook.anotacion.client.EstudianteClient;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.Anotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request.ActualizarAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request.AgregarAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.repository.AnotacionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnotacionService {

    private final AnotacionRepository anotacionRepository;
    private final EstudianteClient estudianteClient;
    private final AuthClient authClient;

    @Transactional(readOnly = true)
    public List<AnotacionDTO> listar() {
        return anotacionRepository.findAll(Sort.by("fecha").descending())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public AnotacionDTO buscarPorId(Long id) {
        Anotacion anotacion = anotacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Anotacion no encontrada con id: " + id));
        return toDTO(anotacion);
    }

    @Transactional(readOnly = true)
    public List<AnotacionDTO> listarPorEstudiante(Long idEstudiante) {
        return anotacionRepository.findByIdEstudianteOrderByFechaDesc(idEstudiante)
                .stream().map(this::toDTO).toList();
    }

    /** Anotaciones del estudiante autenticado: idEstudiante resuelto desde el JWT (sin id en la ruta → sin IDOR). */
    @Transactional(readOnly = true)
    public List<AnotacionDTO> listarMias(String authHeader) {
        Long idEstudiante = estudianteClient.obtenerMiEstudiante(authHeader).id();
        return listarPorEstudiante(idEstudiante);
    }

    /** Anotaciones de un hijo del apoderado autenticado: solo si gestion-estudiante confirma el vínculo (anti-IDOR). */
    @Transactional(readOnly = true)
    public List<AnotacionDTO> listarDeHijo(Long idEstudiante, String authHeader) {
        estudianteClient.verificarApoderadoDe(idEstudiante, authHeader);
        return listarPorEstudiante(idEstudiante);
    }

    @Transactional
    public AnotacionDTO crear(AgregarAnotacion req, String authHeader) {
        estudianteClient.verificarEstudianteExiste(req.getIdEstudiante(), authHeader);
        authClient.verificarUsuarioEsDocente(req.getIdDocente(), authHeader);

        Anotacion anotacion = new Anotacion();
        anotacion.setIdEstudiante(req.getIdEstudiante());
        anotacion.setIdDocente(req.getIdDocente());
        anotacion.setTipo(req.getTipo());
        anotacion.setGravedad(req.getGravedad());
        anotacion.setDescripcion(req.getDescripcion());
        anotacion.setFecha(req.getFecha());
        log.info("Creando anotacion para estudiante {}", req.getIdEstudiante());
        return toDTO(anotacionRepository.save(anotacion));
    }

    @Transactional
    public AnotacionDTO actualizar(Long id, ActualizarAnotacion req) {
        Anotacion anotacion = anotacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Anotacion no encontrada con id: " + id));

        if (req.getTipo() != null) anotacion.setTipo(req.getTipo());
        if (req.getGravedad() != null) anotacion.setGravedad(req.getGravedad());
        if (req.getDescripcion() != null) anotacion.setDescripcion(req.getDescripcion());
        if (req.getFecha() != null) anotacion.setFecha(req.getFecha());

        return toDTO(anotacionRepository.save(anotacion));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!anotacionRepository.existsById(id)) {
            throw new EntityNotFoundException("Anotacion no encontrada con id: " + id);
        }
        anotacionRepository.deleteById(id);
    }

    private AnotacionDTO toDTO(Anotacion a) {
        return new AnotacionDTO(
                a.getId(),
                a.getIdEstudiante(),
                a.getIdDocente(),
                a.getTipo(),
                a.getGravedad(),
                a.getDescripcion(),
                a.getFecha(),
                a.getFechaCreacion());
    }
}
