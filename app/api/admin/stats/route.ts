import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const [totalUsers, totalGenerations, completedGenerations, payments] =
      await Promise.all([
        prisma.user.count(),
        prisma.generation.count(),
        prisma.generation.count({ where: { status: 'COMPLETED' } }),
        prisma.payment.findMany({
          where: { status: 'COMPLETED' },
        }),
      ])

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      totalUsers,
      totalGenerations,
      completedGenerations,
      totalRevenue,
    })
  } catch (error: any) {
    console.error('Ошибка при получении статистики:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
