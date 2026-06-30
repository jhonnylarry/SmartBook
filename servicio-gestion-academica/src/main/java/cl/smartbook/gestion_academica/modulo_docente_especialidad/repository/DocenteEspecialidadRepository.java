package cl.smartbook.gestion_academica.modulo_docente_especialidad.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.smartbook.gestion_academica.modulo_docente_especialidad.model.entity.DocenteEspecialidad;

public interface DocenteEspecialidadRepository extends JpaRepository<DocenteEspecialidad, Long> {

    List<DocenteEspecialidad> findByIdDocente(Long idDocente);

    boolean existsByIdDocenteAndMateriaIgnoreCase(Long idDocente, String materia);

    void deleteByIdDocente(Long idDocente);
}
