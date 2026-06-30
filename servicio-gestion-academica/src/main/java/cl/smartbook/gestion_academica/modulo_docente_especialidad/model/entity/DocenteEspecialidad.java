package cl.smartbook.gestion_academica.modulo_docente_especialidad.model.entity;

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
 * Especialidad de un docente: una materia (rubro) que está habilitado a dictar.
 * El idDocente es el id del usuario en servicio-auth (referencia simple, sin FK entre BDs).
 * La materia se compara por nombre (case-insensitive), nivel-agnóstico.
 */
@Getter
@Setter
@Entity
@Table(name = "docente_especialidad",
        uniqueConstraints = @UniqueConstraint(name = "uk_docente_materia", columnNames = {"id_docente", "materia"}))
public class DocenteEspecialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_docente", nullable = false)
    private Long idDocente;

    @Column(nullable = false, length = 120)
    private String materia;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    private void prePersist() {
        fechaCreacion = LocalDateTime.now();
    }
}
