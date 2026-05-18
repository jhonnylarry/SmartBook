package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.entity.ObjetivoAprendizaje;

@Repository
public interface ObjetivoAprendizajeRepository extends JpaRepository<ObjetivoAprendizaje, Long> {

    List<ObjetivoAprendizaje> findByIdAsignatura(Long idAsignatura);
}
