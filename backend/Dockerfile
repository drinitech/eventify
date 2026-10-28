# syntax=docker/dockerfile:1
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

# Dev mode (docker-compose.dev.yml bind-mounts the folder). Polling (-L) because file
# events from Windows bind mounts don't reach the container.
FROM base AS dev
RUN npm ci
COPY . .
CMD ["npx", "nodemon", "-L", "server.js"]

FROM base
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
