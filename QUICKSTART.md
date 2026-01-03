# Быстрый старт

## Минимальная настройка за 5 минут

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Создайте `.env` файл:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_random_secret_here
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
KIE_AI_API_KEY=your_kie_api_key
KIE_AI_API_URL=https://api.kie.ai
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Инициализация базы данных
```bash
npm run db:migrate
npm run db:generate
npm run setup
```

### 5. Запуск
```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## Тестирование без Telegram

Приложение работает и без Telegram! Просто откройте в браузере.

## Тестирование с Telegram

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env`
3. Используйте ngrok для локальной разработки:
```bash
ngrok http 3000
```
4. Установите webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/telegram/webhook"
```

## Первый вход в админку

После `npm run setup`:
- Email: `admin@vinyl.app`
- Пароль: `admin123`

⚠️ **Обязательно измените пароль!**

## Проверка работы

1. Откройте `http://localhost:3000`
2. Создайте тестовую генерацию
3. Проверьте админку: `http://localhost:3000/admin`

## Частые проблемы

### FFmpeg не найден
```bash
# Windows (Chocolatey)
choco install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

### Ошибки базы данных
```bash
# Убедитесь, что файл базы данных создан
# Пересоздайте миграции
npm run db:migrate reset
```

### Проблемы с KIE AI
См. [KIE_AI_INTEGRATION.md](./KIE_AI_INTEGRATION.md)

## Следующие шаги

- Настройте KIE AI интеграцию
- Настройте Telegram Bot
- Настройте платежи через Telegram Stars
- Разверните на продакшн (Vercel, Railway, etc.)

Подробнее в [SETUP.md](./SETUP.md)
