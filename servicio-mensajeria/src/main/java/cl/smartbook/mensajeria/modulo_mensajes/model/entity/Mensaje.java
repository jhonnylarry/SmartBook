package cl.smartbook.mensajeria.modulo_mensajes.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @PrePersist
    protected void onCreate() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
    }
}
