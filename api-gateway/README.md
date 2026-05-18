# API Gateway — SmartBook

Punto único de entrada para el frontend Angular del proyecto SmartBook. Corre en el puerto **5000** y enruta las peticiones a los 8 microservicios downstream.

## Puerto

| Componente  | Puerto |
| ----------- | ------ |
| API Gateway | `5000` |

## Tabla de rutas

| Path predicate                                                                                                                                                                   | Servicio destino      | Puerto downstream |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------- |
| `/api/v1/auth/**`, `/api/v1/usuarios/**`                                                                                                                                         | `servicio-auth`       | 5001              |
| `/api/v1/estudiantes/**`, `/api/v1/matriculas/**`                                                                                                                                | `gestion-estudiante`  | 5002              |
| `/api/v1/cursos/**`, `/api/v1/asignaturas/**`, `/api/v1/evaluaciones/**`, `/api/v1/notas/**`                                                                                     | `gestion-academica`   | 5003              |
| `/api/v1/anotaciones/**`                                                                                                                                                         | `anotacion`           | 5004              |
| `/api/v1/hojas-vida/**`, `/api/v1/antecedentes-academicos/**`, `/api/v1/antecedentes-medicos/**`, `/api/v1/antecedentes-familiares/**`, `/api/v1/documentos-adjuntos/**`         | `vida-estudiante`     | 5005              |
| `/api/v1/eventos/**`                                                                                                                                                             | `servicio-calendario` | 5006              |
| `/api/v1/mensajes/**`                                                                                                                                                            | `servicio-mensajeria` | 5007              |
| `/api/v1/reportes/**`                                                                                                                                                            | `servicio-reportes`   | 5008              |

Las URLs downstream se externalizan con variables de entorno:
`AUTH_URL`, `ESTUDIANTE_URL`, `ACADEMICA_URL`, `ANOTACION_URL`, `VIDA_URL`, `CALENDARIO_URL`, `MENSAJERIA_URL`, `REPORTES_URL`.
Los defaults apuntan a `http://localhost:<puerto>` para desarrollo local.

## Variables de entorno

| Variable               | Default                  | Descripcion                                            |
| ---------------------- | ------------------------ | ------------------------------------------------------ |
| `SERVER_PORT`          | `5000`                   | Puerto del gateway                                     |
| `JWT_SECRET`           | _(valor de ejemplo)_     | Secreto HMAC-SHA256 compartido con todos los servicios |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200`  | Origenes permitidos (separados por coma)               |
| `AUTH_URL`             | `http://localhost:5001`  | URL base de servicio-auth                              |
| `ESTUDIANTE_URL`       | `http://localhost:5002`  | URL base de gestion-estudiante                         |
| `ACADEMICA_URL`        | `http://localhost:5003`  | URL base de gestion-academica                          |
| `ANOTACION_URL`        | `http://localhost:5004`  | URL base de anotacion                                  |
| `VIDA_URL`             | `http://localhost:5005`  | URL base de vida-estudiante                            |
| `CALENDARIO_URL`       | `http://localhost:5006`  | URL base de servicio-calendario                        |
| `MENSAJERIA_URL`       | `http://localhost:5007`  | URL base de servicio-mensajeria                        |
| `REPORTES_URL`         | `http://localhost:5008`  | URL base de servicio-reportes                          |

## Cómo arrancar en desarrollo

```bash
# Requiere Java 21 y Maven en el PATH (o usa el wrapper)
./mvnw spring-boot:run

# En Windows (PowerShell)
.\mvnw.cmd spring-boot:run
```

El gateway arranca en `http://localhost:5000`. Los servicios downstream deben estar corriendo en sus puertos canónicos.

## Cómo construir la imagen Docker

```bash
docker build -t smartbook/api-gateway:latest .

# Correr localmente (requiere que los servicios estén en la misma red Docker)
docker run -p 5000:5000 \
  -e JWT_SECRET=mi-secreto \
  -e AUTH_URL=http://servicio-auth:5001 \
  smartbook/api-gateway:latest
```

## Healthcheck

```bash
curl http://localhost:5000/actuator/health
```

## Notas de arquitectura

- **No incluye `spring-boot-starter-web`** (MVC/Tomcat). Spring Cloud Gateway es reactivo y corre sobre Netty via WebFlux. Mezclar ambos starters causa conflicto de servidor embebido.
- **CORS centralizado**: el frontend solo conoce `http://localhost:5000`. Los servicios downstream no configuran CORS porque nunca son llamados directamente.
- **Filtro JWT global**: el gateway valida el token antes de propagar la petición. Los servicios downstream también validan (defensa en profundidad). Los paths públicos (`/api/v1/auth/login`, `/api/v1/auth/register`, `/actuator/**`) se dejan pasar sin token.
- **Headers propagados al downstream**: `X-User-Id` (sub del JWT) y `X-User-Role` (claim `rol`), para que los servicios downstream puedan usarlos sin re-parsear el token.
