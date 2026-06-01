# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# --- production (по умолчанию для docker compose) ---
FROM base AS build
ENV NODE_ENV=production
RUN npm run build

FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]

# --- разработка с HMR ---
# docker build --target dev -t frontend-dev ./frontend
# docker run -p 5173:5173 --network <сеть_backend> frontend-dev
FROM base AS dev
ENV VITE_API_PROXY_TARGET=http://backend:8080
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
