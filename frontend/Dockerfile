# Stage 1: Build Angular
FROM node:20-alpine AS build
WORKDIR /app

# Deshabilitar SSL verification para ambientes con proxies corporativos
RUN npm config set strict-ssl false

# Instalar dependencias primero (aprovechar cache de Docker)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar fuentes y compilar
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Servir con Nginx
FROM nginx:alpine AS runtime

# Copiar build output (ruta generada por Angular 21)
COPY --from=build /app/dist/smartbook-frontend/browser /usr/share/nginx/html

# Configuracion de Nginx con soporte SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
