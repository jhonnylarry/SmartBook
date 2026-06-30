package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.gestion_academica.client.AuthClient;
import cl.smartbook.gestion_academica.client.ReferenciaInvalidaException;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.BitacoraClaseDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.BitacoraClase;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarBitacoraClase;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarBitacoraClase;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.AsignaturaRepository;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.BitacoraClaseRepository;
import cl.smartbook.gestion_academica.seguridad.SeguridadDocente;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BitacoraClaseService {

    private final BitacoraClaseRepository bitacoraClaseRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final AuthClient authClient;
    private final SeguridadDocente seguridadDocente;

    @Transactional(readOnly = true)
    public List<BitacoraClaseDTO> listar() {
        return bitacoraClaseRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public BitacoraClaseDTO buscarPorId(Long id) {
        BitacoraClase bitacora = bitacoraClaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bitacora no encontrada con id: " + id));
        seguridadDocente.verificarDictaAsignatura(bitacora.getIdAsignatura());
        return toDTO(bitacora);
    }

    @Transactional(readOnly = true)
    public List<BitacoraClaseDTO> listarPorAsignatura(Long idAsignatura) {
        seguridadDocente.verificarDictaAsignatura(idAsignatura);
        return bitacoraClaseRepository.findByIdAsignaturaOrderByFechaDesc(idAsignatura)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public BitacoraClaseDTO crear(AgregarBitacoraClase req, String authHeader) {
        if (!asignaturaRepository.existsById(req.getIdAsignatura())) {
            throw new ReferenciaInvalidaException("Asignatura no existe con id: " + req.getIdAsignatura());
        }
        Long idDocente;
        if (seguridadDocente.esSoloDocente()) {
            // El docente registra clases solo de SUS asignaturas y a su propio nombre (no se confía en el body).
            seguridadDocente.verificarDictaAsignatura(req.getIdAsignatura());
            idDocente = seguridadDocente.idUsuarioActual();
        } else {
            // ADMINISTRADOR/DIRECTOR pueden registrar a nombre de un docente (validado en auth).
            authClient.verificarUsuarioEsDocente(req.getIdDocente(), authHeader);
            idDocente = req.getIdDocente();
        }

        BitacoraClase bitacora = new BitacoraClase();
        bitacora.setIdAsignatura(req.getIdAsignatura());
        bitacora.setIdDocente(idDocente);
        bitacora.setFecha(req.getFecha());
        bitacora.setContenido(req.getContenido());
        bitacora.setObjetivosCubiertos(req.getObjetivosCubiertos());
        log.info("Registrando clase impartida en asignatura {}", req.getIdAsignatura());
        return toDTO(bitacoraClaseRepository.save(bitacora));
    }

    @Transactional
    public BitacoraClaseDTO actualizar(Long id, ActualizarBitacoraClase req) {
        BitacoraClase bitacora = bitacoraClaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bitacora no encontrada con id: " + id));
        seguridadDocente.verificarDictaAsignatura(bitacora.getIdAsignatura());

        if (req.getFecha() != null) bitacora.setFecha(req.getFecha());
        if (req.getContenido() != null) bitacora.setContenido(req.getContenido());
        if (req.getObjetivosCubiertos() != null) bitacora.setObjetivosCubiertos(req.getObjetivosCubiertos());

        return toDTO(bitacoraClaseRepository.save(bitacora));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!bitacoraClaseRepository.existsById(id)) {
            throw new EntityNotFoundException("Bitacora no encontrada con id: " + id);
        }
        bitacoraClaseRepository.deleteById(id);
    }

    private BitacoraClaseDTO toDTO(BitacoraClase b) {
        return new BitacoraClaseDTO(
                b.getId(),
                b.getIdAsignatura(),
                b.getIdDocente(),
                b.getFecha(),
                b.getContenido(),
                b.getObjetivosCubiertos(),
                b.getFechaCreacion());
    }
}
