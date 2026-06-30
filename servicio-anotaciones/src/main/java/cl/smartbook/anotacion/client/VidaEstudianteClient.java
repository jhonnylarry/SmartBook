package cl.smartbook.anotacion.client;

import cl.smartbook.anotacion.client.dto.AntecedenteAcademicoDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteFamiliarDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteMedicoDTO;
import cl.smartbook.anotacion.client.dto.DocumentoAdjuntoDTO;
import cl.smartbook.anotacion.client.dto.HojaVidaDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Component
public class VidaEstudianteClient {

    private final WebClient vidaWebClient;
    private final String internalToken;

    public VidaEstudianteClient(
            @Qualifier("vidaWebClient") WebClient vidaWebClient,
            @Value("${smartbook.internal.service-token}") String internalToken) {
        this.vidaWebClient = vidaWebClient;
        this.internalToken = internalToken;
    }

    public List<HojaVidaDTO> hojasDe(Long idEstudiante, String authHeader) {
        try {
            return vidaWebClient.get()
                    .uri("/api/v1/hojas-vida/estudiante/{id}", idEstudiante)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-Internal-Token", internalToken)
                    .retrieve()
                    .bodyToFlux(HojaVidaDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo obtener hojas de vida del estudiante {}.", idEstudiante, e);
            return List.of();
        }
    }

    public List<AntecedenteMedicoDTO> antecedentesMedicosDe(Long idHoja, String authHeader) {
        try {
            return vidaWebClient.get()
                    .uri("/api/v1/antecedentes-medicos/hoja-vida/{idHoja}", idHoja)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-Internal-Token", internalToken)
                    .retrieve()
                    .bodyToFlux(AntecedenteMedicoDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo obtener antecedentes médicos de hoja {}.", idHoja, e);
            return List.of();
        }
    }

    public List<AntecedenteFamiliarDTO> antecedentesFamiliaresDe(Long idHoja, String authHeader) {
        try {
            return vidaWebClient.get()
                    .uri("/api/v1/antecedentes-familiares/hoja-vida/{idHoja}", idHoja)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-Internal-Token", internalToken)
                    .retrieve()
                    .bodyToFlux(AntecedenteFamiliarDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo obtener antecedentes familiares de hoja {}.", idHoja, e);
            return List.of();
        }
    }

    public AntecedenteAcademicoDTO antecedenteAcademicoDe(Long idHoja, String authHeader) {
        try {
            List<AntecedenteAcademicoDTO> lista = vidaWebClient.get()
                    .uri("/api/v1/antecedentes-academicos/hoja-vida/{idHoja}", idHoja)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-Internal-Token", internalToken)
                    .retrieve()
                    .bodyToFlux(AntecedenteAcademicoDTO.class)
                    .collectList()
                    .block();
            return (lista != null && !lista.isEmpty()) ? lista.get(0) : null;
        } catch (Exception e) {
            log.warn("No se pudo obtener antecedente académico de hoja {}.", idHoja, e);
            return null;
        }
    }

    public List<DocumentoAdjuntoDTO> documentosDe(Long idHoja, String authHeader) {
        try {
            return vidaWebClient.get()
                    .uri("/api/v1/documentos-adjuntos/hoja-vida/{idHoja}", idHoja)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-Internal-Token", internalToken)
                    .retrieve()
                    .bodyToFlux(DocumentoAdjuntoDTO.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.warn("No se pudo obtener documentos de hoja {}.", idHoja, e);
            return List.of();
        }
    }
}
