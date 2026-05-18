package cl.smartbook.auth.modulo_autenticacion.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.auth.config.JwtService;
import cl.smartbook.auth.modulo_autenticacion.model.dto.LoginResponse;
import cl.smartbook.auth.modulo_autenticacion.model.dto.UsuarioDto;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Usuario;
import cl.smartbook.auth.modulo_autenticacion.model.request.LoginRequest;
import cl.smartbook.auth.modulo_autenticacion.model.request.RegisterRequest;
import cl.smartbook.auth.modulo_autenticacion.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        var usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        if (!usuario.isActivo()) {
            throw new DisabledException("Usuario desactivado");
        }

        log.info("Login exitoso para usuario: {}", usuario.getUsername());
        return buildLoginResponse(usuario);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.username())
                || usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Usuario o email ya registrado");
        }

        var nuevo = new Usuario();
        nuevo.setUsername(request.username());
        nuevo.setEmail(request.email());
        nuevo.setPassword(passwordEncoder.encode(request.password()));
        nuevo.setRol(Rol.ESTUDIANTE);
        nuevo.setActivo(true);

        var guardado = usuarioRepository.save(nuevo);
        log.info("Nuevo usuario registrado: {}", guardado.getUsername());

        return buildLoginResponse(guardado);
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerActual(String username) {
        var usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
        return toDto(usuario);
    }

    private LoginResponse buildLoginResponse(Usuario usuario) {
        var token = jwtService.generarToken(usuario);
        return new LoginResponse(token, jwtService.getExpirationMs(), toDto(usuario));
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
