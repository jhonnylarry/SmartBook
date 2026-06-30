package cl.smartbook.gestion_academica.modulo_periodos_academicos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_periodos_academicos.model.entity.PeriodoAcademico;

@Repository
public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {

    List<PeriodoAcademico> findByAnio(Integer anio);

    List<PeriodoAcademico> findAllByOrderByAnioDescFechaInicioAsc();

    /** Periodo cuyo rango [fechaInicio, fechaFin] contiene la fecha dada. */
    Optional<PeriodoAcademico> findFirstByFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(LocalDate desde, LocalDate hasta);
}
