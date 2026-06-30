package cl.smartbook.auth.modulo_autenticacion.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.auth.modulo_autenticacion.model.entity.Rol;
import cl.smartbook.auth.modulo_autenticacion.model.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /** Perfiles públicos acotados por rol (p.ej. solo DOCENTE/DIRECTOR) — evita enumeración de staff. */
    List<Usuario> findByIdInAndRolIn(List<Long> ids, List<Rol> roles);

    /** Usuarios de los roles dados (para el directorio de contactos de staff; nunca se piden roles de menores). */
    List<Usuario> findByRolIn(Collection<Rol> roles);
}
