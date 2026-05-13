FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM base AS build
RUN npm run build

# Разработка с HMR: docker build --target dev -t frontend-dev . && docker run -p 5173:5173 --network <сеть_с_backend> frontend-dev
FROM base AS dev
ENV VITE_API_PROXY_TARGET=http://backend:8080
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
