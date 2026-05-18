package cl.smartbook.reportes.modulo_reportes.repository;

import cl.smartbook.reportes.modulo_reportes.model.entity.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    List<Reporte> findByIdSolicitanteOrderByFechaGeneracionDesc(Long idSolicitante);
}
