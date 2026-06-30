package cl.smartbook.evento_calendario.modulo_gestion_eventos.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.Evento;
import cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.TipoEvento;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    /** Eventos que solapan el rango [desde, hasta] (no requiere contención completa → incluye eventos multi-día). */
    @Query("SELECT e FROM Evento e WHERE e.fechaInicio <= :hasta AND e.fechaFin >= :desde")
    List<Evento> findEventosContenidosEnRango(@Param("desde") LocalDateTime desde,
                                              @Param("hasta") LocalDateTime hasta);

    /**
     * Eventos visibles para un usuario en un rango, según su scope por rol:
     * GLOBAL (todos) · CURSO∈cursos · ASIGNATURA∈asignaturas · ESTUDIANTE∈estudiantes ·
     * PERSONAL/cualquiera creado por él. Las listas vacías deben llegar como {@code List.of(-1L)}
     * (sentinel) para evitar 'IN ()'. Filtra por solapamiento de fechas.
     */
    @Query("""
            SELECT e FROM Evento e
            WHERE e.fechaInicio <= :hasta AND e.fechaFin >= :desde
              AND (
                   e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.GLOBAL
                OR (e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.CURSO      AND e.idCurso      IN :cursos)
                OR (e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.ASIGNATURA AND e.idAsignatura IN :asignaturas)
                OR (e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.ESTUDIANTE AND e.idEstudiante IN :estudiantes)
                OR  e.idCreador = :idUsuario
              )
            """)
    List<Evento> findVisiblesParaUsuario(@Param("desde") LocalDateTime desde,
                                         @Param("hasta") LocalDateTime hasta,
                                         @Param("cursos") List<Long> cursos,
                                         @Param("asignaturas") List<Long> asignaturas,
                                         @Param("estudiantes") List<Long> estudiantes,
                                         @Param("idUsuario") Long idUsuario);

    List<Evento> findByTipo(TipoEvento tipo);

    List<Evento> findByIdAsignatura(Long idAsignatura);

    /** Solo eventos de ámbito GLOBAL (no expone PERSONAL/CURSO/ESTUDIANTE, que también tienen idAsignatura nulo). */
    @Query("SELECT e FROM Evento e WHERE e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.GLOBAL")
    List<Evento> findGlobales();

    /** Globales + eventos de las asignaturas indicadas (NO incluye PERSONAL/ESTUDIANTE — esos no son de asignatura). */
    @Query("SELECT e FROM Evento e WHERE e.ambito = cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity.AmbitoEvento.GLOBAL OR e.idAsignatura IN :ids")
    List<Evento> findFeed(@Param("ids") List<Long> ids);
}
