# Многоэтапная сборка для оптимизации размера образа
FROM node:20-alpine AS base

# Установка зависимостей для сборки
FROM base AS deps
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Устанавливаем FFmpeg и зависимости для canvas
RUN apk add --no-cache \
    ffmpeg \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем Next.js приложение
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Устанавливаем FFmpeg и зависимости для canvas в production
RUN apk add --no-cache \
    ffmpeg \
    wget \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из standalone сборки
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Создаем необходимые директории
RUN mkdir -p /app/uploads /app/temp /app/public/generated
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
