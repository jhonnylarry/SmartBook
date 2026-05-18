package cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.model.dto;

import java.util.List;

import cl.smartbook.anotacion.client.dto.EstudianteDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;

public record ResumenEstudianteDTO(
        EstudianteDTO estudiante,
        List<AnotacionDTO> anotaciones,
        int totalAnotaciones
) {}
