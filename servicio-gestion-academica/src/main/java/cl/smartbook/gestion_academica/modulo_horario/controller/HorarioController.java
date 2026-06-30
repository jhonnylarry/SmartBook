package cl.smartbook.gestion_academica.modulo_horario.controller;

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

import cl.smartbook.gestion_academica.modulo_horario.model.dto.BloqueHorarioDTO;
import cl.smartbook.gestion_academica.modulo_horario.model.request.ActualizarBloqueHorario;
import cl.smartbook.gestion_academica.modulo_horario.model.request.AgregarBloqueHorario;
import cl.smartbook.gestion_academica.modulo_horario.service.HorarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Horarios", description = "Horario semanal de clases por asignatura, curso o docente")
@RestController
@RequestMapping("/api/v1/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

    @Operation(summary = "Bloques de horario de una asignatura")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<List<BloqueHorarioDTO>> porAsignatura(@PathVariable Long idAsignatura) {
        return ResponseEntity.ok(horarioService.listarPorAsignatura(idAsignatura));
    }

    @Operation(summary = "Horario semanal de un curso (todas sus asignaturas)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<BloqueHorarioDTO>> porCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(horarioService.listarPorCurso(idCurso));
    }

    @Operation(summary = "Horario semanal de un docente (sus asignaturas)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/docente/{idDocente}")
    public ResponseEntity<List<BloqueHorarioDTO>> porDocente(@PathVariable Long idDocente) {
        return ResponseEntity.ok(horarioService.listarPorDocente(idDocente));
    }

    @Operation(summary = "Crear bloque de horario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PostMapping
    public ResponseEntity<BloqueHorarioDTO> crear(@Valid @RequestBody AgregarBloqueHorario request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioService.crear(request));
    }

    @Operation(summary = "Actualizar bloque de horario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @PutMapping("/{id}")
    public ResponseEntity<BloqueHorarioDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarBloqueHorario request) {
        return ResponseEntity.ok(horarioService.actualizar(id, request));
    }

    @Operation(summary = "Eliminar bloque de horario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','ADMINISTRATIVO')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        horarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
