package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.BitacoraClase;

@Repository
public interface BitacoraClaseRepository extends JpaRepository<BitacoraClase, Long> {

    List<BitacoraClase> findByIdAsignaturaOrderByFechaDesc(Long idAsignatura);
}
