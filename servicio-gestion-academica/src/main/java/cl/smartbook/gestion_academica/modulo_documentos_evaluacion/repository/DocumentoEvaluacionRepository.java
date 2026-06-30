package cl.smartbook.gestion_academica.modulo_documentos_evaluacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.entity.DocumentoEvaluacion;

@Repository
public interface DocumentoEvaluacionRepository extends JpaRepository<DocumentoEvaluacion, Long> {

    List<DocumentoEvaluacion> findByIdEvaluacion(Long idEvaluacion);
}
