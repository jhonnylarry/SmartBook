package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.service;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import cl.smartbook.gestion_estudiante.client.AuthClient;
import cl.smartbook.gestion_estudiante.client.dto.CrearUsuarioRequest;
import cl.smartbook.gestion_estudiante.client.dto.UsuarioCreadoResponse;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.TipoApoderado;
import cl.smartbook.gestion_estudiante.modulo_apoderados.service.ApoderadoService;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.CredencialDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaCompletaResponse;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Estudiante;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.request.MatriculaCompletaRequest;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.EstudianteRepository;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository.MatriculaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatriculaCompletaService {

    private static final String CHARS_PASSWORD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
    private static final int PASSWORD_LENGTH = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EstudianteRepository estudianteRepository;
    private final MatriculaRepository matriculaRepository;
    private final ApoderadoService apoderadoService;
    private final AuthClient authClient;

    /**
     * Orquesta la creación de usuario+estudiante, usuario+apoderado titular,
     * usuario+apoderado suplente y la matrícula en un solo acto.
     *
     * Nota: las llamadas a servicio-auth ocurren ANTES de abrir la transacción local.
     * Si la persistencia local falla tras crear los usuarios, se registra un error
     * crítico para compensación manual (saga fuera de alcance).
     */
    public MatriculaCompletaResponse matricularCompleto(MatriculaCompletaRequest request) {
        var attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        var authHeader = attrs.getRequest().getHeader("Authorization");

        // Validación previa: los 3 correos deben ser distintos. Si no, la 3a alta en auth fallaría por
        // email duplicado DESPUÉS de crear las 2 primeras → usuarios huérfanos. Fallar antes de tocar auth.
        var emails = java.util.stream.Stream.of(
                        request.getEstudiante().getEmail(),
                        request.getApoderadoTitular().getEmail(),
                        request.getTutor().getEmail())
                .map(e -> e == null ? "" : e.trim().toLowerCase())
                .toList();
        if (new java.util.HashSet<>(emails).size() < emails.size()) {
            throw new IllegalArgumentException(
                    "Los correos del estudiante, apoderado titular y tutor deben ser distintos.");
        }

        // Resolución de contraseñas — genera temporal cuando viene vacía
        String passEstudiante = resolverPassword(request.getEstudiante().getPassword());
        String passTitular   = resolverPassword(request.getApoderadoTitular().getPassword());
        String passTutor     = resolverPassword(request.getTutor().getPassword());

        // --- Paso 1: crear usuarios en servicio-auth (fuera de transacción BD) ---
        log.info("Iniciando matrícula compuesta para estudiante email={}", request.getEstudiante().getEmail());

        var respEstudiante = crearUsuarioEnAuth(
                request.getEstudiante().getEmail(), passEstudiante, "ESTUDIANTE", authHeader);
        log.info("Usuario ESTUDIANTE creado: id={} username={}", respEstudiante.getId(), respEstudiante.getUsername());

        var respTitular = crearUsuarioEnAuth(
                request.getApoderadoTitular().getEmail(), passTitular, "APODERADO", authHeader);
        log.info("Usuario APODERADO TITULAR creado: id={} username={}", respTitular.getId(), respTitular.getUsername());

        var respTutor = crearUsuarioEnAuth(
                request.getTutor().getEmail(), passTutor, "APODERADO", authHeader);
        log.info("Usuario APODERADO SUPLENTE creado: id={} username={}", respTutor.getId(), respTutor.getUsername());

        // --- Paso 2: persistir en BD local (transaccional) ---
        try {
            return persistirCompleto(request, respEstudiante, respTitular, respTutor,
                    passEstudiante, passTitular, passTutor);
        } catch (Exception ex) {
            log.error("CRITICO: usuarios creados en auth (estudiante={}, titular={}, tutor={}) " +
                      "pero la persistencia local falló. Requiere compensación manual. Error: {}",
                      respEstudiante.getId(), respTitular.getId(), respTutor.getId(), ex.getMessage(), ex);
            throw ex;
        }
    }

    @Transactional
    protected MatriculaCompletaResponse persistirCompleto(
            MatriculaCompletaRequest request,
            UsuarioCreadoResponse respEstudiante,
            UsuarioCreadoResponse respTitular,
            UsuarioCreadoResponse respTutor,
            String passEstudiante,
            String passTitular,
            String passTutor) {

        // Estudiante
        var estudiante = new Estudiante();
        estudiante.setIdUsuario(respEstudiante.getId());
        estudiante.setNombre(request.getEstudiante().getNombre());
        estudiante.setApellido(request.getEstudiante().getApellido());
        estudiante.setRut(request.getEstudiante().getRut());
        estudiante.setFechaNacimiento(request.getEstudiante().getFechaNacimiento());
        estudiante.setDireccion(request.getEstudiante().getDireccion());
        estudiante.setTelefono(request.getEstudiante().getTelefono());
        log.info("Creando estudiante: {} {}", estudiante.getNombre(), estudiante.getApellido());
        estudiante = estudianteRepository.save(estudiante);

        // Apoderado titular
        var titular = apoderadoService.crearApoderado(
                request.getApoderadoTitular().getNombre(),
                request.getApoderadoTitular().getApellido(),
                request.getApoderadoTitular().getRut(),
                request.getApoderadoTitular().getEmail(),
                request.getApoderadoTitular().getTelefono(),
                request.getApoderadoTitular().getParentesco(),
                estudiante.getId(),
                respTitular.getId(),
                TipoApoderado.TITULAR);

        // Apoderado suplente (tutor)
        var suplente = apoderadoService.crearApoderado(
                request.getTutor().getNombre(),
                request.getTutor().getApellido(),
                request.getTutor().getRut(),
                request.getTutor().getEmail(),
                request.getTutor().getTelefono(),
                request.getTutor().getParentesco(),
                estudiante.getId(),
                respTutor.getId(),
                TipoApoderado.SUPLENTE);

        // Matrícula
        var matricula = new Matricula();
        matricula.setEstudiante(estudiante);
        matricula.setIdCurso(request.getIdCurso());
        log.info("Matriculando estudiante id={} en curso id={}", estudiante.getId(), request.getIdCurso());
        matricula = matriculaRepository.save(matricula);

        // Credenciales de los 3 usuarios creados
        var credenciales = List.of(
                new CredencialDTO("ESTUDIANTE", respEstudiante.getUsername(),
                        respEstudiante.getEmail(), passEstudiante),
                new CredencialDTO("APODERADO", respTitular.getUsername(),
                        respTitular.getEmail(), passTitular),
                new CredencialDTO("APODERADO", respTutor.getUsername(),
                        respTutor.getEmail(), passTutor));

        // Conversión a DTOs de respuesta
        var estudianteDto = toEstudianteDto(estudiante);
        var titularDto = apoderadoService.toDto(titular);
        var suplenteDto = apoderadoService.toDto(suplente);
        var matriculaDto = toMatriculaDto(matricula);

        return new MatriculaCompletaResponse(estudianteDto, titularDto, suplenteDto, matriculaDto, credenciales);
    }

    // --- helpers ---

    private UsuarioCreadoResponse crearUsuarioEnAuth(String email, String password,
                                                      String rol, String authHeader) {
        String username = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        var req = new CrearUsuarioRequest();
        req.setUsername(username);
        req.setEmail(email);
        req.setPassword(password);
        req.setRol(rol);
        return authClient.crearUsuario(req, authHeader);
    }

    private String resolverPassword(String password) {
        if (password == null || password.isBlank()) {
            return generarPasswordTemporal();
        }
        return password;
    }

    private String generarPasswordTemporal() {
        var sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(CHARS_PASSWORD.charAt(RANDOM.nextInt(CHARS_PASSWORD.length())));
        }
        return sb.toString();
    }

    private cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO toEstudianteDto(Estudiante e) {
        return new cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteDTO(
                e.getId(), e.getIdUsuario(), e.getNombre(),
                e.getApellido(), e.getRut(), e.getFechaNacimiento(),
                e.getDireccion(), e.getTelefono());
    }

    private cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO toMatriculaDto(Matricula m) {
        return new cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.MatriculaDTO(
                m.getId(),
                m.getEstudiante().getId(),
                m.getIdCurso(),
                m.getFechaMatricula(),
                m.getEstado());
    }
}
