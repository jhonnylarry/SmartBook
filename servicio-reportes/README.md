SmartBook — Microservicio de Reportes

Microservicio encargado de la generación, exportación y programación de reportes académicos del Colegio Bernardo O'Higgins.
Proyecto de Título — Duoc UC, 2026.

## Stack

| Tecnología | Versión |
|------------|---------|
| Java | 21 |
| Spring Boot | 3.3.5 |
| PostgreSQL | 18 |
| Maven | 3.x |
| Lombok | — |
| SpringDoc OpenAPI | 2.6.0 |
| OpenPDF | 1.3.30 |
| Apache POI | 5.3.0 |

## Requisitos previos

- JDK 21
- Maven 3.x (o usar el wrapper `./mvnw`)
- PostgreSQL corriendo en localhost:5432

## Configuración

Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE smartbook_reportes;
```

Editar las credenciales en `src/main/resources/application.properties`:
```properties
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA
```

Las tablas se crean automáticamente al levantar el servicio (`ddl-auto=update`).

## Cómo ejecutar

```bash
./mvnw spring-boot:run
```

El servicio levanta en http://localhost:8085.

## Documentación de la API

Swagger UI disponible en:
http://localhost:8085/swagger-ui.html

## Endpoints

### Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/reportes/academico | Generar reporte académico (notas y promedios) |
| POST | /api/reportes/asistencia | Generar reporte de asistencia por curso |
| POST | /api/reportes/conductual | Generar reporte de anotaciones conductuales |
| POST | /api/reportes/matricula | Generar reporte de matrícula por curso |
| GET | /api/reportes/{id}/exportar?formato=PDF | Descargar reporte en PDF o Excel |
| GET | /api/reportes/historial/{solicitanteId} | Historial paginado de reportes generados |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/dashboard/kpis?cursoId=&periodoId= | KPIs institucionales en tiempo real |

### Reportes Programados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/reportes/programados | Programar reporte automático periódico |
| GET | /api/reportes/programados/{directorId} | Listar reportes programados del director |
| DELETE | /api/reportes/programados/{id} | Desactivar reporte programado |

## Estructura del proyecto

```
src/main/java/com/smartbook/reportes/
├── client/          # Interfaces de clientes externos + stubs
│   └── stub/        # Implementaciones stub (client.stub.enabled=true)
├── config/          # SecurityConfig, OpenApiConfig, RestTemplateConfig
├── controller/      # ReporteController, DashboardController, ReporteProgramadoController
├── dto/             # DTOs de request, response y externos
│   ├── external/    # DTOs de respuesta de otros microservicios
│   ├── request/     # DTOs de entrada
│   └── response/    # DTOs de salida
├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
├── model/           # Entidades JPA
│   └── enums/       # TipoReporte, FormatoExportacion, EstadoReporte
├── repository/      # Interfaces Spring Data JPA
├── scheduler/       # ReporteScheduler (cron CU-REP-07)
├── service/         # Interfaces e implementaciones de negocio
│   └── impl/
└── util/            # ExportadorPDF, ExportadorExcel
```

## Casos de uso implementados

| ID | Descripción |
|----|-------------|
| CU-REP-01 | Generar reporte académico |
| CU-REP-02 | Generar reporte de asistencia |
| CU-REP-03 | Generar reporte conductual |
| CU-REP-04 | Generar reporte de matrícula |
| CU-REP-05 | Filtrar por periodo y curso |
| CU-REP-06 | Exportar reporte en PDF o Excel |
| CU-REP-07 | Programar reporte automático periódico |
| CU-REP-09 | Dashboard de KPIs institucionales |

## Notas

La seguridad JWT está preparada pero deshabilitada hasta que el microservicio de autenticación (smartbook-auth) esté disponible. Ver `SecurityConfig.java`.

Los clientes externos (`NotasClient`, `BitacoraClient`, `AnotacionesClient`, `MatriculaClient`, `EstudiantesClient`) usan implementaciones stub mientras los demás microservicios no estén disponibles. Para activar las llamadas HTTP reales, cambiar `client.stub.enabled=false` en `application.properties`.

Puerto por defecto: 8085.
