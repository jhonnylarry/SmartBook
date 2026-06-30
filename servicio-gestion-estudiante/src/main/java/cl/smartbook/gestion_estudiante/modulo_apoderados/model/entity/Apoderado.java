package cl.smartbook.gestion_estudiante.modulo_apoderados.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "apoderado")
public class Apoderado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long idEstudiante;

    @Column(nullable = false)
    private Long idUsuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoApoderado tipo;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(unique = true)
    private String rut;

    @Column(nullable = false)
    private String email;

    private String telefono;

    private String parentesco;
}
