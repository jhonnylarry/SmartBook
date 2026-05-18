package cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.DocumentoAdjunto;

@Repository
public interface DocumentoAdjuntoRepository extends JpaRepository<DocumentoAdjunto, Long> {

    List<DocumentoAdjunto> findAllByIdHojaVida(Long idHojaVida);
}
