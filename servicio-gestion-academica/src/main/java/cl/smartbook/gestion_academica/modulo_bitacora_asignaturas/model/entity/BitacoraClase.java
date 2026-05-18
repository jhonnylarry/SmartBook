package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.entity;

import java.time.LocalDate;
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

@Getter
@Setter
@Entity
@Table(name = "bitacora_clase")
public class BitacoraClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_asignatura", nullable = false)
    private Long idAsignatura;

    @Column(name = "id_docente", nullable = false)
    private Long idDocente;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 2000)
    private String contenido;

    @Column(name = "objetivos_cubiertos", length = 500)
    private String objetivosCubiertos;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}
