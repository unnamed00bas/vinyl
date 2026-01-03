import { NextRequest, NextResponse } from 'next/server'
import { setWebhook } from '@/server/telegram-bot'

/**
 * API endpoint для установки webhook
 * Можно вызвать вручную или автоматически при деплое
 */
export async function POST(request: NextRequest) {
  try {
    await setWebhook()
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook установлен успешно' 
    })
  } catch (error: any) {
    console.error('Ошибка при установке webhook:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Ошибка при установке webhook' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint для проверки статуса webhook
 */
export async function GET() {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_TOKEN не настроен' },
      { status: 400 }
    )
  }

  try {
    const axios = (await import('axios')).default
    const response = await axios.get(`${TELEGRAM_API_URL}/getWebhookInfo`)
    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении информации о webhook' },
      { status: 500 }
    )
  }
}
