# SmartBook — Microservicio de Mensajería

Microservicio encargado de la comunicación interna entre los actores del sistema SmartBook (Docentes, Apoderados, Directivos, Inspectores y Administrativos) del Colegio Bernardo O'Higgins.

Proyecto de Título — Duoc UC, 2026.

---

## Stack

| Tecnología | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.5 |
| PostgreSQL | 18 |
| Maven | 3.x |
| Lombok | — |
| SpringDoc OpenAPI | 2.6.0 |

---

## Requisitos previos

- JDK 21
- Maven 3.x (o usar el wrapper `./mvnw`)
- PostgreSQL corriendo en `localhost:5432`

---

## Configuración

1. Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE smartbook_mensajeria;
```

2. Editar las credenciales en `src/main/resources/application.properties`:

```properties
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA
```

Las tablas se crean automáticamente al levantar el servicio (`ddl-auto=update`).

---

## Cómo ejecutar

```bash
./mvnw spring-boot:run
```

El servicio levanta en `http://localhost:8082`.

---

## Documentación de la API

Swagger UI disponible en:

```
http://localhost:8082/swagger-ui.html
```

---

## Endpoints

### Mensajes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/mensajes` | Enviar mensaje individual o masivo |
| GET | `/api/mensajes/recibidos/{usuarioId}` | Bandeja de entrada |
| GET | `/api/mensajes/enviados/{usuarioId}` | Mensajes enviados |
| GET | `/api/mensajes/{id}` | Detalle de un mensaje |
| PUT | `/api/mensajes/{mensajeId}/leer/{usuarioId}` | Marcar como leído |
| PUT | `/api/mensajes/{mensajeId}/archivar/{usuarioId}` | Archivar mensaje |
| GET | `/api/mensajes/buscar?usuarioId=&q=` | Buscar por texto |
| POST | `/api/mensajes/{mensajeId}/responder` | Responder mensaje |
| GET | `/api/mensajes/no-leidos/{usuarioId}` | Contar no leídos |

### Adjuntos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/mensajes/{mensajeId}/adjuntos` | Subir archivo adjunto |
| GET | `/api/mensajes/{mensajeId}/adjuntos` | Listar adjuntos |
| GET | `/api/mensajes/adjuntos/{adjuntoId}/descargar` | Descargar adjunto |

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notificaciones/{usuarioId}` | Listar notificaciones |
| PUT | `/api/notificaciones/{id}/enviada` | Marcar como enviada |
| GET | `/api/notificaciones/{usuarioId}/pendientes/count` | Contar pendientes |

---

## Estructura del proyecto

```
src/main/java/com/smartbook/mensajeria/
├── config/          # SecurityConfig, OpenApiConfig
├── controller/      # MensajeController, NotificacionController, AdjuntoController
├── dto/             # DTOs de request y response
├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
├── model/           # Entidades JPA
│   └── enums/       # TipoEnvio, Canal, EstadoNotificacion
├── repository/      # Interfaces Spring Data JPA
└── service/         # Interfaces e implementaciones de negocio
    └── impl/
```

---

## Casos de uso implementados

| ID | Descripción |
|----|-------------|
| CU-MSG-01 | Enviar mensaje (individual y masivo) |
| CU-MSG-02 | Recibir y visualizar mensajes |
| CU-MSG-03 | Responder mensaje |
| CU-MSG-04 | Notificación interna al destinatario |
| CU-MSG-05 | Archivar mensaje |
| CU-MSG-06 | Buscar mensajes por texto |

---

## Notas

- La seguridad JWT está preparada pero deshabilitada hasta que el microservicio de autenticación (`smartbook-auth`) esté disponible. Ver `SecurityConfig.java`.
- Este servicio se comunica con los demás microservicios vía REST.
- Puerto por defecto: **8082**.
