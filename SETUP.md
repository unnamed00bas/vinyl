# Инструкция по установке и настройке

## Требования

- Node.js 18+ 
- FFmpeg (для генерации видео)
- Telegram Bot Token

## Установка

1. **Клонируйте репозиторий и установите зависимости:**
```bash
npm install
```

2. **Настройте переменные окружения:**
```bash
cp .env.example .env
```

Заполните `.env` файл:
```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_@BotFather
TELEGRAM_BOT_USERNAME=your_bot_username

# KIE AI
KIE_AI_API_KEY=your_kie_ai_api_key
KIE_AI_API_URL=https://api.kie.ai

# Database (SQLite)
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your_random_secret_key

# App
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Настройте базу данных:**
```bash
# Создайте миграции (SQLite создаст файл dev.db автоматически)
npm run db:migrate

# Сгенерируйте Prisma Client
npm run db:generate

# Настройте дефолтные данные
npm run setup
```

⚠️ **Примечание:** Если у вас были старые миграции для PostgreSQL, удалите папку `prisma/migrations` и создайте новую миграцию для SQLite.

4. **Установите FFmpeg:**

**Windows:**
```bash
# Через Chocolatey
choco install ffmpeg

# Или скачайте с https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

5. **Запустите приложение:**
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Mini App:
   - Откройте [@BotFather](https://t.me/BotFather)
   - Выберите вашего бота
   - Выберите "Bot Settings" → "Menu Button"
   - Установите URL вашего приложения

4. Установите webhook (опционально, для обработки сообщений):
```bash
# После запуска приложения webhook установится автоматически
# Или установите вручную через API
```

## Настройка KIE AI

1. Получите API ключ от KIE AI
2. Убедитесь, что KIE AI поддерживает:
   - Suno API для генерации музыки
   - LLM для улучшения промптов
   - Генерацию изображений

3. Проверьте эндпоинты в `lib/kie-ai.ts` и при необходимости обновите их под ваш API

## Создание админ-пользователя

```bash
npm run init-admin
```

Или используйте дефолтные данные после `npm run setup`:
- Email: `admin@vinyl.app`
- Пароль: `admin123`

⚠️ **Обязательно измените пароль после первого входа!**

## Структура проекта

```
vinyl/
├── app/                    # Next.js приложение
│   ├── api/               # API routes
│   ├── admin/             # Админ-панель
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── admin/            # Компоненты админки
│   └── ...
├── lib/                   # Утилиты
│   ├── kie-ai.ts         # Интеграция с KIE AI
│   ├── telegram.ts       # Telegram API
│   └── video-generator.ts # Генерация видео
├── prisma/               # Схема базы данных
├── server/               # Express сервер (если нужен)
└── scripts/              # Скрипты инициализации
```

## Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. ⚠️ **Примечание:** SQLite не поддерживается на Vercel в production. Для production используйте PostgreSQL или другую облачную БД
4. Запустите миграции: `npm run db:migrate`

### Docker

```dockerfile
# Dockerfile можно добавить при необходимости
```

## Проблемы и решения

### FFmpeg не найден
- Убедитесь, что FFmpeg установлен и доступен в PATH
- Проверьте: `ffmpeg -version`

### Ошибки базы данных
- Убедитесь, что файл базы данных создан (dev.db в корне проекта)
- Проверьте права доступа к файлу базы данных
- Убедитесь, что миграции применены: `npm run db:migrate`

### Telegram webhook не работает
- Проверьте, что URL доступен извне (используйте ngrok для локальной разработки)
- Убедитесь, что токен бота правильный

### KIE AI ошибки
- Проверьте API ключ
- Убедитесь, что эндпоинты правильные
- Проверьте лимиты API

## Поддержка

При возникновении проблем создайте issue в репозитории.
