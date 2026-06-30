package cl.smartbook.mensajeria.modulo_mensajes.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import cl.smartbook.mensajeria.client.AcademicaClient;
import cl.smartbook.mensajeria.client.AuthClient;
import cl.smartbook.mensajeria.client.EstudianteClient;
import cl.smartbook.mensajeria.client.dto.ApoderadoRefDTO;
import cl.smartbook.mensajeria.client.dto.AsignaturaRefDTO;
import cl.smartbook.mensajeria.client.dto.CursoRefDTO;
import cl.smartbook.mensajeria.client.dto.EstudianteMeDTO;
import cl.smartbook.mensajeria.client.dto.PerfilDTO;
import cl.smartbook.mensajeria.client.dto.PupiloRefDTO;
import cl.smartbook.mensajeria.client.dto.RosterDTO;
import cl.smartbook.mensajeria.client.dto.UsuarioRefDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.dto.ContactoDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.dto.GrupoDTO;
import cl.smartbook.mensajeria.modulo_mensajes.repository.MensajeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementa la matriz de permisos de mensajería: construye el directorio de contactos permitidos por rol,
 * decide si un envío individual está autorizado (puedeEnviar) y resuelve los grupos de difusión.
 * El rol del remitente lo provee el controlador desde el JWT (SecurityContext), nunca un header.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DirectorioContactosService {

    private final AuthClient authClient;
    private final EstudianteClient estudianteClient;
    private final AcademicaClient academicaClient;
    private final MensajeRepository mensajeRepository;

    private static final String STAFF_DOCENTE = "DOCENTE,INSPECTOR,DIRECTOR,ADMINISTRATIVO";
    private static final String STAFF_APODERADO = "DIRECTOR,INSPECTOR,ADMINISTRATIVO";

    // ── Directorio de contactos individuales ──
    public List<ContactoDTO> contactos(Long idRemitente, String rol, String auth) {
        List<ContactoDTO> out = new ArrayList<>();
        switch (rol == null ? "" : rol) {
            case "ESTUDIANTE" -> contactosEstudiante(out, auth);
            case "DOCENTE" -> contactosDocente(out, auth);
            case "APODERADO" -> contactosApoderado(out, auth);
            case "INSPECTOR" -> staff(out, STAFF_DOCENTE, auth);
            case "ADMINISTRATIVO", "DIRECTOR", "ADMINISTRADOR" -> contactosGeneral(out, auth);
            default -> { /* sin contactos */ }
        }
        return dedupExcluir(out, idRemitente);
    }

    private void contactosEstudiante(List<ContactoDTO> out, String auth) {
        List<RosterDTO> companeros = estudianteClient.misCompaneros(auth);
        for (RosterDTO c : companeros) {
            out.add(new ContactoDTO(c.idUsuario(), nombre(c.nombre(), c.apellido()), "ESTUDIANTE", "COMPAÑERO"));
        }
        Long idCurso = companeros.stream().map(RosterDTO::idCurso).filter(Objects::nonNull).findFirst().orElse(null);
        if (idCurso == null) {
            EstudianteMeDTO me = estudianteClient.miEstudiante(auth);
            idCurso = (me == null || me.matriculas() == null) ? null : me.matriculas().stream()
                    .filter(m -> "VIGENTE".equals(m.estado()))
                    .map(EstudianteMeDTO.MatriculaRefDTO::idCurso).filter(Objects::nonNull).findFirst().orElse(null);
        }
        if (idCurso != null) {
            docentesDeCurso(out, idCurso, auth);
        }
    }

    private void contactosDocente(List<ContactoDTO> out, String auth) {
        List<Long> cursos = cursosDelDocente(auth);
        for (Long idCurso : cursos) {
            for (RosterDTO a : estudianteClient.estudiantesDeCurso(idCurso, auth)) {
                out.add(new ContactoDTO(a.idUsuario(), nombre(a.nombre(), a.apellido()), "ESTUDIANTE", "ALUMNO"));
            }
            for (ApoderadoRefDTO ap : estudianteClient.apoderadosDeCurso(idCurso, auth)) {
                out.add(new ContactoDTO(ap.idUsuario(), nombre(ap.nombre(), ap.apellido()), "APODERADO", "APODERADO"));
            }
        }
        staff(out, STAFF_DOCENTE, auth);
    }

    private void contactosApoderado(List<ContactoDTO> out, String auth) {
        List<Long> cursos = estudianteClient.misPupilos(auth).stream()
                .map(PupiloRefDTO::idCurso).filter(Objects::nonNull).distinct().toList();
        for (Long idCurso : cursos) {
            docentesDeCurso(out, idCurso, auth);
        }
        staff(out, STAFF_APODERADO, auth);
    }

    private void docentesDeCurso(List<ContactoDTO> out, Long idCurso, String auth) {
        List<Long> idsDocente = academicaClient.asignaturasDeCurso(idCurso, auth).stream()
                .map(AsignaturaRefDTO::idDocente).filter(Objects::nonNull).distinct().toList();
        Map<Long, String> nombres = authClient.perfiles(idsDocente, auth).stream()
                .collect(Collectors.toMap(PerfilDTO::id, PerfilDTO::username, (a, b) -> a));
        for (Long idDoc : idsDocente) {
            out.add(new ContactoDTO(idDoc, nombres.getOrDefault(idDoc, "Docente #" + idDoc), "DOCENTE", "DOCENTE"));
        }
    }

    private void staff(List<ContactoDTO> out, String rolesCsv, String auth) {
        for (PerfilDTO p : authClient.usuariosPorRol(rolesCsv, auth)) {
            out.add(new ContactoDTO(p.id(), p.username(), p.rol(), "STAFF"));
        }
    }

    private void contactosGeneral(List<ContactoDTO> out, String auth) {
        for (UsuarioRefDTO u : authClient.usuariosTodos(auth)) {
            out.add(new ContactoDTO(u.id(), u.username(), u.rol(), "GENERAL"));
        }
    }

    // ── Autorización de envío individual ──
    public boolean puedeEnviar(Long idRemitente, String rol, Long idDestinatario, String auth) {
        if (idDestinatario == null || idDestinatario.equals(idRemitente)) {
            return false;
        }
        // Regla de respuesta: puedes contestar a quien ya te escribió un mensaje 1-a-1 (no una difusión).
        if (mensajeRepository.existsByIdRemitenteAndIdDestinatarioAndLoteDifusionIsNull(idDestinatario, idRemitente)) {
            return true;
        }
        return switch (rol == null ? "" : rol) {
            case "ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO", "INSPECTOR" -> authClient.existe(idDestinatario, auth);
            case "ESTUDIANTE", "DOCENTE", "APODERADO" ->
                    contactos(idRemitente, rol, auth).stream().anyMatch(c -> idDestinatario.equals(c.idUsuario()));
            default -> false;
        };
    }

    // ── Grupos de difusión ──
    public List<GrupoDTO> grupos(Long idRemitente, String rol, String auth) {
        List<GrupoDTO> out = new ArrayList<>();
        switch (rol == null ? "" : rol) {
            case "DOCENTE" -> {
                Map<Long, String> nombreCurso = academicaClient.cursos(auth).stream()
                        .collect(Collectors.toMap(CursoRefDTO::id, CursoRefDTO::nombre, (a, b) -> a));
                for (Long idCurso : cursosDelDocente(auth)) {
                    String nc = nombreCurso.getOrDefault(idCurso, "curso #" + idCurso);
                    out.add(new GrupoDTO("ALUMNOS_CURSO:" + idCurso, "Alumnos de " + nc, "Difundir a todos los alumnos del curso"));
                    out.add(new GrupoDTO("APODERADOS_CURSO:" + idCurso, "Apoderados de " + nc, "Difundir a todos los apoderados del curso"));
                }
            }
            case "ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO" -> {
                out.add(new GrupoDTO("ANUNCIO_GENERAL", "Anuncio general", "Todos los usuarios del colegio"));
                out.add(new GrupoDTO("TODOS_DOCENTES", "Todos los docentes", "Todos los docentes del colegio"));
            }
            default -> { /* sin difusión */ }
        }
        return out;
    }

    /** Resuelve los idUsuario destinatarios de un grupo, validando que sea un grupo permitido para el remitente. */
    public List<Long> destinatariosDeGrupo(Long idRemitente, String rol, String grupoId, String auth) {
        boolean permitido = grupos(idRemitente, rol, auth).stream().anyMatch(g -> g.id().equals(grupoId));
        if (!permitido || grupoId == null) {
            return List.of();
        }
        if (grupoId.startsWith("ALUMNOS_CURSO:")) {
            Long idCurso = parseId(grupoId.substring("ALUMNOS_CURSO:".length()));
            return estudianteClient.estudiantesDeCurso(idCurso, auth).stream()
                    .map(RosterDTO::idUsuario).filter(Objects::nonNull).distinct().toList();
        }
        if (grupoId.startsWith("APODERADOS_CURSO:")) {
            Long idCurso = parseId(grupoId.substring("APODERADOS_CURSO:".length()));
            return estudianteClient.apoderadosDeCurso(idCurso, auth).stream()
                    .map(ApoderadoRefDTO::idUsuario).filter(Objects::nonNull).distinct().toList();
        }
        if ("ANUNCIO_GENERAL".equals(grupoId)) {
            return authClient.usuariosTodos(auth).stream()
                    .map(UsuarioRefDTO::id).filter(id -> id != null && !id.equals(idRemitente)).distinct().toList();
        }
        if ("TODOS_DOCENTES".equals(grupoId)) {
            return authClient.usuariosPorRol("DOCENTE", auth).stream()
                    .map(PerfilDTO::id).filter(id -> id != null && !id.equals(idRemitente)).distinct().toList();
        }
        return List.of();
    }

    // ── Helpers ──
    private List<Long> cursosDelDocente(String auth) {
        return academicaClient.asignaturasMias(auth).stream()
                .map(AsignaturaRefDTO::idCurso).filter(Objects::nonNull).distinct().toList();
    }

    private Long parseId(String s) {
        try {
            return Long.valueOf(s);
        } catch (NumberFormatException e) {
            return -1L;
        }
    }

    private String nombre(String n, String a) {
        return ((n == null ? "" : n) + " " + (a == null ? "" : a)).trim();
    }

    private List<ContactoDTO> dedupExcluir(List<ContactoDTO> in, Long excluir) {
        Map<Long, ContactoDTO> m = new LinkedHashMap<>();
        for (ContactoDTO c : in) {
            if (c.idUsuario() == null || c.idUsuario().equals(excluir)) {
                continue;
            }
            m.putIfAbsent(c.idUsuario(), c);
        }
        return m.values().stream()
                .sorted(Comparator.comparing(ContactoDTO::nombre, Comparator.nullsLast(String::compareTo)))
                .toList();
    }
}
