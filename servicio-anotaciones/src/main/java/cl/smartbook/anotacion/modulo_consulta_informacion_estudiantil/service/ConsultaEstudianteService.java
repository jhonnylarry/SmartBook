package cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.smartbook.anotacion.client.EstudianteClient;
import cl.smartbook.anotacion.client.dto.EstudianteDTO;
import cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.model.dto.ResumenEstudianteDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.Anotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.repository.AnotacionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConsultaEstudianteService {

    private final EstudianteClient estudianteClient;
    private final AnotacionRepository anotacionRepository;

    @Transactional(readOnly = true)
    public ResumenEstudianteDTO obtenerResumen(Long idEstudiante, String authHeader) {
        EstudianteDTO estudiante = estudianteClient.obtenerEstudiante(idEstudiante, authHeader);

        List<AnotacionDTO> anotaciones = anotacionRepository
                .findByIdEstudianteOrderByFechaDesc(idEstudiante)
                .stream()
                .map(this::toDTO)
                .toList();

        return new ResumenEstudianteDTO(estudiante, anotaciones, anotaciones.size());
    }

    private AnotacionDTO toDTO(Anotacion a) {
        return new AnotacionDTO(
                a.getId(),
                a.getIdEstudiante(),
                a.getIdDocente(),
                a.getTipo(),
                a.getGravedad(),
                a.getDescripcion(),
                a.getFecha(),
                a.getFechaCreacion());
    }
}
