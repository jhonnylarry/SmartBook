package cl.smartbook.anotacion.modulo_gestion_anotaciones.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.Anotacion;

@Repository
public interface AnotacionRepository extends JpaRepository<Anotacion, Long> {

    List<Anotacion> findByIdEstudianteOrderByFechaDesc(Long idEstudiante);
}
