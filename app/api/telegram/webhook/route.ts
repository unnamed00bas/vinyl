import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramUpdate } from '@/server/telegram-bot'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    await handleTelegramUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Ошибка при обработке webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
