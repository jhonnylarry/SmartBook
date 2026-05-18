package cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.controller;

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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.dto.BitacoraClaseDTO;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.ActualizarBitacoraClase;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.model.request.AgregarBitacoraClase;
import cl.smartbook.gestion_academica.modulo_bitacora_asignaturas.service.BitacoraClaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Bitacora de Clases",
     description = "Registro diario de clases impartidas (contenidos y objetivos cubiertos)")
@RestController
@RequestMapping("/api/v1/bitacora-clases")
@RequiredArgsConstructor
public class BitacoraClaseController {

    private final BitacoraClaseService bitacoraClaseService;

    @Operation(summary = "Listar todas las bitacoras")
    @GetMapping
    public ResponseEntity<List<BitacoraClaseDTO>> listar() {
        return ResponseEntity.ok(bitacoraClaseService.listar());
    }

    @Operation(summary = "Obtener bitacora por ID")
    @GetMapping("/{id}")
    public ResponseEntity<BitacoraClaseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(bitacoraClaseService.buscarPorId(id));
    }

    @Operation(summary = "Listar bitacoras de una asignatura")
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<List<BitacoraClaseDTO>> listarPorAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(bitacoraClaseService.listarPorAsignatura(idAsignatura));
    }

    @Operation(summary = "Registrar una clase impartida")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMINISTRADOR','DIRECTOR')")
    @PostMapping
    public ResponseEntity<BitacoraClaseDTO> crear(
            @Valid @RequestBody AgregarBitacoraClase request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bitacoraClaseService.crear(request, authHeader));
    }

    @Operation(summary = "Actualizar bitacora")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<BitacoraClaseDTO> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody ActualizarBitacoraClase request) {
        return ResponseEntity.ok(bitacoraClaseService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar bitacora")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bitacoraClaseService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
