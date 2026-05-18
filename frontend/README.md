# SmartBook Frontend

Frontend Angular para el Sistema de Digitalizacion del Libro de Clases.

**Proyecto:** Colegio Bernardo O'Higgins — Duoc UC
**Stack:** Angular 21, TypeScript 5.9, Tailwind CSS 4, Vitest

---

## Requisitos previos

- Node.js 20+
- npm 11+

---

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo en http://localhost:4200
npm start

# Build de produccion
npm run build

# Ejecutar tests unitarios (Vitest)
npm test

# Tests en modo watch
npm run test:watch

# Lint
npm run lint
```

---

## Estructura

```text
src/app/
  core/
    auth/         # AuthService (Signals), interceptores, guard, modelos
    interceptors/ # error.interceptor (401 -> logout, 403/5xx -> log)
  shared/
    layout/       # MainLayoutComponent (sidebar + topbar)
    components/   # LoadingComponent, EmptyStateComponent
    models/       # Interfaces de dominio (Estudiante, Nota, Anotacion...)
  features/
    login/        # LoginComponent + formulario reactivo
    register/     # RegisterComponent
    dashboard/    # DashboardComponent con KPIs
    estudiantes/  # CRUD completo (lista, detalle, formulario)
    anotaciones/  # Lista + formulario inline
    notas/        # Lista + formulario inline
    mensajes/     # Bandeja recibidos/enviados + redactar
    calendario/   # Lista de eventos + formulario inline
    reportes/     # Consultas a servicio-reportes
```

---

## Usuario seed (backend)

| Campo    | Valor         |
|----------|---------------|
| username | admin         |
| password | admin123      |
| rol      | ADMINISTRADOR |

---

## Variables de entorno

El frontend NO tiene credenciales de BD ni URLs internas de microservicios.
Solo conoce la URL del API Gateway:

| Entorno     | URL                                      |
|-------------|------------------------------------------|
| Development | `http://localhost:5000/api/v1`           |
| Production  | `/api/v1` (mismo origen via proxy nginx) |

Configuradas en `src/environments/environment.ts` y `environment.prod.ts`.

---

## Docker

### Build y ejecucion con Docker Compose

Desde la raiz del proyecto:

```bash
# Levantar toda la infraestructura + frontend
docker compose --profile frontend up -d --build

# Solo el frontend (requiere api-gateway corriendo)
docker compose --profile frontend up frontend --build
```

El frontend queda disponible en `http://localhost:4200`.

### Build manual

```bash
# Desde frontend/
docker build -t smartbook-frontend .
docker run -p 4200:80 smartbook-frontend
```

### Arquitectura de red Docker

- El frontend solo esta en `smartbook-net`.
- El browser hace fetch directamente a `http://localhost:5000` (gateway, puerto del host).
- El contenedor frontend NO puede alcanzar las BDs por nombre DNS interno.

---

## Seguridad

- JWT guardado en `localStorage` (alcance universitario).
- El frontend nunca recibe ni almacena passwords, claves de BD, ni URLs internas.
- `auth.interceptor.ts` agrega `Authorization: Bearer TOKEN` a todas las requests.
- `error.interceptor.ts` hace logout automatico ante respuestas 401.
- `authGuard` protege todas las rutas excepto `/login` y `/register`.

---

## Pendientes para produccion

- Mover JWT a cookies `httpOnly` + `Secure` (eliminar vulnerabilidad XSS en localStorage).
- Implementar refresh tokens (endpoint `/auth/refresh`).
- Agregar CSRF tokens si se migra a cookies.
- i18n con `@angular/localize` (hoy el texto esta hardcodeado en espanol).
- Tests E2E con Playwright o Cypress.
