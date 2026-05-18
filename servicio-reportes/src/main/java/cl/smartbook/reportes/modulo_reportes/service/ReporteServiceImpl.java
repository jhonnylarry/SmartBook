package cl.smartbook.reportes.modulo_reportes.service;

import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteAnotacionesDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteCursoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.ReporteNotasDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.AnotacionExternaDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.CursoExternoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.EstudianteExternoDTO;
import cl.smartbook.reportes.modulo_reportes.model.dto.external.NotaExternaDTO;
import cl.smartbook.reportes.modulo_reportes.model.entity.Reporte;
import cl.smartbook.reportes.modulo_reportes.model.entity.TipoReporte;
import cl.smartbook.reportes.modulo_reportes.repository.ReporteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReporteServiceImpl implements ReporteService {

    private final ReporteRepository reporteRepository;
    private final ObjectMapper objectMapper;
    private final WebClient gestionAcademicaWebClient;
    private final WebClient gestionEstudianteWebClient;
    private final WebClient anotacionWebClient;

    @Override
    public ReporteNotasDTO generarReporteNotas(Long idEstudiante, String authHeader) {
        log.info("Generando reporte de notas para idEstudiante={}", idEstudiante);
        var errores = new ArrayList<String>();

        var notas = fetchList(
                gestionAcademicaWebClient,
                "/api/v1/notas/estudiante/{id}",
                new ParameterizedTypeReference<List<NotaExternaDTO>>() {},
                errores, "gestion-academica", idEstudiante, authHeader);

        var estudiante = fetchOne(
                gestionEstudianteWebClient,
                "/api/v1/estudiantes/{id}",
                EstudianteExternoDTO.class,
                errores, "gestion-estudiante", idEstudiante, authHeader);

        var payload = new ReporteNotasDTO(idEstudiante, estudiante, notas, errores);
        persistir(TipoReporte.NOTAS, idEstudiante, payload);
        return payload;
    }

    @Override
    public ReporteAnotacionesDTO generarReporteAnotaciones(Long idEstudiante, String authHeader) {
        log.info("Generando reporte de anotaciones para idEstudiante={}", idEstudiante);
        var errores = new ArrayList<String>();

        var anotaciones = fetchList(
                anotacionWebClient,
                "/api/v1/anotaciones/estudiante/{id}",
                new ParameterizedTypeReference<List<AnotacionExternaDTO>>() {},
                errores, "anotacion", idEstudiante, authHeader);

        var estudiante = fetchOne(
                gestionEstudianteWebClient,
                "/api/v1/estudiantes/{id}",
                EstudianteExternoDTO.class,
                errores, "gestion-estudiante", idEstudiante, authHeader);

        var payload = new ReporteAnotacionesDTO(idEstudiante, estudiante, anotaciones, errores);
        persistir(TipoReporte.ANOTACIONES, idEstudiante, payload);
        return payload;
    }

    @Override
    public ReporteCursoDTO generarReporteCurso(Long idCurso, String authHeader) {
        log.info("Generando reporte de curso para idCurso={}", idCurso);
        var errores = new ArrayList<String>();

        var curso = fetchOne(
                gestionAcademicaWebClient,
                "/api/v1/cursos/{id}",
                CursoExternoDTO.class,
                errores, "gestion-academica", idCurso, authHeader);

        var estudiantes = fetchList(
                gestionEstudianteWebClient,
                "/api/v1/estudiantes/curso/{id}",
                new ParameterizedTypeReference<List<EstudianteExternoDTO>>() {},
                errores, "gestion-estudiante", idCurso, authHeader);

        var notas = fetchList(
                gestionAcademicaWebClient,
                "/api/v1/notas/curso/{id}",
                new ParameterizedTypeReference<List<NotaExternaDTO>>() {},
                errores, "gestion-academica", idCurso, authHeader);

        var payload = new ReporteCursoDTO(idCurso, curso, estudiantes, notas, errores);
        persistir(TipoReporte.CURSO, idCurso, payload);
        return payload;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteDTO> historialPorUsuario(Long idUsuario) {
        return reporteRepository.findByIdSolicitanteOrderByFechaGeneracionDesc(idUsuario)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteDTO getById(Long id) {
        return toDTO(reporteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reporte no encontrado con id: " + id)));
    }

    private void persistir(TipoReporte tipo, Long idReferencia, Object payload) {
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("No se pudo serializar el payload del reporte: {}", e.getMessage());
            json = "{}";
        }
        Long idSolicitante = null;
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getDetails() != null) {
                idSolicitante = Long.parseLong(auth.getDetails().toString());
            }
        } catch (Exception e) {
            log.warn("No se pudo extraer idSolicitante del SecurityContext: {}", e.getMessage());
        }
        reporteRepository.save(Reporte.builder()
                .tipo(tipo)
                .idReferencia(idReferencia)
                .datosJson(json)
                .idSolicitante(idSolicitante)
                .build());
    }

    private <T> List<T> fetchList(WebClient client, String uri,
                                   ParameterizedTypeReference<List<T>> type,
                                   List<String> errores, String servicio, Object uriVar,
                                   String authHeader) {
        try {
            var result = client.get()
                    .uri(uri, uriVar)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(),
                            resp -> resp.createException())
                    .bodyToMono(type)
                    .block();
            return result != null ? result : List.of();
        } catch (Exception ex) {
            log.warn("Servicio {} no disponible en {}: {}", servicio, uri, ex.getMessage());
            errores.add("Servicio " + servicio + " no disponible");
            return List.of();
        }
    }

    private <T> T fetchOne(WebClient client, String uri, Class<T> type,
                            List<String> errores, String servicio, Object uriVar,
                            String authHeader) {
        try {
            return client.get()
                    .uri(uri, uriVar)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(),
                            resp -> resp.createException())
                    .bodyToMono(type)
                    .block();
        } catch (Exception ex) {
            log.warn("Servicio {} no disponible en {}: {}", servicio, uri, ex.getMessage());
            errores.add("Servicio " + servicio + " no disponible");
            return null;
        }
    }

    private ReporteDTO toDTO(Reporte r) {
        return new ReporteDTO(
                r.getId(), r.getTipo(), r.getIdReferencia(),
                r.getDatosJson(), r.getFechaGeneracion(), r.getIdSolicitante());
    }
}
