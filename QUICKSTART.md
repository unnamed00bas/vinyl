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
4. Установите webhook (автоматически через API):
```bash
# После запуска приложения (npm run dev)
curl -X POST "http://localhost:3000/api/telegram/setup-webhook"

# Или вручную через Telegram API
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/telegram/webhook"
```

5. Проверьте статус webhook:
```bash
curl "http://localhost:3000/api/telegram/setup-webhook"
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

### Проблемы с платежами Telegram Stars
См. [TELEGRAM_PAYMENTS.md](./TELEGRAM_PAYMENTS.md)

## Следующие шаги

- ✅ Настройте KIE AI интеграцию - см. [KIE_AI_INTEGRATION.md](./KIE_AI_INTEGRATION.md)
- ✅ Настройте Telegram Bot - установите webhook через `/api/telegram/setup-webhook`
- ✅ Настройте платежи через Telegram Stars - см. [TELEGRAM_PAYMENTS.md](./TELEGRAM_PAYMENTS.md)
- Разверните на продакшн:
  - Ubuntu Server - см. [UBUNTU_DEPLOYMENT.md](./UBUNTU_DEPLOYMENT.md)
  - Docker - см. [DOCKER.md](./DOCKER.md)

Подробнее в [SETUP.md](./SETUP.md)
