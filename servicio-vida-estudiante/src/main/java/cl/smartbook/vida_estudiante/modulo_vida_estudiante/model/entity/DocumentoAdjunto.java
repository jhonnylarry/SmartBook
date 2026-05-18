package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "documento_adjunto")
public class DocumentoAdjunto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_hoja_vida", nullable = false)
    private Long idHojaVida;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "subido_por")
    private Long subidoPor;

    @Column(name = "fecha_carga", nullable = false, updatable = false)
    private LocalDateTime fechaCarga;

    @PrePersist
    void prePersist() {
        this.fechaCarga = LocalDateTime.now();
    }
}
