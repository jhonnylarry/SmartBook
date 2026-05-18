package cl.smartbook.mensajeria.modulo_mensajes.service;

import cl.smartbook.mensajeria.modulo_mensajes.model.dto.MensajeDTO;
import cl.smartbook.mensajeria.modulo_mensajes.model.request.AgregarMensajeRequest;

import java.util.List;

public interface MensajeService {

    MensajeDTO enviar(AgregarMensajeRequest request, String authHeader);

    MensajeDTO getById(Long id);

    List<MensajeDTO> listarRecibidos(Long idUsuario);

    List<MensajeDTO> listarEnviados(Long idUsuario);

    MensajeDTO marcarLeido(Long id);

    void eliminar(Long id);
}
