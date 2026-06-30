package cl.smartbook.gestion_academica.modulo_documentos_evaluacion.service;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity.Evaluacion;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.repository.EvaluacionRepository;
import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.dto.DocumentoEvaluacionDTO;
import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.entity.DocumentoEvaluacion;
import cl.smartbook.gestion_academica.modulo_documentos_evaluacion.repository.DocumentoEvaluacionRepository;
import cl.smartbook.gestion_academica.seguridad.SeguridadDocente;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentoEvaluacionService {

    /** Límite alineado con spring.servlet.multipart.max-file-size (10 MB). */
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final DocumentoEvaluacionRepository documentoRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final SeguridadDocente seguridadDocente;

    @Transactional(readOnly = true)
    public List<DocumentoEvaluacionDTO> listarPorEvaluacion(Long idEvaluacion) {
        verificarAccesoEvaluacion(idEvaluacion);
        return documentoRepository.findByIdEvaluacion(idEvaluacion).stream().map(this::toDTO).toList();
    }

    @Transactional
    public DocumentoEvaluacionDTO subir(Long idEvaluacion, MultipartFile file, Long subidoPor) {
        verificarAccesoEvaluacion(idEvaluacion);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo es obligatorio y no puede estar vacío");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo permitido (10 MB)");
        }

        byte[] contenido;
        try {
            contenido = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el archivo: " + e.getMessage());
        }

        if (!esPdf(file, contenido)) {
            throw new IllegalArgumentException("El archivo debe ser un PDF");
        }

        String nombre = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "documento.pdf");

        DocumentoEvaluacion doc = new DocumentoEvaluacion();
        doc.setIdEvaluacion(idEvaluacion);
        doc.setNombreArchivo(nombre);
        doc.setTipoMime("application/pdf");
        doc.setTamanoBytes(file.getSize());
        doc.setContenido(contenido);
        doc.setSubidoPor(subidoPor);

        log.info("Subiendo documento '{}' ({} bytes) a evaluacion {}", nombre, file.getSize(), idEvaluacion);
        return toDTO(documentoRepository.save(doc));
    }

    /** Carga la entidad con sus bytes (dentro de la transacción) para streamearla. */
    @Transactional(readOnly = true)
    public DocumentoEvaluacion obtenerParaDescarga(Long idDoc) {
        DocumentoEvaluacion doc = documentoRepository.findById(idDoc)
                .orElseThrow(() -> new EntityNotFoundException("Documento no encontrado con id: " + idDoc));
        verificarAccesoEvaluacion(doc.getIdEvaluacion());
        // Fuerza la carga del LOB perezoso antes de salir de la transacción.
        doc.getContenido();
        return doc;
    }

    @Transactional
    public void eliminar(Long idDoc) {
        DocumentoEvaluacion doc = documentoRepository.findById(idDoc)
                .orElseThrow(() -> new EntityNotFoundException("Documento no encontrado con id: " + idDoc));
        verificarAccesoEvaluacion(doc.getIdEvaluacion());
        documentoRepository.deleteById(idDoc);
        log.info("Documento eliminado: {}", idDoc);
    }

    /** Carga la evaluación (404 si no existe) y, si el solicitante es solo DOCENTE, exige que dicte su asignatura. */
    private Evaluacion verificarAccesoEvaluacion(Long idEvaluacion) {
        Evaluacion ev = evaluacionRepository.findById(idEvaluacion)
                .orElseThrow(() -> new EntityNotFoundException("Evaluación no encontrada con id: " + idEvaluacion));
        seguridadDocente.verificarDictaAsignatura(ev.getIdAsignatura());
        return ev;
    }

    /** Acepta por content-type, extensión .pdf o magic bytes "%PDF". */
    private boolean esPdf(MultipartFile file, byte[] contenido) {
        String tipo = file.getContentType();
        if (tipo != null && tipo.toLowerCase().contains("application/pdf")) {
            return true;
        }
        String nombre = file.getOriginalFilename();
        if (nombre != null && nombre.toLowerCase().endsWith(".pdf")) {
            return true;
        }
        return contenido.length >= 4
                && contenido[0] == 0x25 && contenido[1] == 0x50
                && contenido[2] == 0x44 && contenido[3] == 0x46; // %PDF
    }

    private DocumentoEvaluacionDTO toDTO(DocumentoEvaluacion d) {
        return new DocumentoEvaluacionDTO(
                d.getId(),
                d.getIdEvaluacion(),
                d.getNombreArchivo(),
                d.getTipoMime(),
                d.getTamanoBytes(),
                d.getSubidoPor(),
                d.getFechaCarga());
    }
}
