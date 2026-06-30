package cl.smartbook.evento_calendario.modulo_gestion_eventos.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "evento")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEvento tipo;

    /** Ámbito/destinatario del evento. Nullable solo por compatibilidad con datos previos al backfill. */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AmbitoEvento ambito;

    @Column(name = "id_asignatura")
    private Long idAsignatura;

    /** Curso destino (cuando ambito = CURSO). Referencia simple a gestion-academica (sin FK). */
    @Column(name = "id_curso")
    private Long idCurso;

    /** Estudiante destino (cuando ambito = ESTUDIANTE). Id de la ENTIDAD estudiante (no idUsuario). */
    @Column(name = "id_estudiante")
    private Long idEstudiante;

    @Column(name = "id_creador")
    private Long idCreador;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}
