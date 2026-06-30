package cl.smartbook.gestion_academica.modulo_docente_especialidad.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.AuthClient;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.repository.MateriaCatalogoRepository;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.model.dto.DocenteEspecialidadesDTO;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.model.entity.DocenteEspecialidad;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.repository.DocenteEspecialidadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocenteEspecialidadService {

    private final DocenteEspecialidadRepository repo;
    private final MateriaCatalogoRepository materiaRepo;
    private final AuthClient authClient;

    @Transactional(readOnly = true)
    public List<String> listarPorDocente(Long idDocente) {
        return repo.findByIdDocente(idDocente).stream()
                .map(DocenteEspecialidad::getMateria)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    /** True si el docente tiene esa materia entre sus especialidades (case-insensitive). */
    @Transactional(readOnly = true)
    public boolean puedeDictar(Long idDocente, String materia) {
        if (idDocente == null || materia == null || materia.isBlank()) {
            return false;
        }
        return repo.existsByIdDocenteAndMateriaIgnoreCase(idDocente, materia.trim());
    }

    /** Todas las especialidades agrupadas por docente (para filtrar en la UI). */
    @Transactional(readOnly = true)
    public List<DocenteEspecialidadesDTO> todas() {
        Map<Long, List<String>> porDocente = repo.findAll().stream()
                .collect(Collectors.groupingBy(DocenteEspecialidad::getIdDocente,
                        Collectors.mapping(DocenteEspecialidad::getMateria, Collectors.toList())));
        return porDocente.entrySet().stream()
                .map(e -> new DocenteEspecialidadesDTO(e.getKey(),
                        e.getValue().stream().sorted(String.CASE_INSENSITIVE_ORDER).toList()))
                .sorted(Comparator.comparing(DocenteEspecialidadesDTO::idDocente))
                .toList();
    }

    /**
     * Reemplaza el conjunto completo de especialidades del docente. Normaliza (trim, sin vacíos,
     * sin duplicados case-insensitive) y descarta los nombres que no existen en el catálogo.
     */
    @Transactional
    public List<String> reemplazar(Long idDocente, List<String> materias, String authHeader) {
        authClient.verificarUsuarioEsDocente(idDocente, authHeader);

        LinkedHashMap<String, String> unicas = new LinkedHashMap<>(); // claveLower -> nombre original
        if (materias != null) {
            for (String m : materias) {
                if (m == null) {
                    continue;
                }
                String t = m.trim();
                if (t.isEmpty() || !materiaRepo.existsByNombreIgnoreCase(t)) {
                    continue; // ignora vacíos y nombres fuera del catálogo
                }
                unicas.putIfAbsent(t.toLowerCase(), t);
            }
        }

        repo.deleteByIdDocente(idDocente);
        repo.flush(); // aplica el borrado antes de insertar (evita chocar con el único id_docente+materia)
        for (String materia : unicas.values()) {
            DocenteEspecialidad e = new DocenteEspecialidad();
            e.setIdDocente(idDocente);
            e.setMateria(materia);
            repo.save(e);
        }
        log.info("Especialidades del docente {} actualizadas por actor {}: {}",
                idDocente, idActor(), unicas.values());
        return unicas.values().stream().sorted(String.CASE_INSENSITIVE_ORDER).toList();
    }

    /** id del usuario que ejecuta la acción (del JWT), para trazabilidad; null si no disponible. */
    private Long idActor() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return null;
        }
        try {
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
