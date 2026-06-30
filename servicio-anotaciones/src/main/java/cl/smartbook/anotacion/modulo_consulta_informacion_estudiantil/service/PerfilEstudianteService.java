package cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.service;

import cl.smartbook.anotacion.client.AcademicaClient;
import cl.smartbook.anotacion.client.EstudianteClient;
import cl.smartbook.anotacion.client.VidaEstudianteClient;
import cl.smartbook.anotacion.client.dto.AntecedenteAcademicoDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteFamiliarDTO;
import cl.smartbook.anotacion.client.dto.AntecedenteMedicoDTO;
import cl.smartbook.anotacion.client.dto.ApoderadoDTO;
import cl.smartbook.anotacion.client.dto.DocumentoAdjuntoDTO;
import cl.smartbook.anotacion.client.dto.EstudianteDTO;
import cl.smartbook.anotacion.client.dto.EstudianteDetalleDTO;
import cl.smartbook.anotacion.client.dto.HojaVidaDTO;
import cl.smartbook.anotacion.config.SeguridadHelper;
import cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.model.dto.PerfilEstudianteDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.entity.Anotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.repository.AnotacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PerfilEstudianteService {

    private final EstudianteClient estudianteClient;
    private final VidaEstudianteClient vidaEstudianteClient;
    private final AcademicaClient academicaClient;
    private final AnotacionRepository anotacionRepository;

    @Transactional(readOnly = true)
    public PerfilEstudianteDTO obtenerPerfil(Long idEstudiante, String authHeader) {
        String rol = SeguridadHelper.getRolActual();
        if (rol == null) {
            throw new AccessDeniedException("No se pudo determinar el rol del usuario.");
        }

        // ── 1. AUTORIZACIÓN FAIL-CLOSED POR ROL ──────────────────────────────
        switch (rol) {
            case "ADMINISTRADOR", "DIRECTOR", "ADMINISTRATIVO" -> {
                // acceso irrestricto — solo verificar que el estudiante existe
                estudianteClient.verificarEstudianteExiste(idEstudiante, authHeader);
            }
            case "DOCENTE" -> {
                Long idCurso = estudianteClient.resolverIdCursoVigente(idEstudiante, authHeader);
                // FAIL-CLOSED: si el docente no dicta en el curso, lanza AccessDeniedException
                academicaClient.verificarDocenteDictaCurso(idCurso, authHeader);
            }
            case "APODERADO" -> {
                // FAIL-CLOSED: si no es apoderado del alumno, lanza AccessDeniedException
                estudianteClient.verificarApoderadoDe(idEstudiante, authHeader);
            }
            case "ESTUDIANTE" -> {
                EstudianteDTO miEstudiante = estudianteClient.obtenerMiEstudiante(authHeader);
                if (!miEstudiante.id().equals(idEstudiante)) {
                    throw new AccessDeniedException("Un estudiante solo puede consultar su propio perfil.");
                }
            }
            default -> throw new AccessDeniedException("Rol no autorizado para acceder al perfil del estudiante.");
        }

        // AUDITORÍA (Ley 19.628): traza de acceso a datos sensibles de un menor — quién, qué rol, qué alumno.
        log.info("[AUDIT] Acceso a perfil de estudiante: userId={} rol={} idEstudiante={}",
                SeguridadHelper.getUserIdActual(), rol, idEstudiante);

        // ── 2. OBTENER DATOS PERSONALES (FAIL-CLOSED: estudiante debe existir) ──
        EstudianteDetalleDTO detalle = estudianteClient.obtenerEstudianteDetalle(idEstudiante, authHeader);
        Long idCurso = detalle.matriculas() == null ? null :
                detalle.matriculas().stream()
                        .filter(m -> "VIGENTE".equalsIgnoreCase(m.estado()))
                        .map(EstudianteDetalleDTO.MatriculaDTO::idCurso)
                        .findFirst().orElse(null);

        String nombreCurso = (idCurso != null) ? academicaClient.nombreCurso(idCurso, authHeader) : null;

        PerfilEstudianteDTO.DatosPersonales datosPersonales = new PerfilEstudianteDTO.DatosPersonales(
                detalle.id(), detalle.nombre(), detalle.apellido(),
                detalle.rut(), detalle.fechaNacimiento(),
                detalle.direccion(), detalle.telefono(),
                idCurso, nombreCurso
        );

        // ── 3. APODERADOS (best-effort) — solo roles con necesidad de ver tutores ──
        // DOCENTE: no recibe lista de apoderados (contiene RUT, datos personales de terceros).
        // El docente accede a contactos de emergencia vía el bloque de salud (AntecedenteFamiliar).
        List<ApoderadoDTO> apoderados = "DOCENTE".equals(rol)
                ? List.of()
                : estudianteClient.apoderadosDe(idEstudiante, authHeader);

        // ── 4. ANOTACIONES (best-effort) ──────────────────────────────────────
        List<AnotacionDTO> anotaciones = anotacionRepository
                .findByIdEstudianteOrderByFechaDesc(idEstudiante)
                .stream().map(this::toAnotacionDTO).toList();

        // ── 5. DATOS DE VIDA-ESTUDIANTE (best-effort) ─────────────────────────
        List<HojaVidaDTO> hojas = vidaEstudianteClient.hojasDe(idEstudiante, authHeader);
        Long idHoja = (hojas != null && !hojas.isEmpty()) ? hojas.get(0).id() : null;

        // ── 6. REDACCIÓN POR ROL ──────────────────────────────────────────────
        return switch (rol) {
            case "ADMINISTRADOR", "DIRECTOR" -> construirPerfilCompleto(
                    datosPersonales, apoderados, anotaciones, idHoja, authHeader,
                    false, false);

            case "ADMINISTRATIVO" -> construirPerfilSinMedico(
                    datosPersonales, apoderados, anotaciones, idHoja, authHeader);

            case "DOCENTE" -> construirPerfilDocente(
                    datosPersonales, apoderados, anotaciones, idHoja, authHeader);

            case "APODERADO" -> construirPerfilCompleto(
                    datosPersonales, apoderados, anotaciones, idHoja, authHeader,
                    false, true);  // soloLectura=true — el apoderado solo consulta, no edita

            case "ESTUDIANTE" -> construirPerfilCompleto(
                    datosPersonales, apoderados, anotaciones, idHoja, authHeader,
                    false, true);  // soloLectura=true

            default -> throw new AccessDeniedException("Rol no autorizado.");
        };
    }

    // ── Construcción de perfiles según redacción ──────────────────────────────

    private PerfilEstudianteDTO construirPerfilCompleto(
            PerfilEstudianteDTO.DatosPersonales datos,
            List<ApoderadoDTO> apoderados,
            List<AnotacionDTO> anotaciones,
            Long idHoja,
            String authHeader,
            boolean sinDocumentos,
            boolean soloLectura) {

        AntecedenteMedicoDTO medico = null;
        List<AntecedenteFamiliarDTO> contactosEmergencia = List.of();
        AntecedenteAcademicoDTO academico = null;
        List<DocumentoAdjuntoDTO> documentos = List.of();

        if (idHoja != null) {
            List<AntecedenteMedicoDTO> medicos = vidaEstudianteClient.antecedentesMedicosDe(idHoja, authHeader);
            medico = medicos.isEmpty() ? null : medicos.get(0);
            contactosEmergencia = vidaEstudianteClient.antecedentesFamiliaresDe(idHoja, authHeader)
                    .stream()
                    .filter(f -> Boolean.TRUE.equals(f.esContactoEmergencia()))
                    .toList();
            academico = vidaEstudianteClient.antecedenteAcademicoDe(idHoja, authHeader);
            if (!sinDocumentos) {
                documentos = vidaEstudianteClient.documentosDe(idHoja, authHeader);
            }
        }

        PerfilEstudianteDTO.Salud salud = new PerfilEstudianteDTO.Salud(medico, contactosEmergencia);
        PerfilEstudianteDTO.Flags flags = new PerfilEstudianteDTO.Flags(
                true, true, true, !sinDocumentos, true, soloLectura);

        return new PerfilEstudianteDTO(datos, apoderados, salud, academico, documentos, anotaciones, flags);
    }

    private PerfilEstudianteDTO construirPerfilSinMedico(
            PerfilEstudianteDTO.DatosPersonales datos,
            List<ApoderadoDTO> apoderados,
            List<AnotacionDTO> anotaciones,
            Long idHoja,
            String authHeader) {

        AntecedenteAcademicoDTO academico = null;
        List<DocumentoAdjuntoDTO> documentos = List.of();

        if (idHoja != null) {
            academico = vidaEstudianteClient.antecedenteAcademicoDe(idHoja, authHeader);
            documentos = vidaEstudianteClient.documentosDe(idHoja, authHeader);
        }

        // ADMINISTRATIVO: salud=null, no lee médico ni contactos (redacción total del bloque salud)
        PerfilEstudianteDTO.Flags flags = new PerfilEstudianteDTO.Flags(
                false, false, true, true, true, false);

        return new PerfilEstudianteDTO(datos, apoderados, null, academico, documentos, anotaciones, flags);
    }

    private PerfilEstudianteDTO construirPerfilDocente(
            PerfilEstudianteDTO.DatosPersonales datos,
            List<ApoderadoDTO> apoderados,
            List<AnotacionDTO> anotaciones,
            Long idHoja,
            String authHeader) {

        AntecedenteMedicoDTO medicoRedactado = null;
        List<AntecedenteFamiliarDTO> contactosEmergencia = List.of();
        AntecedenteAcademicoDTO academico = null;

        if (idHoja != null) {
            List<AntecedenteMedicoDTO> medicos = vidaEstudianteClient.antecedentesMedicosDe(idHoja, authHeader);
            if (!medicos.isEmpty()) {
                AntecedenteMedicoDTO original = medicos.get(0);
                // REDACTAR previsionSalud — docente no la ve
                medicoRedactado = new AntecedenteMedicoDTO(
                        original.id(), original.idHojaVida(),
                        original.tipoSangre(), original.alergias(),
                        original.enfermedadesCronicas(), original.medicacion(),
                        null  // previsionSalud redactada
                );
            }
            contactosEmergencia = vidaEstudianteClient.antecedentesFamiliaresDe(idHoja, authHeader)
                    .stream()
                    .filter(f -> Boolean.TRUE.equals(f.esContactoEmergencia()))
                    .toList();
            academico = vidaEstudianteClient.antecedenteAcademicoDe(idHoja, authHeader);
        }

        PerfilEstudianteDTO.Salud salud = new PerfilEstudianteDTO.Salud(medicoRedactado, contactosEmergencia);
        // DOCENTE: no ve documentos (incluyeDocumentos=false)
        PerfilEstudianteDTO.Flags flags = new PerfilEstudianteDTO.Flags(
                true, true, true, false, true, false);

        return new PerfilEstudianteDTO(datos, apoderados, salud, academico, List.of(), anotaciones, flags);
    }

    private AnotacionDTO toAnotacionDTO(Anotacion a) {
        return new AnotacionDTO(
                a.getId(), a.getIdEstudiante(), a.getIdDocente(),
                a.getTipo(), a.getGravedad(), a.getDescripcion(),
                a.getFecha(), a.getFechaCreacion());
    }
}
