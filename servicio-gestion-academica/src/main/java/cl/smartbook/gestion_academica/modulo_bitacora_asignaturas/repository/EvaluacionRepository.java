package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Evaluacion;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {

    List<Evaluacion> findByIdAsignatura(Long idAsignatura);
}
