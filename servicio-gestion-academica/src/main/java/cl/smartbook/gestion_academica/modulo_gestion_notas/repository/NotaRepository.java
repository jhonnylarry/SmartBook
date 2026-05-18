package cl.smartbook.gestion_academica.modulo_gestion_notas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_gestion_notas.model.entity.Nota;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {

    List<Nota> findByIdEstudiante(Long idEstudiante);

    List<Nota> findByIdEvaluacion(Long idEvaluacion);

    Optional<Nota> findByIdEvaluacionAndIdEstudiante(Long idEvaluacion, Long idEstudiante);
}
