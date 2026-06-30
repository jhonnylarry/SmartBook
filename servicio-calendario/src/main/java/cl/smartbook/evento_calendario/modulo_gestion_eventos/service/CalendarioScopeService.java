package cl.smartbook.evento_calendario.modulo_gestion_eventos.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import cl.smartbook.evento_calendario.client.AcademicaClient;
import cl.smartbook.evento_calendario.client.EstudianteClient;
import cl.smartbook.evento_calendario.client.dto.AsignaturaRefDTO;
import cl.smartbook.evento_calendario.client.dto.CursoRefDTO;
import cl.smartbook.evento_calendario.client.dto.EstudianteMeDTO;
import cl.smartbook.evento_calendario.client.dto.PupiloRefDTO;
import cl.smartbook.evento_calendario.client.dto.RosterDTO;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Resuelve, server-side, QUÉ eventos puede ver cada usuario (su "calendario") y SI puede crear un
 * evento dirigido a un ámbito dado. El rol y el idUsuario los provee el controller desde el JWT
 * (SecurityContext), nunca un header manipulable. La lectura es best-effort (si un servicio cae,
 * el usuario ve de menos, nunca de más); la autorización de creación es fail-closed.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarioScopeService {

    private final AcademicaClient academicaClient;
    private final EstudianteClient estudianteClient;

    /** Scope de visibilidad de un usuario. Si {@code verTodo} es true se ignoran las listas. */
    public record ScopeUsuario(List<Long> cursos, List<Long> asignaturas, List<Long> estudiantes, boolean verTodo) {
        static ScopeUsuario todos() {
            return new ScopeUsuario(List.of(), List.of(), List.of(), true);
        }
        static ScopeUsuario vacio() {
            return new ScopeUsuario(List.of(), List.of(), List.of(), false);
        }
    }

    /** Resuelve el scope de visibilidad según el rol del usuario autenticado. */
    public ScopeUsuario resolver(Long idUsuario, String rol, String auth) {
        return switch (rol == null ? "" : rol) {
            case "ADMINISTRADOR", "DIRECTOR" -> ScopeUsuario.todos();
            case "DOCENTE" -> scopeDocente(idUsuario, auth);
            case "ESTUDIANTE" -> scopeEstudiante(auth);
            case "APODERADO" -> scopeApoderado(auth);
            // INSPECTOR / ADMINISTRATIVO / otros: solo GLOBAL + PERSONAL (la query los cubre por idCreador).
            default -> ScopeUsuario.vacio();
        };
    }

    private ScopeUsuario scopeDocente(Long idUsuario, String auth) {
        Set<Long> asignaturas = new LinkedHashSet<>();
        Set<Long> cursos = new LinkedHashSet<>();
        for (AsignaturaRefDTO a : academicaClient.asignaturasMias(auth)) {
            if (a.id() != null) asignaturas.add(a.id());
            if (a.idCurso() != null) cursos.add(a.idCurso());
        }
        // Cursos donde el docente es jefe (aunque no dicte una asignatura ahí).
        if (idUsuario != null) {
            for (CursoRefDTO c : academicaClient.cursos(auth)) {
                if (idUsuario.equals(c.idDocenteJefe()) && c.id() != null) {
                    cursos.add(c.id());
                }
            }
        }
        // Estudiantes de sus cursos (para ver eventos dirigidos a alumnos suyos).
        Set<Long> estudiantes = new LinkedHashSet<>();
        for (Long idCurso : cursos) {
            for (RosterDTO r : estudianteClient.estudiantesDeCurso(idCurso, auth)) {
                if (r.idEstudiante() != null) estudiantes.add(r.idEstudiante());
            }
        }
        return new ScopeUsuario(new ArrayList<>(cursos), new ArrayList<>(asignaturas), new ArrayList<>(estudiantes), false);
    }

    private ScopeUsuario scopeEstudiante(String auth) {
        EstudianteMeDTO me = estudianteClient.miEstudiante(auth);
        if (me == null) {
            return ScopeUsuario.vacio();
        }
        Long idCurso = me.matriculas() == null ? null : me.matriculas().stream()
                .filter(m -> "VIGENTE".equalsIgnoreCase(m.estado()))
                .map(EstudianteMeDTO.MatriculaRefDTO::idCurso).filter(Objects::nonNull).findFirst().orElse(null);
        List<Long> cursos = idCurso == null ? List.of() : List.of(idCurso);
        List<Long> asignaturas = idCurso == null ? List.of() : academicaClient.asignaturasDeCurso(idCurso, auth).stream()
                .map(AsignaturaRefDTO::id).filter(Objects::nonNull).distinct().toList();
        List<Long> estudiantes = me.id() == null ? List.of() : List.of(me.id());
        return new ScopeUsuario(cursos, asignaturas, estudiantes, false);
    }

    private ScopeUsuario scopeApoderado(String auth) {
        List<PupiloRefDTO> pupilos = estudianteClient.misPupilos(auth);
        List<Long> cursos = pupilos.stream().map(PupiloRefDTO::idCurso).filter(Objects::nonNull).distinct().toList();
        List<Long> estudiantes = pupilos.stream().map(PupiloRefDTO::idEstudiante).filter(Objects::nonNull).distinct().toList();
        return new ScopeUsuario(cursos, List.of(), estudiantes, false);
    }

    /**
     * Autoriza la creación de un evento según su ámbito (fail-closed). DIRECTOR/ADMINISTRADOR pueden
     * cualquier ámbito; un DOCENTE solo dentro de su scope (sus asignaturas/cursos/alumnos); cualquier
     * otro rol solo PERSONAL. Lanza {@link AccessDeniedException} si no está permitido.
     */
    public void autorizarCreacion(AmbitoEvento ambito, Long idAsignatura, Long idCurso, Long idEstudiante,
                                  Long idUsuario, String rol, String auth) {
        String r = rol == null ? "" : rol;
        if (ambito == AmbitoEvento.PERSONAL) {
            return; // cualquier autenticado puede crear su propio evento
        }
        if ("ADMINISTRADOR".equals(r) || "DIRECTOR".equals(r)) {
            return; // staff de dirección puede dirigir a cualquier ámbito
        }
        if ("DOCENTE".equals(r)) {
            ScopeUsuario scope = scopeDocente(idUsuario, auth);
            boolean ok = switch (ambito) {
                case ASIGNATURA -> idAsignatura != null && scope.asignaturas().contains(idAsignatura);
                case CURSO -> idCurso != null && scope.cursos().contains(idCurso);
                case ESTUDIANTE -> idEstudiante != null && scope.estudiantes().contains(idEstudiante);
                default -> false; // GLOBAL no permitido a docentes
            };
            if (!ok) {
                throw new AccessDeniedException("El docente no puede dirigir un evento a ese destinatario.");
            }
            return;
        }
        // Resto de roles: solo PERSONAL (ya retornado arriba) → cualquier otro ámbito se rechaza.
        throw new AccessDeniedException("No tiene permiso para crear eventos con ese destinatario.");
    }
}
