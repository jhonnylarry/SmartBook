package cl.smartbook.gestion_estudiante.modulo_matricula_estudiantes.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "matriculas")
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @NonNull
    @Column(nullable = false)
    private Long idCurso;

    @NonNull
    @Column(nullable = false)
    private LocalDateTime fechaMatricula = LocalDateTime.now();

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMatricula estado = EstadoMatricula.VIGENTE;
}
