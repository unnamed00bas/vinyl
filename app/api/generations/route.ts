import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseTelegramInitData } from '@/lib/telegram'

export async function GET(request: NextRequest) {
  try {
    // Получаем данные пользователя
    const initData = request.headers.get('x-telegram-init-data')
    let telegramUser = null

    if (initData) {
      telegramUser = parseTelegramInitData(initData)
    }

    // Находим пользователя
    let user
    if (telegramUser?.user) {
      user = await prisma.user.findUnique({
        where: { telegramId: String(telegramUser.user.id) },
      })
    } else {
      // Для тестирования
      user = await prisma.user.findFirst()
    }

    if (!user) {
      return NextResponse.json({ generations: [] })
    }

    // Получаем генерации пользователя
    const generations = await prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      generations: generations.map((g) => ({
        id: g.id,
        description: g.description,
        audioUrl: g.audioUrl,
        imageUrl: g.imageUrl,
        videoUrl: g.videoUrl,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Ошибка при получении генераций:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
