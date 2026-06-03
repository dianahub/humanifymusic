FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && \
    cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
