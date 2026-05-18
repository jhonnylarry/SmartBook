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

    @Query("SELECT e FROM Evento e WHERE e.fechaInicio >= :desde AND e.fechaFin <= :hasta")
    List<Evento> findEventosContenidosEnRango(@Param("desde") LocalDateTime desde,
                                              @Param("hasta") LocalDateTime hasta);

    List<Evento> findByTipo(TipoEvento tipo);
}
