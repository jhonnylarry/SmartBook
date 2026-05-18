package cl.smartbook.auth.modulo_autenticacion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.smartbook.auth.modulo_autenticacion.model.dto.LoginResponse;
import cl.smartbook.auth.modulo_autenticacion.model.dto.UsuarioDto;
import cl.smartbook.auth.modulo_autenticacion.model.request.LoginRequest;
import cl.smartbook.auth.modulo_autenticacion.model.request.RegisterRequest;
import cl.smartbook.auth.modulo_autenticacion.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Autenticación", description = "Login, registro y datos del usuario autenticado")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Iniciar sesión y obtener JWT")
    @ApiResponse(responseCode = "200", description = "Autenticación exitosa")
    @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Registrar nuevo usuario y obtener JWT")
    @ApiResponse(responseCode = "201", description = "Usuario creado y token emitido")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o username/email duplicado")
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Obtener datos del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Datos del usuario")
    @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
    @GetMapping("/me")
    public ResponseEntity<UsuarioDto> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.obtenerActual(authentication.getName()));
    }
}
