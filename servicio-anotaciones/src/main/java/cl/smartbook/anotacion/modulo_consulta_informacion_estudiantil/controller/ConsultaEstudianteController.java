package cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.model.dto.ResumenEstudianteDTO;
import cl.smartbook.anotacion.modulo_consulta_informacion_estudiantil.service.ConsultaEstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Consulta Informacion Estudiantil",
     description = "Vista consolidada de la informacion conductual del estudiante")
@RestController
@RequestMapping("/api/v1/consulta-estudiante")
@RequiredArgsConstructor
public class ConsultaEstudianteController {

    private final ConsultaEstudianteService consultaEstudianteService;

    @Operation(summary = "Obtener resumen del estudiante (datos + anotaciones)")
    @ApiResponse(responseCode = "200", description = "Resumen obtenido")
    @ApiResponse(responseCode = "400", description = "Estudiante no existe")
    @ApiResponse(responseCode = "503", description = "Servicio externo no disponible")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DIRECTOR','DOCENTE','INSPECTOR','ADMINISTRATIVO')")
    @GetMapping("/{idEstudiante}/resumen")
    public ResponseEntity<ResumenEstudianteDTO> obtenerResumen(
            @PathVariable Long idEstudiante,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(consultaEstudianteService.obtenerResumen(idEstudiante, authHeader));
    }
}
