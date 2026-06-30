package cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/**
 * Cierre de una asignatura para un periodo académico. Su existencia indica que la
 * asignatura está "cerrada" en ese periodo: no se pueden crear/editar/eliminar notas
 * de sus evaluaciones (los promedios quedan finales). Solo Director/Admin cierran o reabren.
 */
@Getter
@Setter
@Entity
@Table(name = "cierre_asignatura",
        uniqueConstraints = @UniqueConstraint(name = "uk_cierre_asignatura_periodo",
                columnNames = {"id_asignatura", "id_periodo"}))
public class CierreAsignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_asignatura", nullable = false)
    private Long idAsignatura;

    @Column(name = "id_periodo", nullable = false)
    private Long idPeriodo;

    @Column(name = "fecha_cierre", nullable = false)
    private LocalDateTime fechaCierre;

    @Column(name = "id_usuario_cierre")
    private Long idUsuarioCierre;

    @PrePersist
    void onCreate() {
        this.fechaCierre = LocalDateTime.now();
    }
}
