# Etapa 1: Construcción de Angular
FROM node:23-alpine3.20 AS build

WORKDIR /app

# Copiamos solo package.json y package-lock.json primero (para mejor caché)
COPY package*.json ./

RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos la app Angular en producción
RUN npm run build -- --configuration production --project RVIA-Front

# Etapa 2: Nginx para servir la app
FROM nginx:alpine AS runtime

# Copiamos el build generado
COPY --from=build /app/dist/rvia-front/browser /usr/share/nginx/html/rvia-front

# Configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
