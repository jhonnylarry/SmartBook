# Capa de API del frontend → backend

Todas las llamadas HTTP del frontend viven aquí (`core/api/*.service.ts`) y **pasan por el
api-gateway** en `http://localhost:5000/api/v1` (`environment.apiUrl`). El gateway valida el
JWT y **enruta a cada microservicio según el prefijo de la ruta**. Para saber "¿a dónde va
esta API?" basta mirar el prefijo:

| Archivo (servicio Angular) | Prefijo en el gateway | Microservicio | Puerto | Base de datos |
|---|---|---|---|---|
| `auth-api.service.ts` | `/auth` | servicio-auth | 5001 | smartbook_auth |
| `usuario-api.service.ts` | `/usuarios` | servicio-auth | 5001 | smartbook_auth |
| `estudiante-api.service.ts` | `/estudiantes` | gestion-estudiante | 5002 | smartbook_estudiante |
| `matricula-api.service.ts` | `/matriculas` | gestion-estudiante | 5002 | smartbook_estudiante |
| `apoderado-api.service.ts` | `/apoderados` | gestion-estudiante | 5002 | smartbook_estudiante |
| `curso-api.service.ts` | `/cursos` | gestion-academica | 5003 | smartbook_academica |
| `materia-api.service.ts` | `/materias` | gestion-academica | 5003 | smartbook_academica |
| `horario-api.service.ts` | `/horarios` | gestion-academica | 5003 | smartbook_academica |
| `academico-api.service.ts` | `/periodos` `/cursos` `/asignaturas` `/evaluaciones` `/notas` | gestion-academica | 5003 | smartbook_academica |
| `anotacion-api.service.ts` | `/anotaciones` · `/consulta-estudiante` | anotacion | 5004 | smartbook_anotacion |
| `vida-api.service.ts` | `/hojas-vida` · `/antecedentes-*` · `/documentos-adjuntos` | vida-estudiante | 5005 | smartbook_vida |
| `calendario-api.service.ts` | `/eventos` | servicio-calendario | 5006 | smartbook_calendario |
| `mensajeria-api.service.ts` | `/mensajes` | servicio-mensajeria | 5007 | smartbook_mensajeria |

> **reportes** (servicio-reportes · puerto 5008 · DB `smartbook_reportes`) todavía no tiene
> servicio Angular: su frontend está pendiente.

## Cómo leerlo al desarrollar
- Cada archivo arriba tiene un **encabezado** con su microservicio, puerto, DB y carpeta del
  backend. La URL exacta de cada endpoint está en cada método (`this.http.get(\`${...}/...\`)`).
- **Endpoints "self" (sin id en la URL):** `/me`, `/mias`, `/mi-boletin`… el backend resuelve
  la identidad **desde el JWT** (no se envía el id) → evita IDOR.
- **Endpoints `/hijo/{id}` (apoderado):** el backend verifica el vínculo apoderado↔estudiante
  antes de responder (anti-IDOR, *fail-closed*).
- **El token se agrega solo:** un HTTP interceptor pone el header
  `Authorization: Bearer <token>` en cada petición; estos servicios no lo hacen a mano.

## Si agregas o mueves endpoints
Mantén al día **este índice** y el **encabezado** del archivo afectado. La fuente de verdad de
la *implementación* es el código del microservicio; la del *contexto/arquitectura* es el vault
de Obsidian (`01-Microservicios/<servicio>.md` y `00-Arquitectura/`).
