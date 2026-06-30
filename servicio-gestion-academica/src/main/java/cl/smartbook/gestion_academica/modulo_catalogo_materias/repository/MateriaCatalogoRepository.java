package cl.smartbook.gestion_academica.modulo_catalogo_materias.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.MateriaCatalogo;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;

public interface MateriaCatalogoRepository extends JpaRepository<MateriaCatalogo, Long> {

    List<MateriaCatalogo> findByNivel(NivelEnsenanza nivel);

    List<MateriaCatalogo> findByNivelAndActivoTrue(NivelEnsenanza nivel);

    List<MateriaCatalogo> findByActivoTrue();

    boolean existsByNombreIgnoreCaseAndNivel(String nombre, NivelEnsenanza nivel);

    boolean existsByNombreIgnoreCase(String nombre);
}
