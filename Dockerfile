# ✅ Stage 1 — Build
FROM node:22-alpine AS builder

WORKDIR /app

# copy package files first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./

# install all dependencies including devDependencies
RUN npm ci

# copy source code
COPY . .

# build the app
RUN npm run build && ls -la dist/

# ✅ Stage 2 — Production
FROM node:22-alpine AS production

WORKDIR /app

# copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./

# install production dependencies only
RUN npm ci --omit=dev

# copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# create uploads folder
RUN mkdir -p public/uploads

# expose the port
EXPOSE 3000

# run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]