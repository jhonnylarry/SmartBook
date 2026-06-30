package cl.smartbook.gestion_estudiante.modulo_apoderados.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity.Apoderado;

public interface ApoderadoRepository extends JpaRepository<Apoderado, Long> {

    List<Apoderado> findByIdEstudiante(Long idEstudiante);

    /** Apoderados de un conjunto de estudiantes (batch, p.ej. todos los de un curso). */
    List<Apoderado> findByIdEstudianteIn(Collection<Long> idsEstudiante);

    /** Registros de apoderado del usuario autenticado (sus pupilos). */
    List<Apoderado> findByIdUsuario(Long idUsuario);

    /** Chequeo anti-IDOR: el usuario es apoderado del estudiante. Una sola query EXISTS. */
    boolean existsByIdUsuarioAndIdEstudiante(Long idUsuario, Long idEstudiante);
}
