package cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.entity;

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
@Table(name = "antecedente_familiar")
public class AntecedenteFamiliar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_hoja_vida", nullable = false)
    private Long idHojaVida;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "parentesco", nullable = false, length = 50)
    private String parentesco;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "ocupacion", length = 100)
    private String ocupacion;

    @Column(name = "es_contacto_emergencia", nullable = false)
    private boolean esContactoEmergencia;
}
