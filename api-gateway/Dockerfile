# Dockerfile del API Gateway
# Construye la imagen del orquestador central que recibe todo el tráfico externo.
# Etapa 1 (builder): compila TypeScript a JavaScript.
# Etapa 2 (runner): imagen mínima de producción con solo los artefactos compilados.

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
EXPOSE 3000
CMD ["node", "dist/index.js"]
