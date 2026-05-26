# Dockerfile: Telemedicine Service
# Servicio WebRTC para videoconsultas cifradas. Requiere acceso a S3 y Kafka.
# En producción necesita variables de entorno para AWS y el servidor TURN.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3002
CMD ["node", "dist/index.js"]
