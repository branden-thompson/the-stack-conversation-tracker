# --- Dependencies layer (production dependencies)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Builder layer
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json ./
# Install all dependencies (including devDependencies) for building
RUN npm ci && npm cache clean --force
COPY . .
# If you use Next.js App Router, this produces a standalone server
RUN npm run build

# --- Runtime layer
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Expose app
EXPOSE 3000
# Start Next.js server produced by "standalone" output
CMD ["node", "server.js"]