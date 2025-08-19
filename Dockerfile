# Multi-stage build for production
FROM node:18-alpine AS client-build

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Server stage
FROM node:18-alpine AS server

# Install Java and Python for code execution
RUN apk add --no-cache openjdk11 python3 py3-pip

WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

# Copy built client files
COPY --from=client-build /app/client/dist ./public

# Create temp directory for code execution
RUN mkdir -p temp

EXPOSE 5000

CMD ["node", "index.js"]