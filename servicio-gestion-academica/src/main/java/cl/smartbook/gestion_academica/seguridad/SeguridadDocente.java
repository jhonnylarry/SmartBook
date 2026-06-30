package cl.smartbook.gestion_academica.seguridad;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import lombok.RequiredArgsConstructor;

/**
 * Punto único de scoping por docente (mínimo privilegio / anti-IDOR). Un DOCENTE solo puede
 * operar sobre las asignaturas que dicta; ADMINISTRADOR/DIRECTOR no se ven acotados.
 * La identidad del usuario proviene del JWT: el {@code JwtAuthFilter} guarda el claim
 * {@code sub} (idUsuario) en {@code Authentication.details}.
 */
@Component
@RequiredArgsConstructor
public class SeguridadDocente {

    private final AsignaturaRepository asignaturaRepository;

    /** True si el solicitante es DOCENTE y NO tiene un rol elevado (ADMINISTRADOR/DIRECTOR). */
    public boolean esSoloDocente() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        boolean docente = false;
        boolean elevado = false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String rol = a.getAuthority();
            if ("ROLE_DOCENTE".equals(rol)) {
                docente = true;
            } else if ("ROLE_ADMINISTRADOR".equals(rol) || "ROLE_DIRECTOR".equals(rol)) {
                elevado = true;
            }
        }
        return docente && !elevado;
    }

    /** id del usuario autenticado desde el JWT (Authentication.details), o null si no disponible. */
    public Long idUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return null;
        }
        try {
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Si el solicitante es solo DOCENTE, exige que dicte la asignatura indicada; en caso
     * contrario (asignatura inexistente, idUsuario nulo o docente distinto) lanza 403.
     * ADMINISTRADOR/DIRECTOR pasan sin restricción. Fail-closed.
     */
    public void verificarDictaAsignatura(Long idAsignatura) {
        if (!esSoloDocente()) {
            return;
        }
        Asignatura asig = idAsignatura != null
                ? asignaturaRepository.findById(idAsignatura).orElse(null)
                : null;
        Long idUsuario = idUsuarioActual();
        if (asig == null || idUsuario == null || !idUsuario.equals(asig.getIdDocente())) {
            throw new AccessDeniedException("El docente no dicta esta asignatura");
        }
    }
}
