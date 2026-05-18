package cl.smartbook.mensajeria.modulo_mensajes.repository;

import cl.smartbook.mensajeria.modulo_mensajes.model.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    List<Mensaje> findByIdDestinatarioOrderByFechaEnvioDesc(Long idDestinatario);

    List<Mensaje> findByIdRemitenteOrderByFechaEnvioDesc(Long idRemitente);
}
