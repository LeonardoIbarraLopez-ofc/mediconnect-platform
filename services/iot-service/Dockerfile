# Dockerfile: IoT Service
# Servicio de telemetría. Requiere InfluxDB (series de tiempo) y broker MQTT.
# Debe tener acceso de red al broker MQTT y a Kafka.

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
EXPOSE 3005
CMD ["node", "dist/index.js"]
