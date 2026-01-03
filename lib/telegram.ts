import axios from 'axios'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

/**
 * Отправка сообщения пользователю в Telegram
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string,
  options?: {
    replyMarkup?: any
    parseMode?: 'HTML' | 'Markdown'
  }
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN не настроен')
    return
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode,
      reply_markup: options?.replyMarkup,
    })
  } catch (error: any) {
    console.error('Ошибка при отправке сообщения в Telegram:', error)
  }
}

/**
 * Отправка видео пользователю в Telegram
 */
export async function sendTelegramVideo(
  chatId: number,
  videoUrl: string,
  caption?: string
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN не настроен')
    return
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendVideo`, {
      chat_id: chatId,
      video: videoUrl,
      caption,
      supports_streaming: true,
    })
  } catch (error: any) {
    console.error('Ошибка при отправке видео в Telegram:', error)
  }
}

/**
 * Проверка валидности данных от Telegram
 */
export function validateTelegramWebAppData(initData: string): boolean {
  // TODO: Реализовать проверку подписи данных от Telegram
  // Для продакшена нужно проверять hash с помощью секретного ключа
  return true
}

/**
 * Извлечение данных пользователя из initData
 */
export function parseTelegramInitData(initData: string): {
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    is_premium?: boolean
  }
} {
  try {
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    if (userStr) {
      return { user: JSON.parse(userStr) }
    }
    return {}
  } catch (error) {
    console.error('Ошибка при парсинге initData:', error)
    return {}
  }
}
