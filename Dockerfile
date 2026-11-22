FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_AUTH_SERVER_PORT=8078
ARG NEXT_PUBLIC_APP_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_APP_SERVER_PORT=8079

ENV NEXT_PUBLIC_AUTH_SERVICE_URL=${NEXT_PUBLIC_AUTH_SERVICE_URL}
ENV NEXT_PUBLIC_AUTH_SERVER_PORT=${NEXT_PUBLIC_AUTH_SERVER_PORT}
ENV NEXT_PUBLIC_APP_SERVICE_URL=${NEXT_PUBLIC_APP_SERVICE_URL}
ENV NEXT_PUBLIC_APP_SERVER_PORT=${NEXT_PUBLIC_APP_SERVER_PORT}

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3030

CMD ["npm", "start"]