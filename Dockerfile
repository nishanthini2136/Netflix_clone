# =====================================
# Stage 1: Build Frontend (Vite)
# =====================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Accept Vite environment variable
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

# Build frontend
RUN npm run build


# =====================================
# Stage 2: Production (Node Backend)
# =====================================
FROM node:20-alpine

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy backend server
COPY server ./server

# Copy built frontend from Stage 1
COPY --from=build /app/dist ./dist

# Expose backend port
EXPOSE 3000

# Start backend server
CMD ["node", "server/index.js"]
