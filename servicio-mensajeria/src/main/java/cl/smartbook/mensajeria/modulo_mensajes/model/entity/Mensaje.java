package cl.smartbook.mensajeria.modulo_mensajes.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mensajes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_remitente", nullable = false)
    private Long idRemitente;

    @Column(name = "id_destinatario", nullable = false)
    private Long idDestinatario;

    @Column(nullable = false, length = 200)
    private String asunto;

    @Column(columnDefinition = "TEXT", nullable = false, length = 2000)
    private String contenido;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(nullable = false)
    @Builder.Default
    private Boolean leido = false;

    /** Correlaciona las N copias de una difusión (null = mensaje 1-a-1). */
    @Column(name = "lote_difusion")
    private UUID loteDifusion;

    @PrePersist
    protected void onCreate() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
    }
}
