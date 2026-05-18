package cl.smartbook.auth.modulo_autenticacion.service;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.auth.modulo_autenticacion.model.dto.UsuarioDto;
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

    @Transactional(readOnly = true)
    public List<UsuarioDto> obtenerTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerPorId(Long id) {
        return toDto(buscarEntidadOFallar(id));
    }

    @Transactional
    public UsuarioDto agregar(AgregarUsuario request) {
        if (usuarioRepository.existsByUsername(request.getUsername())
                || usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Username o email ya en uso");
        }

        var usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        log.info("Creando usuario: {}", request.getUsername());
        return toDto(usuarioRepository.save(usuario));
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
        if (request.getRol() != null) {
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
