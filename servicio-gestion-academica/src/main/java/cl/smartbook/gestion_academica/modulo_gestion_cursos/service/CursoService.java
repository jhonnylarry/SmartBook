package cl.smartbook.gestion_academica.modulo_gestion_cursos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.AuthClient;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.dto.CursoDTO;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.entity.Curso;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.request.ActualizarCurso;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.request.AgregarCurso;
import cl.smartbook.gestion_academica.modulo_gestion_cursos.repository.CursoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final AuthClient authClient;

    @Transactional(readOnly = true)
    public List<CursoDTO> listar() {
        return cursoRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public CursoDTO buscarPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con id: " + id));
        return toDTO(curso);
    }

    @Transactional
    public CursoDTO crear(AgregarCurso req, String authHeader) {
        authClient.verificarUsuarioEsDocente(req.getIdDocenteJefe(), authHeader);

        Curso curso = new Curso();
        curso.setNombre(req.getNombre());
        curso.setAnio(req.getAnio());
        curso.setIdDocenteJefe(req.getIdDocenteJefe());
        log.info("Creando curso: {} ({})", req.getNombre(), req.getAnio());
        return toDTO(cursoRepository.save(curso));
    }

    @Transactional
    public CursoDTO actualizar(Long id, ActualizarCurso req, String authHeader) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con id: " + id));

        authClient.verificarUsuarioEsDocente(req.getIdDocenteJefe(), authHeader);

        curso.setNombre(req.getNombre());
        curso.setAnio(req.getAnio());
        curso.setIdDocenteJefe(req.getIdDocenteJefe());
        return toDTO(cursoRepository.save(curso));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!cursoRepository.existsById(id)) {
            throw new EntityNotFoundException("Curso no encontrado con id: " + id);
        }
        cursoRepository.deleteById(id);
    }

    private CursoDTO toDTO(Curso c) {
        return new CursoDTO(c.getId(), c.getNombre(), c.getAnio(), c.getIdDocenteJefe());
    }
}
