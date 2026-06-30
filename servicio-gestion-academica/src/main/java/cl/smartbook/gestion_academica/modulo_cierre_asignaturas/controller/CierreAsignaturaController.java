package cl.smartbook.gestion_academica.modulo_cierre_asignaturas.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.model.dto.EstadoCierreDTO;
import cl.smartbook.gestion_academica.modulo_cierre_asignaturas.service.CierreAsignaturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Cierre de Asignaturas", description = "Cierre/reapertura de asignaturas por periodo (bloquea edición de notas)")
@RestController
@RequestMapping("/api/v1/asignaturas")
@RequiredArgsConstructor
public class CierreAsignaturaController {

    private final CierreAsignaturaService cierreService;

    @Operation(summary = "Listar los periodos cerrados de una asignatura")
    @GetMapping("/{id}/cierres")
    public ResponseEntity<List<EstadoCierreDTO>> listarCierres(@PathVariable Long id) {
        return ResponseEntity.ok(cierreService.listarCierres(id));
    }

    @Operation(summary = "Estado de cierre de una asignatura en un periodo")
    @GetMapping("/{id}/cierre")
    public ResponseEntity<EstadoCierreDTO> estado(
            @PathVariable Long id,
            @RequestParam("periodo") Long idPeriodo) {
        return ResponseEntity.ok(cierreService.estado(id, idPeriodo));
    }

    @Operation(summary = "Cerrar una asignatura para un periodo (solo Director/Admin)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<EstadoCierreDTO> cerrar(
            @PathVariable Long id,
            @RequestParam("periodo") Long idPeriodo) {
        return ResponseEntity.ok(cierreService.cerrar(id, idPeriodo));
    }

    @Operation(summary = "Reabrir una asignatura para un periodo (solo Director/Admin)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PostMapping("/{id}/reabrir")
    public ResponseEntity<EstadoCierreDTO> reabrir(
            @PathVariable Long id,
            @RequestParam("periodo") Long idPeriodo) {
        return ResponseEntity.ok(cierreService.reabrir(id, idPeriodo));
    }
}
