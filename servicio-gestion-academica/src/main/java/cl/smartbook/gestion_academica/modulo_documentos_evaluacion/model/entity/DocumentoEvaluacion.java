package cl.smartbook.gestion_academica.modulo_documentos_evaluacion.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Documento (PDF) adjunto a una evaluación — p.ej. el registro de una "prueba física".
 * El contenido binario se guarda como columna {@code bytea} y se carga de forma perezosa
 * para que listar la metadata no traiga los bytes.
 */
@Getter
@Setter
@Entity
@Table(name = "documento_evaluacion")
public class DocumentoEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_evaluacion", nullable = false)
    private Long idEvaluacion;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "tipo_mime", nullable = false, length = 100)
    private String tipoMime;

    @Column(name = "tamano_bytes", nullable = false)
    private Long tamanoBytes;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "contenido", nullable = false, columnDefinition = "bytea")
    private byte[] contenido;

    @Column(name = "subido_por")
    private Long subidoPor;

    @Column(name = "fecha_carga", nullable = false, updatable = false)
    private LocalDateTime fechaCarga;

    @PrePersist
    void prePersist() {
        this.fechaCarga = LocalDateTime.now();
    }
}
