package cl.smartbook.anotacion.modulo_gestion_anotaciones.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.dto.AnotacionDTO;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request.ActualizarAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.model.request.AgregarAnotacion;
import cl.smartbook.anotacion.modulo_gestion_anotaciones.service.AnotacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Anotaciones", description = "Gestion de anotaciones conductuales de estudiantes")
@RestController
@RequestMapping("/api/v1/anotaciones")
@RequiredArgsConstructor
public class AnotacionController {

    private final AnotacionService anotacionService;

    @Operation(summary = "Listar todas las anotaciones ordenadas por fecha descendente")
    @GetMapping
    public ResponseEntity<List<AnotacionDTO>> listar() {
        return ResponseEntity.ok(anotacionService.listar());
    }

    @Operation(summary = "Obtener anotacion por ID")
    @ApiResponse(responseCode = "404", description = "Anotacion no encontrada")
    @GetMapping("/{id}")
    public ResponseEntity<AnotacionDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anotacionService.buscarPorId(id));
    }

    @Operation(summary = "Listar anotaciones de un estudiante, ordenadas por fecha descendente")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'DOCENTE', 'INSPECTOR', 'ADMINISTRATIVO')")
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<AnotacionDTO>> listarPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(anotacionService.listarPorEstudiante(idEstudiante));
    }

    @PreAuthorize("hasAnyRole('DOCENTE','INSPECTOR','ADMINISTRADOR','DIRECTOR')")
    @Operation(summary = "Registrar nueva anotacion",
               description = "Valida idEstudiante en gestion-estudiante e idDocente (rol DOCENTE) en servicio-auth.")
    @ApiResponse(responseCode = "201", description = "Anotacion creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos o referencia inexistente")
    @ApiResponse(responseCode = "503", description = "Servicio externo no disponible")
    @PostMapping
    public ResponseEntity<AnotacionDTO> crear(
            @Valid @RequestBody AgregarAnotacion request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(anotacionService.crear(request, authHeader));
    }

    @PreAuthorize("hasAnyRole('DOCENTE','INSPECTOR','ADMINISTRADOR','DIRECTOR')")
    @Operation(summary = "Actualizar anotacion (campos opcionales)")
    @ApiResponse(responseCode = "404", description = "Anotacion no encontrada")
    @PutMapping("/{id}")
    public ResponseEntity<AnotacionDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAnotacion request) {
        return ResponseEntity.ok(anotacionService.actualizar(id, request));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar anotacion")
    @ApiResponse(responseCode = "204", description = "Anotacion eliminada")
    @ApiResponse(responseCode = "404", description = "Anotacion no encontrada")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        anotacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
