package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteBusquedaDTO;
import cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.Estudiante;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByIdUsuario(Long idUsuario);

    /**
     * Buscador avanzado: filtra por texto (nombre/apellido/rut, case-insensitive) y por curso de la
     * matrícula VIGENTE. El LEFT JOIN a la matrícula vigente permite devolver también el idCurso para
     * desambiguar alumnos homónimos. {@code texto} llega ya en minúsculas y **vacío (no null)** cuando
     * no hay filtro → 'LIKE %%' matchea a todos (evita el error de Postgres 'text ~~ bytea' con null en LIKE).
     * {@code idCurso} sí puede ser null (= sin filtro de curso).
     */
    @Query("""
            SELECT new cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.dto.EstudianteBusquedaDTO(
                   e.id, e.idUsuario, e.nombre, e.apellido, e.rut, m.idCurso)
            FROM Estudiante e
            LEFT JOIN Matricula m ON m.estudiante = e
                 AND m.estado = cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity.EstadoMatricula.VIGENTE
            WHERE (LOWER(e.nombre) LIKE CONCAT('%', :texto, '%') ESCAPE '\\'
                   OR LOWER(e.apellido) LIKE CONCAT('%', :texto, '%') ESCAPE '\\'
                   OR LOWER(COALESCE(e.rut, '')) LIKE CONCAT('%', :texto, '%') ESCAPE '\\')
              AND (:idCurso IS NULL OR m.idCurso = :idCurso)
            ORDER BY e.apellido, e.nombre
            """)
    List<EstudianteBusquedaDTO> buscar(@Param("texto") String texto, @Param("idCurso") Long idCurso);
}
