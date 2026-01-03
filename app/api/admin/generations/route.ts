import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const generations = await prisma.generation.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json({
      generations: generations.map((g) => ({
        id: g.id,
        description: g.description,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
        user: {
          firstName: g.user.firstName,
          username: g.user.username,
        },
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
