FROM node:18-alpine AS builder
RUN apk add --no-cache curl
WORKDIR /App
COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "run", "start:dev"]