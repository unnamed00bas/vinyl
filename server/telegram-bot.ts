import axios from 'axios'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const WEB_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Установка webhook для Telegram Bot
 */
export async function setWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN не настроен, webhook не установлен')
    return
  }

  try {
    const webhookUrl = `${WEB_APP_URL}/api/telegram/webhook`
    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message', 'pre_checkout_query', 'successful_payment'],
    })

    console.log('Webhook установлен:', response.data)
  } catch (error: any) {
    console.error('Ошибка при установке webhook:', error.response?.data || error)
  }
}

/**
 * Обработка сообщений от Telegram
 */
export async function handleTelegramUpdate(update: any) {
  if (update.message) {
    await handleMessage(update.message)
  }

  if (update.pre_checkout_query) {
    await handlePreCheckoutQuery(update.pre_checkout_query)
  }

  if (update.message?.successful_payment) {
    await handleSuccessfulPayment(update.message)
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id
  const text = message.text

  if (text === '/start') {
    await sendWelcomeMessage(chatId)
  } else if (text === '/help') {
    await sendHelpMessage(chatId)
  }
}

async function sendWelcomeMessage(chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🎵 Открыть приложение',
          web_app: { url: WEB_APP_URL },
        },
      ],
    ],
  }

  await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
    chat_id: chatId,
    text: `🎵 Добро пожаловать в Vinyl!\n\nСоздай свою уникальную виниловую пластинку с музыкой на основе твоего описания.\n\nПервая генерация бесплатна!`,
    reply_markup: keyboard,
  })
}

async function sendHelpMessage(chatId: number) {
  const helpText = `🎵 Vinyl - Создай свою виниловую пластинку

📝 Как это работает:
1. Опиши желаемую музыку
2. Загрузи изображение (или мы сгенерируем его)
3. Получи готовую виниловую пластинку с вращающейся анимацией

💰 Цены:
• Первая генерация - бесплатно
• Последующие - 10 Telegram Stars

🎨 Возможности:
• Генерация музыки через AI
• Автоматическая генерация обложки
• Красивая анимация виниловой пластинки
• Возможность поделиться результатом

Используй /start чтобы открыть приложение!`

  await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
    chat_id: chatId,
    text: helpText,
  })
}

async function handlePreCheckoutQuery(query: any) {
  // Подтверждаем платеж
  await axios.post(`${TELEGRAM_API_URL}/answerPreCheckoutQuery`, {
    pre_checkout_query_id: query.id,
    ok: true,
  })
}

async function handleSuccessfulPayment(message: any) {
  const chatId = message.chat.id
  const payment = message.successful_payment

  // Обновляем статус платежа в базе данных
  // Это должно быть сделано через API endpoint

  await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
    chat_id: chatId,
    text: `✅ Платеж успешно обработан! Теперь ты можешь создать новую пластинку.`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎵 Создать пластинку',
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    },
  })
}
