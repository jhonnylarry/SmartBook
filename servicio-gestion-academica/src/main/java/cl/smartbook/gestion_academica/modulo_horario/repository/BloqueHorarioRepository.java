package cl.smartbook.gestion_academica.modulo_horario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_horario.model.entity.BloqueHorario;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Long> {

    List<BloqueHorario> findByIdAsignaturaOrderByDiaSemanaAscHoraInicioAsc(Long idAsignatura);

    List<BloqueHorario> findByIdAsignaturaInOrderByDiaSemanaAscHoraInicioAsc(List<Long> idAsignaturas);
}
