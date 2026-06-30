package cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.model.dto;

import cl.smartbook.anotacion.client.dto.AntecedenteAcademicoDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteFamiliarDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteMedicoDTO;
import cl.smartbook.anotacion.client.dto.ApoderadoDTO;
import cl.smartbook.anotacion.client.dto.DocumentoAdjuntoDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;

import java.util.List;

public record PerfilEstudianteDTO(
        DatosPersonales datosPersonales,
        List<ApoderadoDTO> apoderados,
        Salud salud,
        AntecedenteAcademicoDTO academico,
        List<DocumentoAdjuntoDTO> documentos,
        List<AnotacionDTO> anotaciones,
        Flags flags
) {
    public record DatosPersonales(
            Long id,
            String nombre,
            String apellido,
            String rut,
            String fechaNacimiento,
            String direccion,
            String telefono,
            Long idCurso,
            String nombreCurso
    ) {}

    public record Salud(
            AntecedenteMedicoDTO medico,
            List<AntecedenteFamiliarDTO> contactosEmergencia
    ) {}

    public record Flags(
            boolean incluyeSalud,
            boolean incluyeMedico,
            boolean incluyeAcademico,
            boolean incluyeDocumentos,
            boolean incluyeAnotaciones,
            boolean soloLectura
    ) {}
}
