package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Asignatura;

@Repository
public interface AsignaturaRepository extends JpaRepository<Asignatura, Long> {

    List<Asignatura> findByIdCurso(Long idCurso);

    List<Asignatura> findByIdDocente(Long idDocente);

    boolean existsByIdDocenteAndIdCurso(Long idDocente, Long idCurso);
}
