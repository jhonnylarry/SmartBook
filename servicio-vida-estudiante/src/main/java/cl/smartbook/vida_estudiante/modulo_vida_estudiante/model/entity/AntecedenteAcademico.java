package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity;

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

@Entity
@Getter
@Setter
@Table(name = "antecedente_academico")
public class AntecedenteAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_hoja_vida", nullable = false)
    private Long idHojaVida;

    @Column(name = "colegio_procedencia", length = 200)
    private String colegioProcedencia;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "vive_con", length = 100)
    private String viveCon;

    @Column(name = "promedio_general", precision = 4, scale = 2)
    private BigDecimal promedioGeneral;
}
