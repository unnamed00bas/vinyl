import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseTelegramInitData } from '@/lib/telegram'

/**
 * Создание платежа через Telegram Stars
 */
export async function POST(request: NextRequest) {
  try {
    const { generationId } = await request.json()

    if (!generationId) {
      return NextResponse.json(
        { error: 'ID генерации обязателен' },
        { status: 400 }
      )
    }

    // Получаем данные пользователя
    const initData = request.headers.get('x-telegram-init-data')
    let telegramUser = null

    if (initData) {
      telegramUser = parseTelegramInitData(initData)
    }

    if (!telegramUser?.user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramUser.user.id) },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Создаем платеж
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 10, // 10 Telegram Stars
        currency: 'XTR',
        status: 'PENDING',
      },
    })

    // В реальном приложении здесь нужно вызвать Telegram Bot API
    // для создания инвойса через createInvoiceLink или sendInvoice

    return NextResponse.json({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      // В реальном приложении здесь будет invoice URL
      invoiceUrl: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=pay_${payment.id}`,
    })
  } catch (error: any) {
    console.error('Ошибка при создании платежа:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * Webhook для обработки платежей от Telegram
 */
export async function PUT(request: NextRequest) {
  try {
    const { paymentId, telegramChargeId } = await request.json()

    // В реальном приложении здесь нужно проверить подпись от Telegram
    // и обновить статус платежа

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        telegramChargeId,
      },
    })

    // Увеличиваем количество генераций пользователя
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        totalGenerations: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, payment })
  } catch (error: any) {
    console.error('Ошибка при обработке платежа:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
