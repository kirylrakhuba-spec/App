FROM node:18-alpine AS builder
RUN apk add --no-cache curl
WORKDIR /App

COPY package*.json ./

RUN npm install

COPY  . .

RUN npm run build

EXPOSE 3001

CMD sh -c "npm run db:migrate:docker && npm run start:dev"