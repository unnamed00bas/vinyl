import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        telegramId: u.telegramId,
        username: u.username,
        firstName: u.firstName,
        isPremium: u.isPremium,
        freeGenerations: u.freeGenerations,
        totalGenerations: u.totalGenerations,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Ошибка при получении пользователей:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
