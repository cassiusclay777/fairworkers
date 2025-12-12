FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ .

# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Install pnpm and frontend dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend/ .

# Build frontend
RUN pnpm build

# Final production image
FROM node:18-alpine

WORKDIR /app

# Install ffmpeg for video thumbnail generation
RUN apk add --no-cache ffmpeg

# Install production dependencies only
COPY backend/package.json backend/pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy backend from builder
COPY --from=backend-builder /app ./

# Copy built frontend from builder
COPY --from=frontend-builder /app/dist ./public

# Create necessary directories
RUN mkdir -p uploads logs data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
