package cl.smartbook.mensajeria.modulo_mensajes.repository;

import cl.smartbook.mensajeria.modulo_mensajes.model.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    List<Mensaje> findByIdDestinatarioOrderByFechaEnvioDesc(Long idDestinatario);

    List<Mensaje> findByIdRemitenteOrderByFechaEnvioDesc(Long idRemitente);

    /**
     * Regla de respuesta: ¿este remitente ya me escribió un mensaje 1-a-1 (no difusión)?
     * Permite contestar fuera de la matriz. Se EXCLUYEN las difusiones (loteDifusion != null) para que
     * un anuncio masivo no habilite a cada destinatario a escribir libremente al emisor.
     */
    boolean existsByIdRemitenteAndIdDestinatarioAndLoteDifusionIsNull(Long idRemitente, Long idDestinatario);
}
