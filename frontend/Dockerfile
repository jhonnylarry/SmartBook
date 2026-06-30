# Stage 1: Build Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero (caché de capas)
COPY package*.json ./

# Instalar dependencias (npm install: no requiere package-lock.json preexistente)
RUN npm install --no-audit --no-fund

# Copiar fuentes
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# Stage 2: Serve con nginx
FROM nginx:alpine AS production

# Eliminar config por defecto
RUN rm -rf /usr/share/nginx/html/* && rm -f /etc/nginx/conf.d/default.conf

# Copiar build (Angular 17+ output: dist/<name>/browser)
COPY --from=builder /app/dist/smartbook-frontend/browser /usr/share/nginx/html

# Copiar config nginx personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Usuario no-root (nginx en Alpine ya lo maneja)
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
