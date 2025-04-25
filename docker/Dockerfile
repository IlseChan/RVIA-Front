FROM node:23.6.0-alpine AS build

WORKDIR /app

COPY RVIA-Front/package.json RVIA-Front/package-lock.json ./

RUN npm ci

COPY RVIA-Front ./

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/rvia-front/browser /usr/share/nginx/html/rvia-front

COPY RVIA-Front/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]