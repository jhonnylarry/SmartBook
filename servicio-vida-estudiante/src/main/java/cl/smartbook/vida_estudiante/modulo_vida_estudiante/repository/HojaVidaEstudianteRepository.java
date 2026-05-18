package cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.HojaVidaEstudiante;

@Repository
public interface HojaVidaEstudianteRepository extends JpaRepository<HojaVidaEstudiante, Long> {

    Optional<HojaVidaEstudiante> findByIdEstudiante(Long idEstudiante);

    List<HojaVidaEstudiante> findAllByIdEstudiante(Long idEstudiante);
}
