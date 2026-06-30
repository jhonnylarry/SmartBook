package cl.smartbook.vida_estudiante.modulo_vida_estudiante.service;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.HojaVidaEstudianteDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity.HojaVidaEstudiante;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarHojaVidaEstudiante;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarHojaVidaEstudiante;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.repository.HojaVidaEstudianteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HojaVidaEstudianteService {

    private final HojaVidaEstudianteRepository hojaVidaRepository;
    private final WebClient gestionEstudianteWebClient;

    private HojaVidaEstudianteDTO toDTO(HojaVidaEstudiante e) {
        return new HojaVidaEstudianteDTO(
                e.getId(),
                e.getIdEstudiante(),
                e.getAnioAcademico(),
                e.getObservaciones(),
                e.getFechaCreacion());
    }

    @Transactional(readOnly = true)
    public List<HojaVidaEstudianteDTO> listar() {
        return hojaVidaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public HojaVidaEstudianteDTO buscarPorId(Long id) {
        return hojaVidaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Hoja de vida no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<HojaVidaEstudianteDTO> buscarPorEstudiante(Long idEstudiante) {
        return hojaVidaRepository.findAllByIdEstudiante(idEstudiante).stream().map(this::toDTO).toList();
    }

    @Transactional
    public HojaVidaEstudianteDTO crear(AgregarHojaVidaEstudiante request) {
        validarEstudianteExiste(request.getIdEstudiante());

        var nueva = new HojaVidaEstudiante();
        nueva.setIdEstudiante(request.getIdEstudiante());
        nueva.setAnioAcademico(request.getAnioAcademico());
        nueva.setObservaciones(request.getObservaciones());
        var saved = toDTO(hojaVidaRepository.save(nueva));
        log.info("Hoja de vida creada id={} idEstudiante={}", saved.id(), saved.idEstudiante());
        return saved;
    }

    @Transactional
    public HojaVidaEstudianteDTO actualizar(Long id, ActualizarHojaVidaEstudiante request) {
        var hoja = hojaVidaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hoja de vida no encontrada con id: " + id));

        if (request.getAnioAcademico() != null) hoja.setAnioAcademico(request.getAnioAcademico());
        if (request.getObservaciones() != null) hoja.setObservaciones(request.getObservaciones());

        log.info("Hoja de vida actualizada id={}", id);
        return toDTO(hojaVidaRepository.save(hoja));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!hojaVidaRepository.existsById(id)) {
            throw new EntityNotFoundException("Hoja de vida no encontrada con id: " + id);
        }
        hojaVidaRepository.deleteById(id);
        log.info("Hoja de vida eliminada id={}", id);
    }

    /** Lee el header Authorization del request actual (hilo servlet) para propagarlo al WebClient. */
    private String currentAuthHeader() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes sra) {
            return sra.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
        }
        return null;
    }

    private void validarEstudianteExiste(Long idEstudiante) {
        final String authHeader = currentAuthHeader();
        try {
            gestionEstudianteWebClient.get()
                    .uri("/api/v1/estudiantes/{id}", idEstudiante)
                    .headers(h -> {
                        if (authHeader != null) {
                            h.set(HttpHeaders.AUTHORIZATION, authHeader);
                        }
                    })
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Estudiante no existe con id: " + idEstudiante);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("[HojaVidaEstudianteService] gestion-estudiante no disponible. idEstudiante={}", idEstudiante, e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo validar el estudiante. Intente mas tarde.");
        }
    }
}
