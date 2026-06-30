package cl.smartbook.vida_estudiante.modulo_vida_estudiante.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.dto.AntecedenteMedicoDTO;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.ActualizarAntecedenteMedico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.model.request.AgregarAntecedenteMedico;
import cl.smartbook.vida_estudiante.modulo_vida_estudiante.service.AntecedenteMedicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Antecedentes Medicos", description = "Gestion de antecedentes medicos del estudiante")
@RestController
@RequestMapping("/api/v1/antecedentes-medicos")
@RequiredArgsConstructor
public class AntecedenteMedicoController {

    private final AntecedenteMedicoService service;

    @Operation(summary = "Listar todos los antecedentes medicos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'INSPECTOR')")
    @GetMapping
    public ResponseEntity<List<AntecedenteMedicoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(summary = "Obtener antecedente medico por ID")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'INSPECTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<AntecedenteMedicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // DOCENTE NO accede directo a datos medicos de menores: lo hace via el agregador de perfil
    // (anotacion), que valida que el alumno sea de su curso y redacta. El agregador lee con
    // X-Internal-Token (ROLE_SERVICIO_INTERNO). Evita IDOR directo enumerando idHojaVida.
    @Operation(summary = "Listar antecedentes medicos por hoja de vida")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECTOR', 'INSPECTOR', 'SERVICIO_INTERNO')")
    @GetMapping("/hoja-vida/{idHojaVida}")
    public ResponseEntity<List<AntecedenteMedicoDTO>> listarPorHojaVida(@PathVariable Long idHojaVida) {
        return ResponseEntity.ok(service.listarPorHojaVida(idHojaVida));
    }

    @Operation(summary = "Crear antecedente medico")
    @ApiResponse(responseCode = "201", description = "Creado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<AntecedenteMedicoDTO> crear(@Valid @RequestBody AgregarAntecedenteMedico request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @Operation(summary = "Actualizar antecedente medico")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<AntecedenteMedicoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAntecedenteMedico request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @Operation(summary = "Eliminar antecedente medico")
    @ApiResponse(responseCode = "204", description = "Eliminado")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
