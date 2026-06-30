package cl.smartbook.auth.modulo_autenticacion.service;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.auth.modulo_autenticacion.model.dto.PerfilPublicoDto;
import cl.smartbook.auth.modulo_autenticacion.model.dto.UsuarioDto;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Usuario;
import cl.smartbook.auth.modulo_autenticacion.model.request.ActualizarUsuario;
import cl.smartbook.auth.modulo_autenticacion.model.request.AgregarUsuario;
import cl.smartbook.auth.modulo_autenticacion.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /** Roles que solo un ADMINISTRADOR puede crear o ver en el listado completo. */
    private static final Set<Rol> ROLES_PRIVILEGIADOS = EnumSet.of(Rol.ADMINISTRADOR, Rol.DIRECTOR);

    /** Roles que NO se crean por el endpoint general: se crean en la matrícula (estudiante + apoderados/tutor). */
    private static final Set<Rol> ROLES_MATRICULA = EnumSet.of(Rol.ESTUDIANTE, Rol.APODERADO);

    @Transactional(readOnly = true)
    public List<UsuarioDto> obtenerTodos() {
        boolean esAdministrador = rolSolicitante() == Rol.ADMINISTRADOR;
        return usuarioRepository.findAll().stream()
                // Solo un ADMINISTRADOR ve las cuentas ADMINISTRADOR (no se expone el superusuario a otros roles).
                .filter(u -> esAdministrador || u.getRol() != Rol.ADMINISTRADOR)
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerPorId(Long id) {
        return toDto(buscarEntidadOFallar(id));
    }

    /** Solo existencia (sin exponer datos): usado entre servicios para validar destinatarios de mensajes. */
    @Transactional(readOnly = true)
    public boolean existe(Long id) {
        return usuarioRepository.existsById(id);
    }

    /**
     * Creación general de cuentas STAFF (administrador, director, docente, inspector, administrativo).
     * El estudiante y el apoderado/tutor NO se crean por aquí: se crean en la matrícula
     * (ver {@link #agregarInterno}).
     */
    @Transactional
    public UsuarioDto agregar(AgregarUsuario request) {
        // Defensa en profundidad: un rol no-ADMINISTRADOR no puede crear cuentas privilegiadas
        // (ADMINISTRADOR/DIRECTOR) — evita escalada de privilegios al crear usuarios.
        if (rolSolicitante() != Rol.ADMINISTRADOR && ROLES_PRIVILEGIADOS.contains(request.getRol())) {
            throw new AccessDeniedException("No tiene permiso para crear cuentas con rol " + request.getRol());
        }
        // El estudiante y el apoderado se crean SIEMPRE desde la matrícula, no por este formulario.
        if (ROLES_MATRICULA.contains(request.getRol())) {
            throw new IllegalArgumentException(
                    "El estudiante y el apoderado/tutor se crean en la matrícula, no por este formulario.");
        }
        return crear(request);
    }

    /**
     * Creación INTERNA usada por la matrícula (servicio gestion-estudiante): solo crea las cuentas
     * que nacen de la matrícula (ESTUDIANTE / APODERADO). Rechaza roles staff por esta vía.
     */
    @Transactional
    public UsuarioDto agregarInterno(AgregarUsuario request) {
        if (!ROLES_MATRICULA.contains(request.getRol())) {
            throw new IllegalArgumentException(
                    "Este endpoint solo crea estudiantes y apoderados (los demás roles se crean en Usuarios).");
        }
        return crear(request);
    }

    /** Alta efectiva (dedup de username/email + persistencia). Común a ambos caminos. */
    private UsuarioDto crear(AgregarUsuario request) {
        if (usuarioRepository.existsByUsername(request.getUsername())
                || usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Username o email ya en uso");
        }
        var usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        // No se registra el username (puede ser de un menor — Ley 19.628): solo id + rol tras persistir.
        var guardado = usuarioRepository.save(usuario);
        log.info("Usuario creado id={} rol={}", guardado.getId(), guardado.getRol());
        return toDto(guardado);
    }

    @Transactional
    public UsuarioDto actualizar(Long id, ActualizarUsuario request) {
        var usuario = buscarEntidadOFallar(id);

        if (request.getEmail() != null) {
            usuario.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRol() != null && request.getRol() != usuario.getRol()) {
            // El rol ESTUDIANTE/APODERADO nace y se gestiona en la matrícula: ni se asigna por edición,
            // ni una cuenta de matrícula se convierte en staff por esta vía (invariante en ambos sentidos).
            if (ROLES_MATRICULA.contains(request.getRol()) || ROLES_MATRICULA.contains(usuario.getRol())) {
                throw new IllegalArgumentException(
                        "El rol de estudiante/apoderado se gestiona desde la matrícula, no por edición de usuario.");
            }
            usuario.setRol(request.getRol());
        }
        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }

        log.info("Actualizando usuario id={}", id);
        return toDto(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + id);
        }
        log.info("Eliminando usuario id={}", id);
        usuarioRepository.deleteById(id);
    }

    /** Roles cuyo username puede resolver cualquier autenticado (p.ej. el alumno ve el nombre de su profesor). */
    private static final List<Rol> ROLES_PERFIL_PUBLICO = List.of(Rol.DOCENTE, Rol.DIRECTOR);
    private static final int MAX_IDS_PERFILES = 50;

    /**
     * Whitelist de roles que cada rol solicitante puede ENUMERAR por `/por-rol` (directorio de contactos).
     * ESTUDIANTE y APODERADO jamás aparecen como valores: los menores y sus apoderados se resuelven SIEMPRE
     * por relación (roster del curso / pupilos), nunca por enumeración global. ESTUDIANTE no puede enumerar nada.
     */
    private static final Map<Rol, Set<Rol>> ROLES_CONSULTABLES = Map.of(
            Rol.ADMINISTRADOR, EnumSet.of(Rol.DOCENTE, Rol.INSPECTOR, Rol.ADMINISTRATIVO, Rol.DIRECTOR),
            Rol.DIRECTOR, EnumSet.of(Rol.DOCENTE, Rol.INSPECTOR, Rol.ADMINISTRATIVO, Rol.DIRECTOR),
            Rol.ADMINISTRATIVO, EnumSet.of(Rol.DOCENTE, Rol.INSPECTOR, Rol.DIRECTOR, Rol.ADMINISTRATIVO),
            Rol.INSPECTOR, EnumSet.of(Rol.DOCENTE, Rol.INSPECTOR, Rol.DIRECTOR, Rol.ADMINISTRATIVO),
            Rol.DOCENTE, EnumSet.of(Rol.DOCENTE, Rol.INSPECTOR, Rol.DIRECTOR, Rol.ADMINISTRATIVO),
            Rol.APODERADO, EnumSet.of(Rol.DIRECTOR, Rol.INSPECTOR, Rol.ADMINISTRATIVO));

    /**
     * Perfiles de usuarios por rol para el directorio de contactos. El resultado se acota a la intersección
     * de los roles pedidos con la whitelist del solicitante → un rol fuera de su whitelist se descarta en
     * silencio (no filtra la política) y nunca devuelve menores/apoderados.
     */
    @Transactional(readOnly = true)
    public List<PerfilPublicoDto> usuariosPorRol(Set<Rol> rolesSolicitados) {
        Set<Rol> permitidos = ROLES_CONSULTABLES.getOrDefault(rolSolicitante(), Set.of());
        Set<Rol> efectivos = (rolesSolicitados == null || rolesSolicitados.isEmpty())
                ? permitidos
                : rolesSolicitados.stream().filter(permitidos::contains).collect(Collectors.toSet());
        if (efectivos.isEmpty()) {
            return List.of();
        }
        return usuarioRepository.findByRolIn(efectivos).stream()
                .map(u -> new PerfilPublicoDto(u.getId(), u.getUsername(), u.getRol()))
                .sorted(Comparator.comparing(PerfilPublicoDto::username))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PerfilPublicoDto> perfiles(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        if (ids.size() > MAX_IDS_PERFILES) {
            throw new IllegalArgumentException("Demasiados ids solicitados (máximo " + MAX_IDS_PERFILES + ")");
        }
        // Solo se exponen perfiles de DOCENTE/DIRECTOR → evita enumeración de staff (ADMIN) y de otros menores.
        return usuarioRepository.findByIdInAndRolIn(ids, ROLES_PERFIL_PUBLICO).stream()
                .map(u -> new PerfilPublicoDto(u.getId(), u.getUsername(), u.getRol()))
                .toList();
    }

    /** Rol del usuario autenticado (tomado del JWT vía SecurityContext, no de headers manipulables). */
    private Rol rolSolicitante() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            for (GrantedAuthority a : auth.getAuthorities()) {
                String authority = a.getAuthority();
                if (authority != null && authority.startsWith("ROLE_")) {
                    try {
                        return Rol.valueOf(authority.substring("ROLE_".length()));
                    } catch (IllegalArgumentException ignored) {
                        // autoridad que no corresponde a un Rol del dominio
                    }
                }
            }
        }
        return null;
    }

    private Usuario buscarEntidadOFallar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario no encontrado con id: " + id));
    }

    private UsuarioDto toDto(Usuario u) {
        return new UsuarioDto(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRol(),
                u.isActivo(),
                u.getFechaCreacion());
    }
}
