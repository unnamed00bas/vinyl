import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseTelegramInitData, createInvoiceLink, sendInvoice } from '@/lib/telegram'

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

    // Проверяем, есть ли уже активный платеж для этой генерации
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let payment
    if (existingPayment) {
      payment = existingPayment
    } else {
      // Создаем новый платеж
      payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 10, // 10 Telegram Stars
          currency: 'XTR',
          status: 'PENDING',
        },
      })
    }

    // Создаем инвойс через Telegram Bot API
    const chatId = telegramUser.user.id
    const invoiceLink = await createInvoiceLink(
      chatId,
      'Генерация виниловой пластинки',
      'Создание уникальной виниловой пластинки с музыкой',
      JSON.stringify({ paymentId: payment.id, generationId }),
      10, // 10 Telegram Stars
      'XTR'
    )

    if (!invoiceLink) {
      // Если не удалось создать инвойс, возвращаем ошибку
      return NextResponse.json(
        { error: 'Не удалось создать платеж. Попробуйте позже.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      invoiceUrl: invoiceLink,
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
 * Вызывается автоматически при успешном платеже через Telegram
 */
export async function PUT(request: NextRequest) {
  try {
    const { paymentId, telegramChargeId, telegramPaymentChargeId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID платежа обязателен' },
        { status: 400 }
      )
    }

    // Находим платеж
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Платеж не найден' },
        { status: 404 }
      )
    }

    if (payment.status === 'COMPLETED') {
      // Платеж уже обработан
      return NextResponse.json({ success: true, payment })
    }

    // Обновляем статус платежа
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        telegramChargeId: telegramChargeId || telegramPaymentChargeId,
      },
    })

    // Увеличиваем количество генераций пользователя
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        totalGenerations: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, payment: updatedPayment })
  } catch (error: any) {
    console.error('Ошибка при обработке платежа:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
