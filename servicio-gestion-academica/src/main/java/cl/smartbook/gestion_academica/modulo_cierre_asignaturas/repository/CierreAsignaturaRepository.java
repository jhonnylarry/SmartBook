package cl.smartbook.gestion_academica.modulo_cierre_asignaturas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.entity.CierreAsignatura;

@Repository
public interface CierreAsignaturaRepository extends JpaRepository<CierreAsignatura, Long> {

    Optional<CierreAsignatura> findByIdAsignaturaAndIdPeriodo(Long idAsignatura, Long idPeriodo);

    boolean existsByIdAsignaturaAndIdPeriodo(Long idAsignatura, Long idPeriodo);

    List<CierreAsignatura> findByIdAsignatura(Long idAsignatura);
}
