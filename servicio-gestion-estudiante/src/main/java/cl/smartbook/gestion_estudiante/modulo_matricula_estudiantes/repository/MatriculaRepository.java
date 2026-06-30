package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByEstudianteId(Long idEstudiante);

    List<Matricula> findByEstudianteIdAndEstado(Long idEstudiante, EstadoMatricula estado);

    List<Matricula> findByIdCursoAndEstado(Long idCurso, EstadoMatricula estado);
}
