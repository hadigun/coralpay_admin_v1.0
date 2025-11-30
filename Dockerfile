# Stage 1: Build the Next.js applications
FROM node:22.18.0-alpine as build

WORKDIR /app

COPY package.json pnpm.lock* ./

RUN pnpm install

COPY . /app

RUN pnpm build