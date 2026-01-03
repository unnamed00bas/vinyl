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

# Caddy (для автоматического SSL)
# Для production укажите ваш домен:
CADDY_DOMAIN=your-domain.com
CADDY_EMAIL=admin@your-domain.com

# App URLs
# Для localhost (без SSL):
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Для production с доменом (раскомментируйте и используйте вместо выше):
# NEXTAUTH_URL=https://your-domain.com
# NEXT_PUBLIC_APP_URL=https://your-domain.com
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
# Логи приложения
docker-compose logs -f vinyl

# Логи Caddy (reverse proxy и SSL)
docker-compose logs -f caddy
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

Volumes для Caddy (автоматически создаются):
- `caddy_data` - данные Caddy (SSL сертификаты)
- `caddy_config` - конфигурация Caddy
- `caddy_logs` - логи доступа

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

## Настройка SSL с Caddy

Caddy автоматически получает SSL сертификаты от Let's Encrypt. Для настройки:

1. **Укажите домен в `.env` файле:**
```env
CADDY_DOMAIN=your-domain.com
CADDY_EMAIL=admin@your-domain.com
```

2. **Убедитесь, что домен указывает на ваш сервер:**
   - A-запись должна указывать на IP адрес сервера
   - Порты 80 и 443 должны быть открыты в firewall

3. **Обновите URL приложения в `.env`:**
```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

4. **Перезапустите контейнеры:**
```bash
docker-compose down
docker-compose up -d
```

5. **Проверьте логи Caddy:**
```bash
docker-compose logs -f caddy
```

Caddy автоматически получит SSL сертификат при первом запуске. Это может занять несколько минут.

**Важно:** Для тестирования можно использовать staging окружение Let's Encrypt. Раскомментируйте строку `acme_ca` в `docker/caddy-entrypoint.sh`.

## Проверка работы

### Для localhost (без SSL):
1. Откройте `http://localhost` в браузере (Caddy проксирует на порт 80)
2. Создайте тестовую генерацию
3. Проверьте админку: `http://localhost/admin`

### Для production с доменом:
1. Откройте `https://your-domain.com` в браузере
2. Убедитесь, что SSL сертификат работает (зеленый замочек в браузере)
3. Создайте тестовую генерацию
4. Проверьте админку: `https://your-domain.com/admin`

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

Приложение больше не пробрасывает порт 3001 наружу - оно доступно только через Caddy на портах 80 и 443.

Если порты 80 или 443 заняты, измените их в `docker-compose.yml`:
```yaml
caddy:
  ports:
    - "8080:80"    # HTTP
    - "8443:443"   # HTTPS
    - "8443:443/udp"
```

### Проблемы с SSL сертификатами

Если Caddy не может получить SSL сертификат:

1. **Проверьте, что домен указывает на сервер:**
```bash
dig your-domain.com
```

2. **Убедитесь, что порты 80 и 443 открыты:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
```

3. **Проверьте логи Caddy:**
```bash
docker-compose logs caddy
```

4. **Для тестирования используйте staging окружение:**
   Раскомментируйте строку `acme_ca` в `docker/caddy-entrypoint.sh`

## Production рекомендации

1. **Используйте PostgreSQL вместо SQLite** для production:
   - Измените `DATABASE_URL` в `.env`
   - Обновите `prisma/schema.prisma`
   - Добавьте PostgreSQL сервис в `docker-compose.yml`

2. **Caddy уже настроен** для автоматического получения SSL сертификатов:
   - Укажите `CADDY_DOMAIN` в `.env` файле
   - Caddy автоматически получит SSL сертификат от Let's Encrypt
   - Приложение будет доступно по HTTPS на портах 80 и 443

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
