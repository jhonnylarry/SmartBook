package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarBitacoraClase {

    private LocalDate fecha;

    @Size(max = 2000)
    private String contenido;

    @Size(max = 500)
    private String objetivosCubiertos;
}
