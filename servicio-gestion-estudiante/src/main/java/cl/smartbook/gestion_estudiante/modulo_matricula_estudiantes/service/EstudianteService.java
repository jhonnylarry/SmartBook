package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import cl.smartbook.gestion_estudiante.client.AuthClient;
import cl.smartbook.gestion_estudiante.client.dto.CrearUsuarioRequest;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteBusquedaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDetalleDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.RosterEstudianteDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Estudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.ActualizarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.AgregarEstudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.EstudianteRepository;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.MatriculaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaRepository matriculaRepository;
    private final AuthClient authClient;

    /** Compañeros del curso VIGENTE del estudiante autenticado (self, sin idCurso en la ruta → sin enumeración). */
    @Transactional(readOnly = true)
    public List<RosterEstudianteDTO> companerosDe(Long idUsuario) {
        Estudiante yo = estudianteRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("No existe estudiante para el usuario " + idUsuario));
        Long idCurso = matriculaRepository.findByEstudianteIdAndEstado(yo.getId(), EstadoMatricula.VIGENTE).stream()
                .map(Matricula::getIdCurso).findFirst().orElse(null);
        if (idCurso == null) {
            return List.of();
        }
        return matriculaRepository.findByIdCursoAndEstado(idCurso, EstadoMatricula.VIGENTE).stream()
                .map(Matricula::getEstudiante)
                .filter(e -> !e.getId().equals(yo.getId()))
                .map(e -> toRoster(e, idCurso))
                .sorted(Comparator.comparing(RosterEstudianteDTO::apellido).thenComparing(RosterEstudianteDTO::nombre))
                .toList();
    }

    /** Roster de estudiantes con matrícula VIGENTE de un curso (consumo de staff/docente). */
    @Transactional(readOnly = true)
    public List<RosterEstudianteDTO> rosterDeCurso(Long idCurso) {
        return matriculaRepository.findByIdCursoAndEstado(idCurso, EstadoMatricula.VIGENTE).stream()
                .map(m -> toRoster(m.getEstudiante(), idCurso))
                .sorted(Comparator.comparing(RosterEstudianteDTO::apellido).thenComparing(RosterEstudianteDTO::nombre))
                .toList();
    }

    private RosterEstudianteDTO toRoster(Estudiante e, Long idCurso) {
        return new RosterEstudianteDTO(e.getId(), e.getIdUsuario(), e.getNombre(), e.getApellido(), idCurso);
    }

    @Transactional(readOnly = true)
    public List<EstudianteDTO> listarTodos() {
        return estudianteRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Buscador avanzado de estudiantes por texto (nombre/apellido/rut) y/o curso vigente.
     * Normaliza el texto (trim + minúsculas; vacío → null) y delega el filtrado al repositorio.
     */
    @Transactional(readOnly = true)
    public List<EstudianteBusquedaDTO> buscar(String texto, Long idCurso) {
        // Texto vacío (no null) cuando no hay filtro → 'LIKE %%' matchea a todos sin el error de
        // Postgres 'text ~~ bytea' que provoca un null sin tipo dentro de LIKE.
        // Se escapan los comodines LIKE (\ % _) para que la búsqueda sea LITERAL (la query usa ESCAPE '\').
        String t = (texto == null) ? "" : texto.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return estudianteRepository.buscar(t, idCurso);
    }

    @Transactional(readOnly = true)
    public EstudianteDetalleDTO buscarPorId(Long id) {
        var e = buscarEntidadOFallar(id);
        return toDetalleDto(e);
    }

    @Transactional(readOnly = true)
    public EstudianteDetalleDTO buscarPorIdUsuario(Long idUsuario) {
        var e = estudianteRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe estudiante para el usuario " + idUsuario));
        return toDetalleDto(e);
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
        e.setDireccion(nuevo.getDireccion());
        e.setTelefono(nuevo.getTelefono());
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
        if (request.getDireccion() != null) e.setDireccion(request.getDireccion());
        if (request.getTelefono() != null) e.setTelefono(request.getTelefono());
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
                e.getApellido(), e.getRut(), e.getFechaNacimiento(),
                e.getDireccion(), e.getTelefono());
    }

    private EstudianteDetalleDTO toDetalleDto(Estudiante e) {
        var matriculas = e.getMatriculas() == null ? List.<MatriculaDTO>of() :
                e.getMatriculas().stream().map(this::toMatriculaDto).toList();
        return new EstudianteDetalleDTO(
                e.getId(), e.getIdUsuario(), e.getNombre(), e.getApellido(),
                e.getRut(), e.getFechaNacimiento(), e.getDireccion(), e.getTelefono(), matriculas);
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
