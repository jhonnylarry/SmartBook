package cl.smartbook.gestion_academica.modulo_catalogo_materias.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.dto.MateriaCatalogoDTO;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.MateriaCatalogo;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request.ActualizarMateria;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.request.AgregarMateria;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.repository.MateriaCatalogoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MateriaCatalogoService {

    private final MateriaCatalogoRepository materiaCatalogoRepository;

    @Transactional(readOnly = true)
    public List<MateriaCatalogoDTO> listar() {
        return materiaCatalogoRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<MateriaCatalogoDTO> listarPorNivel(NivelEnsenanza nivel) {
        return materiaCatalogoRepository.findByNivel(nivel).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public MateriaCatalogoDTO buscarPorId(Long id) {
        MateriaCatalogo materia = materiaCatalogoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no encontrada con id: " + id));
        return toDTO(materia);
    }

    @Transactional
    public MateriaCatalogoDTO crear(AgregarMateria req) {
        if (materiaCatalogoRepository.existsByNombreIgnoreCaseAndNivel(req.getNombre(), req.getNivel())) {
            throw new ReferenciaInvalidaException(
                    "Ya existe la materia '" + req.getNombre() + "' en el nivel " + req.getNivel());
        }
        var materia = new MateriaCatalogo();
        materia.setNombre(req.getNombre());
        materia.setNivel(req.getNivel());
        materia.setArea(req.getArea());
        log.info("Creando materia en catálogo: '{}' nivel {}", req.getNombre(), req.getNivel());
        return toDTO(materiaCatalogoRepository.save(materia));
    }

    @Transactional
    public MateriaCatalogoDTO actualizar(Long id, ActualizarMateria req) {
        MateriaCatalogo materia = materiaCatalogoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no encontrada con id: " + id));

        var nuevoNombre = req.getNombre() != null ? req.getNombre() : materia.getNombre();
        var nuevoNivel = req.getNivel() != null ? req.getNivel() : materia.getNivel();

        boolean nombreCambia = req.getNombre() != null && !req.getNombre().equalsIgnoreCase(materia.getNombre());
        boolean nivelCambia = req.getNivel() != null && req.getNivel() != materia.getNivel();

        if (nombreCambia || nivelCambia) {
            if (materiaCatalogoRepository.existsByNombreIgnoreCaseAndNivel(nuevoNombre, nuevoNivel)) {
                throw new ReferenciaInvalidaException(
                        "Ya existe la materia '" + nuevoNombre + "' en el nivel " + nuevoNivel);
            }
        }

        if (req.getNombre() != null) {
            materia.setNombre(req.getNombre());
        }
        if (req.getNivel() != null) {
            materia.setNivel(req.getNivel());
        }
        if (req.getArea() != null) {
            materia.setArea(req.getArea());
        }
        if (req.getActivo() != null) {
            materia.setActivo(req.getActivo());
        }

        log.info("Actualizando materia id {}: '{}' nivel {}", id, materia.getNombre(), materia.getNivel());
        return toDTO(materiaCatalogoRepository.save(materia));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!materiaCatalogoRepository.existsById(id)) {
            throw new EntityNotFoundException("Materia no encontrada con id: " + id);
        }
        log.info("Eliminando materia id {}", id);
        materiaCatalogoRepository.deleteById(id);
    }

    private MateriaCatalogoDTO toDTO(MateriaCatalogo m) {
        return new MateriaCatalogoDTO(
                m.getId(),
                m.getNombre(),
                m.getNivel(),
                m.getArea(),
                m.isActivo(),
                m.getFechaCreacion()
        );
    }
}
