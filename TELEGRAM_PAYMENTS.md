# Настройка платежей через Telegram Stars

## Обзор

Приложение использует Telegram Stars для монетизации. Первая генерация бесплатна для каждого пользователя, последующие стоят 10 Telegram Stars.

## Настройка

### 1. Требования

- Telegram Bot Token (получите через [@BotFather](https://t.me/BotFather))
- Telegram Bot должен быть настроен для приема платежей
- Приложение должно быть доступно по HTTPS (для продакшена)

### 2. Настройка переменных окружения

Добавьте в `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Включение платежей в боте

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Перейдите в "Bot Settings" → "Payments"
4. Включите платежи (если доступно)

### 4. Как работают платежи

#### Процесс оплаты:

1. **Пользователь создает генерацию**
   - Если это первая генерация → бесплатно
   - Если нет бесплатных генераций → требуется оплата

2. **Создание инвойса**
   - API создает запись о платеже в базе данных
   - Создается инвойс через Telegram Bot API (`createInvoiceLink`)
   - Пользователю возвращается ссылка на инвойс

3. **Оплата**
   - Пользователь переходит по ссылке и оплачивает через Telegram
   - Telegram отправляет webhook с информацией о платеже

4. **Обработка платежа**
   - Webhook обрабатывает успешный платеж
   - Статус платежа обновляется на `COMPLETED`
   - Пользователь получает возможность создать новую генерацию

## API Endpoints

### POST `/api/payment`

Создает новый платеж и возвращает ссылку на инвойс.

**Запрос:**
```json
{
  "generationId": "generation_id_here"
}
```

**Ответ:**
```json
{
  "paymentId": "payment_id",
  "amount": 10,
  "currency": "XTR",
  "invoiceUrl": "https://t.me/invoice/..."
}
```

### PUT `/api/payment`

Обновляет статус платежа после успешной оплаты (вызывается автоматически через webhook).

**Запрос:**
```json
{
  "paymentId": "payment_id",
  "telegramChargeId": "charge_id_from_telegram"
}
```

## Webhook обработка

Webhook автоматически обрабатывает успешные платежи:

1. Telegram отправляет `successful_payment` в webhook
2. Функция `handleSuccessfulPayment` извлекает `paymentId` из payload
3. Вызывается API endpoint для обновления статуса платежа
4. Пользователь получает уведомление об успешной оплате

## Тестирование

### Локальное тестирование

Для локального тестирования используйте ngrok:

```bash
# Запустите ngrok
ngrok http 3000

# Установите webhook
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/telegram/webhook"
```

### Тестирование платежей

⚠️ **Важно:** Telegram Stars доступны только в продакшене. Для тестирования:

1. Используйте тестовый режим (если доступен)
2. Или тестируйте логику без реальных платежей

## Структура платежа в базе данных

```prisma
model Payment {
  id                String    @id @default(cuid())
  userId            String
  amount            Int       // в Telegram Stars
  currency          String    @default("XTR")
  status            String    @default("PENDING") // PENDING, COMPLETED, FAILED
  telegramChargeId  String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## Обработка ошибок

### Платеж не создается

- Проверьте, что `TELEGRAM_BOT_TOKEN` настроен
- Убедитесь, что бот имеет права на создание инвойсов
- Проверьте логи сервера

### Платеж не обрабатывается

- Проверьте, что webhook установлен и доступен
- Убедитесь, что URL webhook доступен извне (HTTPS для продакшена)
- Проверьте логи webhook endpoint

### Пользователь не получает уведомления

- Проверьте, что `handleSuccessfulPayment` вызывается
- Убедитесь, что бот может отправлять сообщения пользователю
- Проверьте логи Telegram Bot API

## Безопасность

1. **Валидация данных**
   - Всегда проверяйте `initData` от Telegram
   - Валидируйте подпись данных (реализовать `validateTelegramWebAppData`)

2. **Проверка платежей**
   - В продакшене проверяйте подпись платежей от Telegram
   - Не доверяйте только `telegramChargeId` - проверяйте через Telegram API

3. **Защита endpoints**
   - Webhook endpoint должен проверять источник запросов
   - Используйте секретный токен для webhook (если доступно)

## Дополнительные ресурсы

- [Telegram Bot API - Payments](https://core.telegram.org/bots/api#payments)
- [Telegram Stars Documentation](https://core.telegram.org/bots/api#stars)
- [Telegram Webhook Guide](https://core.telegram.org/bots/api#setwebhook)
