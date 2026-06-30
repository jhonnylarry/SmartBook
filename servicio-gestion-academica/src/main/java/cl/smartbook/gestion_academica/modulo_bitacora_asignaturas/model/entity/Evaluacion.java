package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "evaluacion")
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "id_asignatura", nullable = false)
    private Long idAsignatura;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal ponderacion;

    /** Periodo académico al que pertenece (asignado por la fecha). Nullable: legado = "todo el año". */
    @Column(name = "id_periodo")
    private Long idPeriodo;
}
