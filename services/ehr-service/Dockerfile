# Dockerfile: EHR Service
# Servicio de historial clínico. Requiere MongoDB, Kafka y acceso a la API del Ministerio.
# El Legacy Adapter (cobol-adapter.ts) hace requests HTTP al sistema COBOL del Ministerio.

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
EXPOSE 3003
CMD ["node", "dist/index.js"]
