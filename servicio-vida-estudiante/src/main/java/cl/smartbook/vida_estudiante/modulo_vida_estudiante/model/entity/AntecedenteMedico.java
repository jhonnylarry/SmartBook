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
@Table(name = "antecedente_medico")
public class AntecedenteMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_hoja_vida", nullable = false)
    private Long idHojaVida;

    @Column(name = "tipo_sangre", length = 5)
    private String tipoSangre;

    @Column(name = "alergias", length = 500)
    private String alergias;

    @Column(name = "enfermedades_cronicas", length = 500)
    private String enfermedadesCronicas;

    @Column(name = "medicacion", length = 500)
    private String medicacion;

    @Column(name = "prevision_salud", length = 100)
    private String previsionSalud;
}
