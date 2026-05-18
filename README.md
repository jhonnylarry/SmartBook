# SmartBook — Sistema Integral de Gestión Estudiantil

> Proyecto de Título — Duoc UC 2026  
> Colegio Bernardo O'Higgins

SmartBook es una plataforma de gestión escolar basada en microservicios que centraliza la administración académica, conductual y comunicacional de un colegio. Permite gestionar estudiantes, matrículas, calificaciones, anotaciones, hojas de vida, calendario de eventos, mensajería interna y generación de reportes, todo a través de una interfaz web moderna y una API REST segura con JWT.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Angular (4200)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  API Gateway (5050)                          │
│              JWT · CORS · Ruteo centralizado                 │
└──┬───────┬────────┬────────┬────────┬───────┬────────┬──────┘
   │       │        │        │        │       │        │
 5001    5002     5003     5004     5005    5006    5007   5008
 Auth  Gestión  Gestión  Anota-   Vida   Calen-  Mensa-  Repo-
       Estud.  Académ.  ciones  Estud.  dario   jería   tes
   │       │        │        │        │
   └───────┴────────┴────────┴────────┘
                    │
         PostgreSQL 16 (5433)
         8 bases de datos independientes
```

### Microservicios

| Servicio | Puerto | Descripción | Base de datos |
|---|---|---|---|
| `api-gateway` | 5050 | Enrutamiento, autenticación JWT, CORS | — |
| `servicio-auth` | 5001 | Usuarios, roles y tokens JWT | `smartbook_auth` |
| `servicio-gestion-estudiante` | 5002 | Estudiantes y matrículas | `smartbook_estudiante` |
| `servicio-gestion-academica` | 5003 | Cursos, asignaturas, evaluaciones, notas, bitácora | `smartbook_academica` |
| `servicio-anotaciones` | 5004 | Anotaciones conductuales y resumen del estudiante | `smartbook_anotacion` |
| `servicio-vida-estudiante` | 5005 | Hoja de vida, antecedentes académicos, médicos y familiares | `smartbook_vida` |
| `servicio-calendario` | 5006 | Eventos institucionales | `smartbook_calendario` |
| `servicio-mensajeria` | 5007 | Mensajería interna entre usuarios | `smartbook_mensajeria` |
| `servicio-reportes` | 5008 | Generación y persistencia de reportes | `smartbook_reportes` |
| `frontend` | 4200 | SPA Angular servida con Nginx | — |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Java 21 · Spring Boot 3.4.1 · Spring Security · Spring Data JPA |
| Autenticación | JWT (jjwt 0.12.6) compartido entre todos los servicios |
| Comunicación inter-service | Spring WebFlux WebClient |
| Base de datos | PostgreSQL 16 |
| Frontend | Angular 19 · TypeScript |
| Servidor web | Nginx |
| Contenedores | Docker · Docker Compose |
| Documentación API | SpringDoc OpenAPI / Swagger UI |

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 4.x o superior
- Git

> No se necesita Java, Node ni PostgreSQL instalados localmente — todo corre en contenedores.

---

## Levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/jhonnylarry/SmartBook.git
cd SmartBook
```

### 2. Configurar variables de entorno (opcional)

Por defecto el proyecto usa valores de desarrollo. Para producción, crea un `.env` en la raíz:

```env
JWT_SECRET=tu-secreto-seguro-de-al-menos-32-caracteres-aqui
```

### 3. Levantar todos los servicios

```bash
docker compose up --build -d
```

El primer build tarda entre 5 y 10 minutos (descarga dependencias Maven y npm).

### 4. Verificar que todo esté corriendo

```bash
docker compose ps
```

Todos los contenedores deben mostrar `(healthy)` o `Up`.

### 5. Acceder a la aplicación

| Recurso | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API Gateway | http://localhost:5050 |
| Swagger Auth | http://localhost:5001/swagger-ui.html |
| Swagger Estudiantes | http://localhost:5002/swagger-ui.html |
| Swagger Académica | http://localhost:5003/swagger-ui.html |
| Swagger Anotaciones | http://localhost:5004/swagger-ui.html |
| Swagger Vida Estud. | http://localhost:5005/swagger-ui.html |
| Swagger Calendario | http://localhost:5006/swagger-ui.html |
| Swagger Mensajería | http://localhost:5007/swagger-ui.html |
| Swagger Reportes | http://localhost:5008/swagger-ui.html |

---

## Usuario de prueba

Al iniciar por primera vez, `servicio-auth` crea automáticamente un usuario administrador:

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | `ADMINISTRADOR` |
| Email | `admin@smartbook.cl` |

---

## API — Referencia rápida

### Autenticación

```bash
# Login
POST /api/v1/auth/login
{ "username": "admin", "password": "admin123" }

# Todos los demás endpoints requieren:
Authorization: Bearer <token>
```

### Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Iniciar sesión |
| `GET` | `/api/v1/auth/me` | Usuario autenticado |
| `GET/POST` | `/api/v1/estudiantes` | Listar / crear estudiantes |
| `GET/POST` | `/api/v1/matriculas` | Listar / matricular estudiantes |
| `GET/POST` | `/api/v1/cursos` | Listar / crear cursos |
| `GET/POST` | `/api/v1/asignaturas` | Listar / crear asignaturas |
| `GET/POST` | `/api/v1/evaluaciones` | Listar / crear evaluaciones |
| `GET/POST` | `/api/v1/notas` | Listar / registrar notas |
| `GET/POST` | `/api/v1/anotaciones` | Listar / crear anotaciones |
| `GET` | `/api/v1/consulta-estudiante/{id}/resumen` | Resumen conductual del estudiante |
| `GET/POST` | `/api/v1/hojas-vida` | Listar / crear hojas de vida |
| `GET/POST` | `/api/v1/eventos` | Listar / crear eventos del calendario |
| `GET/POST` | `/api/v1/mensajes` | Mensajería interna |
| `GET` | `/api/v1/reportes/notas/{idEstudiante}` | Reporte de notas |
| `GET` | `/api/v1/reportes/anotaciones/{idEstudiante}` | Reporte conductual |

### Roles disponibles

| Rol | Descripción |
|---|---|
| `ADMINISTRADOR` | Acceso total |
| `DIRECTOR` | Gestión académica y reportes |
| `DOCENTE` | Notas, bitácora y anotaciones |
| `INSPECTOR` | Anotaciones conductuales |
| `ADMINISTRATIVO` | Gestión de estudiantes y matrículas |

### Enums importantes

```
GravedadAnotacion → LEVE | GRAVE | MUY_GRAVE
TipoAnotacion     → POSITIVA | NEGATIVA | NEUTRAL
TipoEvento        → CLASE | EVALUACION | REUNION | FERIADO | OTRO
```

---

## Estructura del repositorio

```
SmartBook/
├── docker-compose.yml          # Orquestación de todos los servicios
├── init-db.sh                  # Script de inicialización de bases de datos
├── api-gateway/                # Spring Boot — enrutamiento y JWT
├── frontend/                   # Angular 19 + Nginx
├── servicio-auth/              # Usuarios y autenticación
├── servicio-gestion-estudiante/# Estudiantes y matrículas
├── servicio-gestion-academica/ # Cursos, asignaturas, notas
├── servicio-anotaciones/       # Anotaciones conductuales
├── servicio-vida-estudiante/   # Hoja de vida del estudiante
├── servicio-calendario/        # Eventos institucionales
├── servicio-mensajeria/        # Mensajería interna
└── servicio-reportes/          # Generación de reportes
```

Cada microservicio sigue la estructura estándar de Spring Boot:

```
servicio-xxx/
├── Dockerfile
├── pom.xml
└── src/
    └── main/
        ├── java/cl/smartbook/xxx/
        │   ├── config/         # Security, JWT, WebClient, OpenAPI
        │   ├── client/         # Clientes WebClient inter-service
        │   └── modulo_xxx/
        │       ├── controller/
        │       ├── service/
        │       ├── repository/
        │       └── model/
        └── resources/
            └── application.properties
```

---

## Comandos útiles

```bash
# Ver logs de un servicio
docker compose logs servicio-auth -f

# Reiniciar un servicio específico
docker compose restart servicio-mensajeria

# Detener todo
docker compose down

# Detener y eliminar volúmenes (borra las bases de datos)
docker compose down -v

# Reconstruir un servicio específico
docker compose build --no-cache servicio-gestion-academica
docker compose up -d servicio-gestion-academica
```

---

## Equipo de desarrollo

Proyecto de Título — Duoc UC, Sede Plaza Vespucio  
Carrera: Ingeniería en Informática  
Año: 2026
