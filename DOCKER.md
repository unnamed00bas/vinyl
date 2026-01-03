# Развертывание через Docker

## Требования

- Docker 20.10+
- Docker Compose 2.0+

## Быстрый старт

1. **Создайте файл `.env` в корне проекта:**

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_@BotFather
TELEGRAM_BOT_USERNAME=your_bot_username

# KIE AI
KIE_AI_API_KEY=your_kie_ai_api_key
KIE_AI_API_URL=https://api.kie.ai

# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=your_random_secret_key_min_32_chars

# App URLs
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

2. **Соберите и запустите контейнер:**

```bash
docker-compose up -d --build
```

3. **Инициализируйте базу данных:**

```bash
# Войдите в контейнер
docker-compose exec vinyl sh

# Внутри контейнера выполните:
npx prisma migrate deploy
npx prisma generate
npm run setup
npm run init-admin

# Выйдите из контейнера
exit
```

Или выполните команды напрямую:

```bash
docker-compose exec vinyl npx prisma migrate deploy
docker-compose exec vinyl npx prisma generate
docker-compose exec vinyl npm run setup
docker-compose exec vinyl npm run init-admin
```

## Управление контейнером

### Запуск
```bash
docker-compose up -d
```

### Остановка
```bash
docker-compose down
```

### Просмотр логов
```bash
docker-compose logs -f vinyl
```

### Перезапуск
```bash
docker-compose restart vinyl
```

### Пересборка после изменений
```bash
docker-compose up -d --build
```

## Настройка порта

По умолчанию приложение работает на порту **3001** (так как порт 3000 может быть занят другими сервисами).

Чтобы изменить порт, отредактируйте `docker-compose.yml`:

```yaml
ports:
  - "3002:3001"  # Внешний порт:Внутренний порт
```

И обновите переменные окружения:
```env
NEXTAUTH_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Структура volumes

Docker Compose монтирует следующие директории для сохранения данных:

- `./prisma/dev.db` - база данных SQLite
- `./uploads` - загруженные пользователями файлы
- `./public/generated` - сгенерированные видео
- `./temp` - временные файлы

## Первый вход в админку

После выполнения `npm run setup` или `npm run init-admin`:

- Email: `admin@vinyl.app`
- Пароль: `admin123`

⚠️ **Обязательно измените пароль после первого входа!**

## Настройка Telegram Webhook

После запуска контейнера установите webhook:

```bash
# Если приложение доступно по адресу https://your-domain.com
curl -X POST "https://your-domain.com/api/telegram/setup-webhook"

# Или вручную
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook"
```

## Проверка работы

1. Откройте `http://localhost:3001` в браузере
2. Создайте тестовую генерацию
3. Проверьте админку: `http://localhost:3001/admin`

## Обновление приложения

1. Остановите контейнер:
```bash
docker-compose down
```

2. Обновите код (git pull или другие изменения)

3. Пересоберите и запустите:
```bash
docker-compose up -d --build
```

4. Примените миграции (если есть):
```bash
docker-compose exec vinyl npx prisma migrate deploy
```

## Troubleshooting

### Контейнер не запускается

Проверьте логи:
```bash
docker-compose logs vinyl
```

### Ошибки базы данных

Убедитесь, что файл базы данных существует и имеет правильные права:
```bash
ls -la prisma/dev.db
```

Если нужно пересоздать базу:
```bash
docker-compose exec vinyl npx prisma migrate reset
docker-compose exec vinyl npm run setup
```

### FFmpeg не работает

FFmpeg установлен в образе. Если возникают проблемы, проверьте:
```bash
docker-compose exec vinyl ffmpeg -version
```

### Проблемы с портами

Если порт 3001 занят, измените его в `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"
```

## Production рекомендации

1. **Используйте PostgreSQL вместо SQLite** для production:
   - Измените `DATABASE_URL` в `.env`
   - Обновите `prisma/schema.prisma`
   - Добавьте PostgreSQL сервис в `docker-compose.yml`

2. **Настройте reverse proxy** (Nginx/Traefik) для:
   - SSL/TLS сертификатов
   - Доменного имени
   - Балансировки нагрузки

3. **Настройте резервное копирование** базы данных

4. **Используйте секреты** для переменных окружения в production

5. **Настройте мониторинг** и логирование

## Пример с PostgreSQL

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: vinyl
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: vinyl
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  vinyl:
    # ... остальная конфигурация
    environment:
      - DATABASE_URL=postgresql://vinyl:${POSTGRES_PASSWORD}@postgres:5432/vinyl
    depends_on:
      - postgres

volumes:
  postgres_data:
```
