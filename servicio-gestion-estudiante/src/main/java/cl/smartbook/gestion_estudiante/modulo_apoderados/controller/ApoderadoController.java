package cl.smartbook.gestion_estudiante.modulo_apoderados.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto.ApoderadoDTO;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.dto.PupiloDTO;
import cl.smartbook.gestion_estudiante.modulo_apoderados.model.request.ActualizarApoderado;
import cl.smartbook.gestion_estudiante.modulo_apoderados.service.ApoderadoService;
import jakarta.persistence.EntityNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Apoderados", description = "Gestión de apoderados de estudiantes")
@RestController
@RequestMapping("/api/v1/apoderados")
@RequiredArgsConstructor
public class ApoderadoController {

    private final ApoderadoService apoderadoService;

    // DOCENTE NO lista apoderados (RUT/email/telefono de adultos) de cualquier alumno directo:
    // accede solo via el agregador de perfil (anotacion), que valida curso y redacta apoderados
    // para docentes. El agregador lee con X-Internal-Token (ROLE_SERVICIO_INTERNO).
    @Operation(summary = "Listar apoderados de un estudiante")
    @ApiResponse(responseCode = "200", description = "Lista de apoderados")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','INSPECTOR','SERVICIO_INTERNO')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<ApoderadoDTO>> listarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(apoderadoService.listarPorEstudiante(idEstudiante));
    }

    @Operation(summary = "Apoderados de los estudiantes de un curso (batch, para directorio de contactos)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','DOCENTE','INSPECTOR')")
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<ApoderadoDTO>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(apoderadoService.apoderadosDeCurso(idCurso));
    }

    @Operation(summary = "Mis pupilos: estudiantes a cargo del apoderado autenticado")
    @PreAuthorize("hasRole('APODERADO')")
    @GetMapping("/me")
    public ResponseEntity<List<PupiloDTO>> misPupilos() {
        return ResponseEntity.ok(apoderadoService.misPupilos(idUsuarioDesdeJwt()));
    }

    @Operation(summary = "Verifica que el apoderado autenticado sea tutor del estudiante (uso interno, anti-IDOR)")
    @PreAuthorize("hasRole('APODERADO')")
    @GetMapping("/verificar/{idEstudiante}")
    public ResponseEntity<Void> verificar(@PathVariable Long idEstudiante) {
        if (!apoderadoService.esApoderadoDe(idUsuarioDesdeJwt(), idEstudiante)) {
            throw new AccessDeniedException("El apoderado no está autorizado sobre el estudiante " + idEstudiante);
        }
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener apoderado por ID")
    @ApiResponse(responseCode = "404", description = "Apoderado no encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO','DOCENTE','INSPECTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ApoderadoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(apoderadoService.buscarPorId(id));
    }

    @Operation(summary = "Actualizar datos de un apoderado")
    @ApiResponse(responseCode = "404", description = "Apoderado no encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<ApoderadoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarApoderado request) {
        return ResponseEntity.ok(apoderadoService.actualizar(id, request));
    }

    /** id del usuario autenticado desde el JWT (claim sub en Authentication.details). */
    private Long idUsuarioDesdeJwt() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getDetails() == null) {
                throw new EntityNotFoundException("No se pudo determinar el usuario autenticado");
            }
            return Long.valueOf(auth.getDetails().toString());
        } catch (NumberFormatException ex) {
            throw new EntityNotFoundException("No se pudo determinar el usuario autenticado");
        }
    }
}
