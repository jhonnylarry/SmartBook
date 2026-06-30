package cl.smartbook.gestion_academica.modulo_periodos_academicos.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Periodo académico (trimestre/semestre) del colegio. Es un "contenedor de tiempo"
 * global: las evaluaciones se asocian a un periodo según su fecha. El cierre formal
 * se hace a nivel de asignatura+periodo (ver modulo_gestion_notas / CierreAsignatura).
 */
@Getter
@Setter
@Entity
@Table(name = "periodo_academico")
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Integer anio;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;
}
