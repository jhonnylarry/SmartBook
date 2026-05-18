package cl.smartbook.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Usuario;
import cl.smartbook.auth.modulo_autenticacion.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Profile({"!test", "!prod"})
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        var admin = new Usuario();
        admin.setUsername("admin");
        admin.setEmail("admin@smartbook.cl");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRol(Rol.ADMINISTRADOR);
        admin.setActivo(true);

        usuarioRepository.save(admin);
        log.info("Usuario admin creado (seed dev). Cambia la contraseña en produccion.");
    }
}
