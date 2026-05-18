package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import cl.smartbook.gestion_estudiante.client.AuthClient;
import cl.smartbook.gestion_estudiante.client.dto.CrearUsuarioRequest;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDetalleDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Estudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.ActualizarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.AgregarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.EstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final AuthClient authClient;

    @Transactional(readOnly = true)
    public List<EstudianteDTO> listarTodos() {
        return estudianteRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EstudianteDetalleDTO buscarPorId(Long id) {
        var e = buscarEntidadOFallar(id);
        var matriculas = e.getMatriculas() == null ? List.<MatriculaDTO>of() :
                e.getMatriculas().stream().map(this::toMatriculaDto).toList();
        return new EstudianteDetalleDTO(
                e.getId(), e.getIdUsuario(), e.getNombre(), e.getApellido(),
                e.getRut(), e.getFechaNacimiento(), matriculas);
    }

    // Punto de entrada desde el controller — SIN @Transactional para que la llamada HTTP
    // a servicio-auth ocurra fuera de cualquier transacción de base de datos.
    public EstudianteDTO crearUsuarioYGuardar(AgregarEstudiante nuevo) {
        var attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        var authHeader = attrs.getRequest().getHeader("Authorization");

        // Sanitizar el username antes de enviarlo a servicio-auth
        String username = nuevo.getEmail().split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");

        var usuarioReq = new CrearUsuarioRequest();
        usuarioReq.setUsername(username);
        usuarioReq.setEmail(nuevo.getEmail());
        usuarioReq.setPassword(nuevo.getPassword());
        usuarioReq.setRol("ESTUDIANTE");

        // Llamada HTTP fuera de transacción
        var usuarioResp = authClient.crearUsuario(usuarioReq, authHeader);

        // El idUsuario ya está disponible; ahora abrimos la transacción solo para el insert
        return guardarEstudianteConIdUsuario(nuevo, usuarioResp.getId());
    }

    @Transactional
    public EstudianteDTO guardarEstudianteConIdUsuario(AgregarEstudiante nuevo, Long idUsuario) {
        var e = new Estudiante();
        e.setIdUsuario(idUsuario);
        e.setNombre(nuevo.getNombre());
        e.setApellido(nuevo.getApellido());
        e.setRut(nuevo.getRut());
        e.setFechaNacimiento(nuevo.getFechaNacimiento());
        log.info("Creando estudiante: {} {}", nuevo.getNombre(), nuevo.getApellido());
        return toDto(estudianteRepository.save(e));
    }

    @Transactional
    public EstudianteDTO actualizar(Long id, ActualizarEstudiante request) {
        var e = buscarEntidadOFallar(id);
        if (request.getNombre() != null) e.setNombre(request.getNombre());
        if (request.getApellido() != null) e.setApellido(request.getApellido());
        if (request.getRut() != null) e.setRut(request.getRut());
        if (request.getFechaNacimiento() != null) e.setFechaNacimiento(request.getFechaNacimiento());
        log.info("Actualizando estudiante id={}", id);
        return toDto(estudianteRepository.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!estudianteRepository.existsById(id)) {
            throw new EntityNotFoundException("Estudiante no encontrado con id: " + id);
        }
        log.info("Eliminando estudiante id={}", id);
        estudianteRepository.deleteById(id);
    }

    private Estudiante buscarEntidadOFallar(Long id) {
        return estudianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Estudiante no encontrado con id: " + id));
    }

    private EstudianteDTO toDto(Estudiante e) {
        return new EstudianteDTO(
                e.getId(), e.getIdUsuario(), e.getNombre(),
                e.getApellido(), e.getRut(), e.getFechaNacimiento());
    }

    private MatriculaDTO toMatriculaDto(Matricula m) {
        return new MatriculaDTO(
                m.getId(),
                m.getEstudiante().getId(),
                m.getIdCurso(),
                m.getFechaMatricula(),
                m.getEstado());
    }
}
