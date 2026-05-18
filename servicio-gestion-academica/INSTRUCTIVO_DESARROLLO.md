# Instructivo de Desarrollo — Microservicio `gestion-academica`

> **SmartBook** — Sistema Integral de Gestión Estudiantil
> Colegio Bernardo O'Higgins · Proyecto de Título Duoc UC · Marzo 2026

Este documento es la guía oficial para levantar, desarrollar y dejar **listo para conectar al API Gateway** el microservicio `gestion-academica`. Cualquier integrante del equipo debería poder seguir estos pasos sin contexto adicional.

---

## 1. Resumen del microservicio

**Nombre:** `gestion-academica`
**Responsabilidad:** centralizar la gestión académica del colegio. Cubre 4 módulos del informe:

| Módulo | RF / Ref | Casos de uso (informe §5.2) |
|---|---|---|
| Gestión de Notas | RF01 | CU-NOT-01..07 |
| Gestión de Cursos | — | CU-CUR-01..09 |
| Bitácora de Asignaturas | RF03 | CU-BIT-01..08 |
| Objetivos de Aprendizaje | RF07 | CU-OBJ-01..08 |

**No es responsabilidad de este microservicio:**
- Autenticación / login / emisión de JWT → `autenticacion-service`
- Matrícula y datos personales del estudiante → `gestion-estudiantes-service`
- Anotaciones conductuales → `anotaciones-service`
- Mensajería, calendario, mural, reportes → microservicios dedicados

### Posición en la arquitectura

```
                    ┌──────────────────┐
   Angular SPA ───► │   API Gateway    │ ──► autenticacion-service   (login → JWT)
                    │   (Spring Cloud  │
                    │    Gateway o     │ ──► gestion-estudiantes
                    │    Kong)         │
                    │                  │ ──► gestion-academica  ◄── ESTE micro
                    │  - rate limit    │     (valida JWT como Resource Server)
                    │  - routing       │             │
                    │  - JWT verify    │             ▼
                    └──────────────────┘     ┌─────────────────┐
                                             │  PostgreSQL     │
                                             │  schema:        │
                                             │  academica      │
                                             └─────────────────┘
```

El api-gateway es el **único punto de entrada público**. El microservicio confía en que el gateway hizo un primer filtro, **pero igual revalida la firma del JWT** (defensa en profundidad).

---

## 2. Stack tecnológico fijado

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje | Java | **21 LTS** (Temurin) |
| Framework | Spring Boot | **3.4.x** (estable) |
| Web | Spring MVC (`spring-boot-starter-web`) | — |
| Persistencia | Spring Data JPA + Hibernate | — |
| BD | PostgreSQL | 15+ |
| Migraciones | Flyway | 10.x |
| Seguridad | Spring Security + OAuth2 Resource Server (JWT) | — |
| Validación | Jakarta Bean Validation | — |
| DTO ↔ Entity | MapStruct | 1.5.x |
| Boilerplate | Lombok | última estable |
| Documentación | springdoc-openapi (Swagger UI) | 2.6.x |
| Observabilidad | Spring Boot Actuator + Micrometer | — |
| Tests | JUnit 5 + Mockito + Testcontainers | — |

> ⚠️ El `pom.xml` actual tiene `spring-boot-starter-parent 4.0.6` que **no existe** como release estable y mezcla `webflux` + un inexistente `webmvc`. La sección 5 entrega el `pom.xml` saneado.

---

## 3. Prerrequisitos del entorno

Antes de levantar el servicio, asegúrate de tener instalado:

- **Java 21** (Temurin recomendado): `java -version` debe mostrar `21.x.x`.
- **Maven Wrapper**: ya viene en el repo (`./mvnw`). No instales Maven aparte.
- **Docker Desktop** (para PostgreSQL local + Testcontainers).
- **PostgreSQL client** opcional (`psql` o DBeaver) para inspeccionar datos.
- **Postman** o **Insomnia** para probar los endpoints.
- **IDE:** IntelliJ IDEA Community/Ultimate (recomendado) o VS Code con extensiones de Java.
- **Git** + acceso al repositorio (Bitbucket según informe §3.3).

Verificación rápida:

```bash
java -version       # 21.x.x
docker --version    # 24+
./mvnw -v           # 3.9+
```

---

## 4. Estructura de paquetes propuesta

Usamos arquitectura **feature-first** (un paquete por módulo) en vez de layer-first (un paquete por capa). Razón: cada módulo del microservicio cambia por separado y tiene su propio dueño en el equipo; agruparlos por feature reduce el acoplamiento y facilita extraer un módulo a otro microservicio en el futuro.

```
src/main/java/cl/smartbook/gestion_academica/
│
├── GestionAcademicaApplication.java
│
├── config/
│   ├── OpenApiConfig.java          # Swagger UI + esquema bearerAuth
│   ├── JpaAuditingConfig.java      # @CreatedDate / @LastModifiedDate
│   └── CorsConfig.java             # solo para dev; en prod lo hace el gateway
│
├── common/
│   ├── domain/BaseEntity.java      # id, createdAt, updatedAt, version
│   ├── error/ApiError.java         # payload uniforme de errores
│   ├── error/GlobalExceptionHandler.java
│   ├── error/exceptions/           # NotFoundException, ConflictException, ...
│   └── audit/AuditorAwareImpl.java # toma el sub del JWT como autor
│
├── security/
│   ├── SecurityConfig.java         # SecurityFilterChain
│   ├── JwtAuthConverter.java       # roles claim → ROLE_xxx
│   └── Roles.java                  # constantes: DOCENTE, INSPECTOR, ...
│
├── notas/                          # ───── RF01: Gestión de Notas
│   ├── domain/Nota.java
│   ├── domain/Evaluacion.java
│   ├── repository/NotaRepository.java
│   ├── repository/EvaluacionRepository.java
│   ├── service/NotaService.java
│   ├── service/PromedioCalculator.java
│   ├── controller/NotaController.java
│   ├── dto/NotaCreateDTO.java
│   ├── dto/NotaResponseDTO.java
│   └── mapper/NotaMapper.java       # MapStruct
│
├── cursos/                         # ───── Gestión de Cursos
│   ├── domain/Curso.java
│   ├── domain/Asignatura.java
│   ├── domain/Nivel.java
│   ├── domain/Periodo.java
│   ├── repository/...
│   ├── service/...
│   ├── controller/CursoController.java
│   ├── dto/...
│   └── mapper/...
│
├── bitacora/                       # ───── RF03: Bitácora de Asignaturas
│   ├── domain/BitacoraAsignatura.java
│   ├── repository/...
│   ├── service/...
│   ├── controller/BitacoraController.java
│   ├── dto/...
│   └── mapper/...
│
└── objetivos/                      # ───── RF07: Objetivos de Aprendizaje
    ├── domain/ObjetivoAprendizaje.java
    ├── repository/...
    ├── service/...
    ├── controller/ObjetivoController.java
    ├── dto/...
    └── mapper/...
```

**Reglas de cruce entre paquetes:**
- `notas` puede leer `cursos` (necesita validar que la asignatura/curso existe), pero **nunca al revés**.
- `bitacora` puede leer `cursos` y `objetivos`.
- `objetivos` solo conoce `cursos` (relaciona con asignaturas).
- Si un módulo necesita mucho otro, evaluar si están en el lugar correcto.

---

## 5. `pom.xml` saneado (referencia)

Reemplaza el `pom.xml` actual por este:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
        <relativePath/>
    </parent>

    <groupId>cl.smartbook</groupId>
    <artifactId>gestion-academica</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>gestion-academica</name>
    <description>SmartBook - Microservicio de Gestion Academica</description>

    <properties>
        <java.version>21</java.version>
        <mapstruct.version>1.6.3</mapstruct.version>
        <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
        <springdoc.version>2.6.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Web (MVC, NO WebFlux) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Persistencia -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- Validación -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Seguridad: Resource Server JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>

        <!-- Observabilidad -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- OpenAPI / Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>${springdoc.version}</version>
        </dependency>

        <!-- DTO ↔ Entity -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Devtools (solo dev) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>testcontainers-bom</artifactId>
                <version>1.20.4</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok-mapstruct-binding</artifactId>
                            <version>${lombok-mapstruct-binding.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 6. Configuración (`application.yml`)

Renombra `src/main/resources/application.properties` a `application.yml` y deja:

```yaml
spring:
  application:
    name: gestion-academica

  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/smartbook_academica}
    username: ${DB_USERNAME:smartbook}
    password: ${DB_PASSWORD:smartbook}
    hikari:
      maximum-pool-size: 10

  jpa:
    hibernate:
      ddl-auto: validate           # Flyway gobierna el esquema
    properties:
      hibernate:
        jdbc.time_zone: America/Santiago
        format_sql: true
    open-in-view: false             # buena práctica: cerrar sesión al salir del controller

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  security:
    oauth2:
      resourceserver:
        jwt:
          # Modo simple: el autenticacion-service publica un JWKS
          jwk-set-uri: ${AUTH_JWK_URI:http://autenticacion-service:8081/.well-known/jwks.json}
          # Alternativa (HMAC con secreto compartido) si auth NO usa firmas asimétricas:
          # secret-key: ${JWT_SECRET}

server:
  port: 8082
  forward-headers-strategy: framework   # respeta X-Forwarded-* del gateway

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      probes:
        enabled: true                   # liveness/readiness para Kubernetes
      show-details: when-authorized

springdoc:
  swagger-ui:
    path: /docs
    oauth:
      use-pkce-with-authorization-code-grant: true
  api-docs:
    path: /v3/api-docs

logging:
  pattern:
    level: "%5p [%X{traceId:-} ${spring.application.name}]"
  level:
    root: INFO
    cl.smartbook: DEBUG

---
spring:
  config:
    activate:
      on-profile: prod
  jpa:
    properties:
      hibernate:
        format_sql: false
logging:
  level:
    root: WARN
    cl.smartbook: INFO
```

> 📋 **Mapa de puertos sugerido para todo el ecosistema** (acordar con el equipo):
> - `8080` api-gateway
> - `8081` autenticacion-service
> - `8082` **gestion-academica**  ← este
> - `8083` gestion-estudiantes
> - `8084` anotaciones
> - `8085` mensajeria
> - `8086` vida-estudiante
> - `8087` eventos-calendario
> - `8088` reportes

---

## 7. Integración con API Gateway (Resource Server JWT)

> **Esta es la sección más importante para "dejarlo listo para conexión con el api-gateway".**

### 7.1 Roles en el ecosistema

| Rol | Quién | Función |
|---|---|---|
| **Authorization Server** | `autenticacion-service` | Autentica usuarios y emite JWT firmados |
| **API Gateway** | Spring Cloud Gateway / Kong | Verifica firma + enruta + reenvía el JWT al downstream |
| **Resource Server** | **`gestion-academica`** (este) | Revalida firma + autoriza por rol/scope |
| **Cliente** | Angular SPA | Adjunta `Authorization: Bearer <jwt>` en cada request |

El microservicio **NO emite tokens**. **NO valida contraseñas**. **NO maneja login/logout**. Esas responsabilidades son del `autenticacion-service`.

### 7.2 Claims esperados en el JWT (contrato con `autenticacion-service`)

Acordar con el equipo de Auth que el JWT incluye, como mínimo:

```json
{
  "iss": "https://auth.smartbook.cl",
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // id del usuario
  "iat": 1716000000,
  "exp": 1716003600,
  "roles": ["DOCENTE"],                             // o ["INSPECTOR","DOCENTE"]
  "rut": "12345678-9",
  "nombre": "Juan Pérez",
  "est_id": null                                    // solo para apoderados: id del estudiante asociado
}
```

### 7.3 `SecurityConfig.java`

```java
package cl.smartbook.gestion_academica.config;

import cl.smartbook.gestion_academica.security.JwtAuthConverter;
import cl.smartbook.gestion_academica.security.Roles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;

    public SecurityConfig(JwtAuthConverter jwtAuthConverter) {
        this.jwtAuthConverter = jwtAuthConverter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())   // API stateless
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Públicos (el gateway los puede dejar pasar sin token también)
                .requestMatchers(
                    "/actuator/health/**",
                    "/actuator/info",
                    "/v3/api-docs/**",
                    "/docs/**",
                    "/swagger-ui/**"
                ).permitAll()

                // Lectura de catálogos (cualquier autenticado del colegio)
                .requestMatchers("GET", "/api/v1/cursos/**").authenticated()
                .requestMatchers("GET", "/api/v1/objetivos/**").authenticated()

                // Bitácora: solo docentes la registran
                .requestMatchers("POST", "/api/v1/bitacora/**")
                    .hasRole(Roles.DOCENTE)

                // Notas: alta/edición solo docentes
                .requestMatchers("POST", "/api/v1/notas/**")
                    .hasRole(Roles.DOCENTE)
                .requestMatchers("PUT", "/api/v1/notas/**")
                    .hasRole(Roles.DOCENTE)

                // Cierre de periodo: administrativo o director
                .requestMatchers("POST", "/api/v1/notas/periodos/*/cerrar")
                    .hasAnyRole(Roles.ADMINISTRATIVO, Roles.DIRECTOR)

                // Default: requiere auth
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
            );

        return http.build();
    }
}
```

### 7.4 `JwtAuthConverter.java`

Mapea el claim `roles` del JWT a `GrantedAuthority` con prefijo `ROLE_` (lo que requiere `hasRole(...)`).

```java
package cl.smartbook.gestion_academica.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String CLAIM_ROLES = "roles";
    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter scopeConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
                scopeConverter.convert(jwt).stream(),
                extractRoles(jwt).stream()
        ).collect(Collectors.toSet());

        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }

    private List<GrantedAuthority> extractRoles(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList(CLAIM_ROLES);
        if (roles == null) return List.of();
        return roles.stream()
                .filter(Objects::nonNull)
                .map(r -> new SimpleGrantedAuthority(ROLE_PREFIX + r.toUpperCase()))
                .collect(Collectors.toList());
    }
}
```

### 7.5 Constantes de roles

```java
package cl.smartbook.gestion_academica.security;

public final class Roles {
    public static final String ADMINISTRADOR  = "ADMINISTRADOR";
    public static final String DIRECTOR        = "DIRECTOR";
    public static final String DOCENTE         = "DOCENTE";
    public static final String INSPECTOR       = "INSPECTOR";
    public static final String ADMINISTRATIVO  = "ADMINISTRATIVO";
    public static final String APODERADO       = "APODERADO";
    public static final String ESTUDIANTE      = "ESTUDIANTE";

    private Roles() {}
}
```

### 7.6 Uso en controllers

```java
@RestController
@RequestMapping("/api/v1/notas")
public class NotaController {

    @PostMapping
    @PreAuthorize("hasRole('DOCENTE')")
    public ResponseEntity<NotaResponseDTO> crear(
            @Valid @RequestBody NotaCreateDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        UUID docenteId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(201).body(notaService.crear(dto, docenteId));
    }

    @GetMapping("/estudiante/{id}")
    @PreAuthorize("hasAnyRole('DOCENTE','APODERADO','ESTUDIANTE','DIRECTOR')")
    public List<NotaResponseDTO> porEstudiante(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        // si es APODERADO, validar que el estudiante consultado está bajo su tutela
        return notaService.porEstudiante(id, jwt);
    }
}
```

### 7.7 Flujo completo del request

```
1. Usuario hace login en autenticacion-service ──► recibe JWT
2. Frontend Angular guarda el JWT
3. Frontend hace: GET /api/v1/academica/cursos
   Header: Authorization: Bearer eyJhbGciOi...
4. API Gateway:
   - verifica firma del JWT (puede consultar JWKS del auth-service)
   - verifica que la ruta /api/v1/academica/** mapea a gestion-academica:8082
   - reenvía el request CON el header Authorization intacto
   - agrega X-Correlation-Id para trazabilidad
5. gestion-academica:
   - el filtro de Resource Server REVALIDA la firma (defensa en profundidad)
   - JwtAuthConverter mapea roles → GrantedAuthority
   - @PreAuthorize en el método decide si autoriza
   - si todo OK → ejecuta y retorna
6. Respuesta vuelve por el gateway al cliente
```

> 🔑 **Importante:** el gateway NO debe quitar el header `Authorization`. Si lo elimina, este microservicio rechazará el request con 401.

---

## 8. Migraciones con Flyway

Crea el directorio `src/main/resources/db/migration/` y dentro este archivo inicial:

**`V1__init_academica.sql`**

```sql
-- =========================
-- Tablas de catálogos
-- =========================
CREATE TABLE IF NOT EXISTS nivel (
    id           UUID PRIMARY KEY,
    nombre       VARCHAR(50)  NOT NULL UNIQUE,
    orden        SMALLINT     NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS periodo (
    id            UUID PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL,
    anio          INTEGER      NOT NULL,
    fecha_inicio  DATE         NOT NULL,
    fecha_termino DATE         NOT NULL,
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (nombre, anio)
);

-- =========================
-- Cursos y asignaturas
-- =========================
CREATE TABLE IF NOT EXISTS curso (
    id              UUID PRIMARY KEY,
    nombre          VARCHAR(80)  NOT NULL,
    nivel_id        UUID NOT NULL REFERENCES nivel(id),
    seccion         VARCHAR(10)  NOT NULL,
    cupo_maximo     SMALLINT     NOT NULL CHECK (cupo_maximo > 0),
    docente_jefe_id UUID,                          -- viene de auth/usuarios; sin FK cross-service
    anio            INTEGER      NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (nombre, seccion, anio)
);
CREATE INDEX idx_curso_nivel ON curso(nivel_id);
CREATE INDEX idx_curso_anio  ON curso(anio);

CREATE TABLE IF NOT EXISTS asignatura (
    id           UUID PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    codigo       VARCHAR(20)  NOT NULL UNIQUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_asignatura (
    curso_id      UUID NOT NULL REFERENCES curso(id) ON DELETE CASCADE,
    asignatura_id UUID NOT NULL REFERENCES asignatura(id),
    docente_id    UUID NOT NULL,                    -- id de usuario en auth
    horas_semana  SMALLINT NOT NULL CHECK (horas_semana > 0),
    PRIMARY KEY (curso_id, asignatura_id)
);

-- =========================
-- Objetivos de aprendizaje (RF07)
-- =========================
CREATE TABLE IF NOT EXISTS objetivo_aprendizaje (
    id            UUID PRIMARY KEY,
    codigo        VARCHAR(20)  NOT NULL UNIQUE,
    descripcion   TEXT         NOT NULL,
    nivel_id      UUID         NOT NULL REFERENCES nivel(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS objetivo_asignatura (
    objetivo_id   UUID NOT NULL REFERENCES objetivo_aprendizaje(id) ON DELETE CASCADE,
    asignatura_id UUID NOT NULL REFERENCES asignatura(id),
    PRIMARY KEY (objetivo_id, asignatura_id)
);

-- =========================
-- Bitácora de asignaturas (RF03)
-- =========================
CREATE TABLE IF NOT EXISTS bitacora_asignatura (
    id              UUID PRIMARY KEY,
    curso_id        UUID NOT NULL REFERENCES curso(id),
    asignatura_id   UUID NOT NULL REFERENCES asignatura(id),
    docente_id      UUID NOT NULL,
    fecha           DATE NOT NULL,
    contenido       TEXT NOT NULL,
    observaciones   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bitacora_fecha ON bitacora_asignatura(fecha DESC);
CREATE INDEX idx_bitacora_curso_asig ON bitacora_asignatura(curso_id, asignatura_id);

CREATE TABLE IF NOT EXISTS bitacora_objetivo (
    bitacora_id   UUID NOT NULL REFERENCES bitacora_asignatura(id) ON DELETE CASCADE,
    objetivo_id   UUID NOT NULL REFERENCES objetivo_aprendizaje(id),
    PRIMARY KEY (bitacora_id, objetivo_id)
);

-- =========================
-- Notas (RF01)
-- =========================
CREATE TABLE IF NOT EXISTS evaluacion (
    id            UUID PRIMARY KEY,
    curso_id      UUID NOT NULL REFERENCES curso(id),
    asignatura_id UUID NOT NULL REFERENCES asignatura(id),
    periodo_id    UUID NOT NULL REFERENCES periodo(id),
    nombre        VARCHAR(100) NOT NULL,
    fecha         DATE NOT NULL,
    ponderacion   NUMERIC(5,2) NOT NULL CHECK (ponderacion > 0 AND ponderacion <= 100),
    cerrada       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_evaluacion_curso ON evaluacion(curso_id, asignatura_id, periodo_id);

CREATE TABLE IF NOT EXISTS nota (
    id             UUID PRIMARY KEY,
    evaluacion_id  UUID NOT NULL REFERENCES evaluacion(id) ON DELETE CASCADE,
    estudiante_id  UUID NOT NULL,                          -- viene de gestion-estudiantes
    valor          NUMERIC(3,1) NOT NULL CHECK (valor BETWEEN 1.0 AND 7.0),
    observacion    TEXT,
    registrada_por UUID NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (evaluacion_id, estudiante_id)
);
CREATE INDEX idx_nota_estudiante ON nota(estudiante_id);
```

> 📌 **Convención de migraciones:**
> - `V<n>__<descripcion>.sql` para cambios productivos
> - `R__<descripcion>.sql` para vistas/funciones repetibles
> - **NUNCA** se modifica una migración ya aplicada en otro entorno; se crea una `V(n+1)` con el cambio
> - Hibernate `ddl-auto: validate` falla si una columna del modelo no existe en BD → fuerza al equipo a hacer la migración

---

## 9. Convenciones de API REST

| Tema | Regla |
|---|---|
| Versionado | Prefijo `/api/v1/` en todas las rutas |
| Recursos | Plural en kebab-case: `/api/v1/objetivos-aprendizaje` |
| Subrecursos | `/api/v1/cursos/{id}/asignaturas` |
| Crear | `POST` → 201 Created + `Location` header |
| Listar | `GET` → 200 + cuerpo paginado |
| Detalle | `GET /{id}` → 200 o 404 |
| Modificar total | `PUT` → 200 |
| Modificar parcial | `PATCH` → 200 |
| Eliminar | `DELETE` → 204 No Content |
| Errores cliente | 400 / 401 / 403 / 404 / 409 / 422 |
| Errores servidor | 500 (raros y observables) |
| Paginación | `?page=0&size=20&sort=fecha,desc` (Spring Pageable) |
| Fechas | ISO-8601 (`OffsetDateTime`) |
| IDs | `UUID` v4 |

**Formato uniforme de error** (`ApiError`):

```json
{
  "timestamp": "2026-04-24T12:34:56-04:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "code": "NOTA_FUERA_DE_RANGO",
  "message": "La nota debe estar entre 1.0 y 7.0",
  "path": "/api/v1/notas",
  "traceId": "5ad2a3..."
}
```

**`GlobalExceptionHandler` esqueleto:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        // construir ApiError con 400 y detalles por campo
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest req) { /* 404 */ }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex, HttpServletRequest req) { /* 409 */ }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleForbidden(AccessDeniedException ex, HttpServletRequest req) { /* 403 */ }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) { /* 500 + log */ }
}
```

---

## 10. Endpoints mínimos por módulo

### 10.1 Cursos

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/v1/cursos` | autenticado | Listar cursos paginados |
| GET | `/api/v1/cursos/{id}` | autenticado | Detalle |
| POST | `/api/v1/cursos` | ADMINISTRATIVO, DIRECTOR | Crear curso (CU-CUR-01) |
| PUT | `/api/v1/cursos/{id}` | ADMINISTRATIVO | Editar (CU-CUR-02) |
| DELETE | `/api/v1/cursos/{id}` | ADMINISTRATIVO | Baja lógica (CU-CUR-03) |
| POST | `/api/v1/cursos/{id}/docente-jefe` | ADMINISTRATIVO, DIRECTOR | Asignar jefatura (CU-CUR-04) |
| POST | `/api/v1/cursos/{id}/asignaturas` | ADMINISTRATIVO | Asignar asignatura (CU-CUR-05) |
| POST | `/api/v1/cursos/{id}/horario` | ADMINISTRATIVO | Definir horario (CU-CUR-07) |

### 10.2 Notas (RF01)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/v1/evaluaciones` | DOCENTE | Crear evaluación (CU-NOT-04) |
| POST | `/api/v1/notas` | DOCENTE | Registrar nota (CU-NOT-01) |
| PUT | `/api/v1/notas/{id}` | DOCENTE | Modificar (CU-NOT-02, dentro de plazo) |
| GET | `/api/v1/notas/estudiante/{id}` | DOCENTE, APODERADO, ESTUDIANTE, DIRECTOR | Ver notas (CU-NOT-05) |
| GET | `/api/v1/notas/curso/{cursoId}/promedio` | DOCENTE, DIRECTOR | Promedios calculados (CU-NOT-03) |
| POST | `/api/v1/periodos/{id}/cerrar` | ADMINISTRATIVO, DIRECTOR | Cerrar periodo (CU-NOT-07) |

### 10.3 Bitácora (RF03)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/v1/bitacora` | DOCENTE | Registrar clase (CU-BIT-01) |
| PUT | `/api/v1/bitacora/{id}` | DOCENTE | Editar (CU-BIT-06, dentro de 48h) |
| GET | `/api/v1/bitacora` | DOCENTE, DIRECTOR, ADMINISTRATIVO | Listar (CU-BIT-07) |
| GET | `/api/v1/bitacora/cobertura` | DIRECTOR, ADMINISTRATIVO | Reporte cobertura (CU-BIT-08) |

### 10.4 Objetivos de Aprendizaje (RF07)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/v1/objetivos` | ADMINISTRATIVO | Crear (CU-OBJ-01) |
| PUT | `/api/v1/objetivos/{id}` | ADMINISTRATIVO | Editar (CU-OBJ-02) |
| DELETE | `/api/v1/objetivos/{id}` | ADMINISTRATIVO | Eliminar (CU-OBJ-03) |
| GET | `/api/v1/objetivos` | autenticado | Listar |
| GET | `/api/v1/objetivos/asignatura/{id}` | autenticado | Por asignatura (CU-OBJ-06) |
| GET | `/api/v1/objetivos/avance/curso/{id}` | DOCENTE, DIRECTOR | Visualizar avance (CU-OBJ-07) |

---

## 11. OpenAPI / Swagger UI

`OpenApiConfig.java`:

```java
package cl.smartbook.gestion_academica.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartbookOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
            .info(new Info()
                .title("SmartBook · Gestión Académica API")
                .description("Microservicio de gestión académica (Notas, Cursos, Bitácora, Objetivos)")
                .version("v1")
                .license(new License().name("Proyecto académico Duoc UC").url("https://duoc.cl")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

Anota tus controllers para que Swagger se vea bien:

```java
@Tag(name = "Notas", description = "Gestión de calificaciones (RF01)")
@RestController
@RequestMapping("/api/v1/notas")
public class NotaController {

    @Operation(summary = "Registrar nota", description = "Solo docentes")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Creada"),
        @ApiResponse(responseCode = "422", description = "Nota fuera de escala"),
        @ApiResponse(responseCode = "403", description = "Sin permisos")
    })
    @PostMapping
    public ResponseEntity<NotaResponseDTO> crear(@Valid @RequestBody NotaCreateDTO dto) { ... }
}
```

URL local: **http://localhost:8082/docs**

---

## 12. Testing

### 12.1 Pirámide de tests

```
        /\
       /  \   E2E (pocos, vía Postman/Newman contra entorno staging)
      /----\
     /      \  Integration tests (Spring Boot + Testcontainers)
    /--------\
   /          \ Unit tests (JUnit 5 + Mockito) ← la mayoría
  /____________\
```

### 12.2 Unit test ejemplo: `PromedioCalculator`

```java
class PromedioCalculatorTest {

    private final PromedioCalculator calc = new PromedioCalculator();

    @Test
    void promedioPonderadoCorrecto() {
        // dado: 3 notas con ponderaciones 30/30/40
        var notas = List.of(
            new NotaPonderada(BigDecimal.valueOf(6.0), 30),
            new NotaPonderada(BigDecimal.valueOf(5.0), 30),
            new NotaPonderada(BigDecimal.valueOf(7.0), 40)
        );

        var promedio = calc.calcular(notas);

        assertThat(promedio).isEqualByComparingTo("6.1");
    }

    @Test
    void rechazaPonderacionMayorA100() {
        var notas = List.of(new NotaPonderada(BigDecimal.valueOf(6.0), 60),
                            new NotaPonderada(BigDecimal.valueOf(5.0), 60));
        assertThatThrownBy(() -> calc.calcular(notas))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
```

### 12.3 Integration test con Testcontainers

```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class NotaControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("smartbook_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void getNotasSinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/v1/notas/estudiante/{id}", UUID.randomUUID()))
           .andExpect(status().isUnauthorized());
    }

    @Test
    void postNotaConDocenteDevuelve201() throws Exception {
        mvc.perform(post("/api/v1/notas")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_DOCENTE")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "evaluacionId":"...", "estudianteId":"...", "valor":6.5 }
                """))
           .andExpect(status().isCreated());
    }
}
```

### 12.4 Comandos útiles

```bash
./mvnw test                       # solo unit tests
./mvnw verify                     # incluye integration tests
./mvnw test -Dtest=NotaServiceTest
./mvnw clean verify -Pcoverage    # con JaCoCo (configurar plugin)
```

---

## 13. Cómo levantar el microservicio paso a paso

### 13.1 Levantar PostgreSQL local (Docker)

```bash
docker run -d \
  --name smartbook-postgres \
  -e POSTGRES_DB=smartbook_academica \
  -e POSTGRES_USER=smartbook \
  -e POSTGRES_PASSWORD=smartbook \
  -p 5432:5432 \
  -v smartbook-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine
```

### 13.2 Variables de entorno

Crea un archivo `.env` (no lo subas al repo) o expórtalas:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/smartbook_academica
export DB_USERNAME=smartbook
export DB_PASSWORD=smartbook
export AUTH_JWK_URI=http://localhost:8081/.well-known/jwks.json
```

### 13.3 Ejecutar

```bash
./mvnw spring-boot:run
```

Salida esperada (parcial):

```
... Flyway Community Edition ... migrating schema "public" to version "1 - init academica"
... Tomcat started on port(s): 8082 (http)
... Started GestionAcademicaApplication in 4.123 seconds
```

### 13.4 Verificar

```bash
curl http://localhost:8082/actuator/health
# {"status":"UP"}

curl http://localhost:8082/v3/api-docs | jq .info.title
# "SmartBook · Gestión Académica API"
```

Abre **http://localhost:8082/docs** en el navegador.

### 13.5 Smoke test extremo a extremo

1. Levanta `autenticacion-service` (o un mock JWT con `mkjwt`).
2. Hace login: `POST /auth/login` → recibes un JWT.
3. En Swagger UI, click en **Authorize** → pegar `Bearer <jwt>`.
4. Ejecuta `GET /api/v1/cursos` → 200 con lista vacía o seed data.

---

## 14. Dockerfile y preparación para despliegue

**`Dockerfile`** (multi-stage, optimizado):

```dockerfile
# ---------- Etapa de build ----------
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline
COPY src ./src
RUN ./mvnw -B clean package -DskipTests \
    && mkdir -p target/extracted \
    && java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination target/extracted

# ---------- Etapa de runtime ----------
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app

COPY --from=build /workspace/target/extracted/dependencies/ ./
COPY --from=build /workspace/target/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/target/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/target/extracted/application/ ./

EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD wget -qO- http://localhost:8082/actuator/health/liveness || exit 1

ENTRYPOINT ["java","-XX:+UseZGC","-XX:+UseContainerSupport","org.springframework.boot.loader.launch.JarLauncher"]
```

**Build y run:**

```bash
docker build -t smartbook/gestion-academica:0.0.1-SNAPSHOT .
docker run --rm -p 8082:8082 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/smartbook_academica \
  -e DB_USERNAME=smartbook -e DB_PASSWORD=smartbook \
  -e AUTH_JWK_URI=http://host.docker.internal:8081/.well-known/jwks.json \
  smartbook/gestion-academica:0.0.1-SNAPSHOT
```

**Probes para Kubernetes** (alineado con informe §5.6):

```yaml
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8082 }
  initialDelaySeconds: 30
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8082 }
  initialDelaySeconds: 10
```

**`.dockerignore`** mínimo:

```
target/
.git/
.idea/
*.iml
.env
INSTRUCTIVO_DESARROLLO.md
HELP.md
```

---

## 15. Checklist final “listo para gateway”

Antes de declarar el microservicio listo para producción, verifica:

- [ ] `pom.xml` saneado (sin webflux, sin starters fantasmas) y `./mvnw clean verify` pasa
- [ ] `application.yml` con perfiles `dev` y `prod`
- [ ] Variables sensibles **fuera del repo** (validar con `git grep` que no hay `password=`)
- [ ] Flyway corriendo y migraciones aplicadas en PostgreSQL
- [ ] `SecurityConfig` con `oauth2ResourceServer.jwt()`
- [ ] `JwtAuthConverter` mapeando claim `roles` a `ROLE_xxx`
- [ ] Endpoints protegidos con `@PreAuthorize` por rol
- [ ] `GlobalExceptionHandler` activo con formato `ApiError` uniforme
- [ ] OpenAPI con esquema `bearerAuth` visible en `/docs`
- [ ] Actuator `/health/liveness` y `/health/readiness` respondiendo
- [ ] Logs estructurados con `traceId` y nombre de servicio
- [ ] Tests unitarios + de integración (Testcontainers) verdes
- [ ] Cobertura de tests acorde al estándar del equipo (≥ 70 %)
- [ ] `Dockerfile` construye y la imagen levanta
- [ ] `HEALTHCHECK` del contenedor funcionando
- [ ] Mapa de puertos acordado con el equipo (8082)
- [ ] Contrato de claims del JWT acordado con el equipo de Auth
- [ ] README del repo enlazando este instructivo
- [ ] Pipeline CI (Bitbucket / GitHub Actions) configurado: `mvnw verify` + build de imagen

Cuando todo esté ✅, el microservicio puede registrarse en el API Gateway con la regla:

```
Path: /api/v1/academica/**  →  http://gestion-academica:8082/api/v1/**
```

---

## 16. Próximos pasos sugeridos (fuera del alcance inicial)

- **Caché**: Spring Cache + Redis para listados de cursos y objetivos (alta lectura, baja escritura).
- **Idempotencia**: header `Idempotency-Key` en `POST /notas` para evitar dobles registros.
- **Eventos**: publicar eventos de dominio (`NotaRegistrada`, `EvaluacionCreada`) en RabbitMQ/Kafka para que `mensajeria-service` y `reportes-service` reaccionen sin acoplarse.
- **Logs centralizados**: stack ELK / Grafana Loki + Promtail.
- **Tracing distribuido**: OpenTelemetry + Jaeger (informe §5.6 lo menciona).
- **Métricas de negocio**: Micrometer + Prometheus (`notas_registradas_total`, `bitacoras_creadas_total`).
- **Auditoría avanzada**: Hibernate Envers para historial de cambios en `nota` y `bitacora_asignatura` (cumple §4.2.5 del informe — auditoría inalterable).
- **CI/CD**: pipeline en Bitbucket Pipelines + Coolify (informe §4.1) para auto-deploy a la VPS nacional.
- **API contracts**: publicar el OpenAPI spec en un repo `smartbook-contracts` para que frontend Angular y otros micros consuman tipos generados.

---

## Apéndice A · Referencias del informe

| Sección informe | Tema |
|---|---|
| §1.5 | Solución y centralización |
| §2.6.1 (RF01) | Gestión de Notas |
| §2.6.3 (RF03) | Bitácora de Asignaturas |
| §2.6.7 (RF07) | Objetivos de Aprendizaje |
| §3.3 | Stack tecnológico (tabla 25) |
| §4.2.1 | Roles RBAC |
| §4.2.4 | Spring Security + JWT |
| §5.2.2.3 | Especificación CU-BIT-* |
| §5.2.2.4 | Especificación CU-CUR-* |
| §5.2.2.5 | Especificación CU-OBJ-* |
| §5.2.2.14 | Especificación CU-NOT-* |
| §5.4 | Diagrama MERE |
| §5.5 | Diagrama de componentes |
| §5.6 | Diagrama de despliegue |

---

## Apéndice B · Convenciones de commits y ramas (sugerido)

- **Ramas**: `feature/notas-crud`, `fix/promedio-redondeo`, `chore/upgrade-spring-3.4.2`
- **Commits**: Conventional Commits → `feat(notas): registrar nota con validación 1.0-7.0`
- **PR template**: descripción + checklist + referencia a CU del informe (ej. “Cierra CU-NOT-01”)

---

> **Cualquier duda o discrepancia entre este instructivo y el informe SmartBook — gana el informe.** Si el informe necesita ajuste, abrir un issue antes de modificar este `.md`.
