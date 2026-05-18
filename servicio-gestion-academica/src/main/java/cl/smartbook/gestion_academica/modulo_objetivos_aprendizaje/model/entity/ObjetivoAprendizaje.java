package cl.smartbook.gestion_academica.modulo_objetivos_aprendizaje.model.entity;

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
@Table(name = "objetivo_aprendizaje")
public class ObjetivoAprendizaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Column(name = "id_asignatura", nullable = false)
    private Long idAsignatura;

    @Column(nullable = false, length = 50)
    private String nivel;
}
