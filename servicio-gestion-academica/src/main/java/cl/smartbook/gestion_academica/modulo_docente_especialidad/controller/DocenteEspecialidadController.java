package cl.smartbook.gestion_academica.modulo_docente_especialidad.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.gestion_academica.modulo_docente_especialidad.model.dto.DocenteEspecialidadesDTO;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.model.request.ActualizarEspecialidades;
import cl.smartbook.gestion_academica.modulo_docente_especialidad.service.DocenteEspecialidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Especialidades de docentes",
        description = "Materias (rubros) que cada docente está habilitado a dictar")
@RestController
@RequestMapping("/api/v1/docentes")
@RequiredArgsConstructor
public class DocenteEspecialidadController {

    private final DocenteEspecialidadService service;

    @Operation(summary = "Todas las especialidades agrupadas por docente (para filtrar al asignar)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping("/especialidades")
    public ResponseEntity<List<DocenteEspecialidadesDTO>> todas() {
        return ResponseEntity.ok(service.todas());
    }

    @Operation(summary = "Especialidades de un docente")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @GetMapping("/{idDocente}/especialidades")
    public ResponseEntity<List<String>> porDocente(@PathVariable Long idDocente) {
        return ResponseEntity.ok(service.listarPorDocente(idDocente));
    }

    @Operation(summary = "Reemplazar las especialidades de un docente")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR')")
    @PutMapping("/{idDocente}/especialidades")
    public ResponseEntity<List<String>> reemplazar(
            @PathVariable Long idDocente,
            @Valid @RequestBody ActualizarEspecialidades request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(service.reemplazar(idDocente, request.getMaterias(), authHeader));
    }
}
