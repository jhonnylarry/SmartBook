package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgregarBitacoraClase {

    @NotNull
    private Long idAsignatura;

    @NotNull
    private Long idDocente;

    @NotNull
    private LocalDate fecha;

    @NotBlank
    @Size(max = 2000)
    private String contenido;

    @Size(max = 500)
    private String objetivosCubiertos;
}
