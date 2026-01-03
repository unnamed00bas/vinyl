import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enhancePromptWithLLM, generateMusicWithSuno } from '@/lib/kie-ai'
import { parseTelegramInitData } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null

    if (!description) {
      return NextResponse.json(
        { error: 'Описание обязательно' },
        { status: 400 }
      )
    }

    // Получаем данные пользователя из заголовков или initData
    const initData = request.headers.get('x-telegram-init-data')
    let telegramUser = null

    if (initData) {
      telegramUser = parseTelegramInitData(initData)
    }

    // Находим или создаем пользователя
    let user
    if (telegramUser?.user) {
      user = await prisma.user.upsert({
        where: { telegramId: String(telegramUser.user.id) },
        update: {},
        create: {
          telegramId: String(telegramUser.user.id),
          username: telegramUser.user.username,
          firstName: telegramUser.user.first_name,
          lastName: telegramUser.user.last_name,
          isPremium: telegramUser.user.is_premium || false,
          freeGenerations: 1,
        },
      })
    } else {
      // Для тестирования без Telegram
      user = await prisma.user.findFirst()
      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: '123456789',
            username: 'test_user',
            firstName: 'Test',
            freeGenerations: 1,
          },
        })
      }
    }

    // Проверяем, может ли пользователь создать генерацию
    const canGenerateFree = user.freeGenerations > 0
    const hasPremium = user.isPremium

    if (!canGenerateFree && !hasPremium) {
      // Проверяем баланс Telegram Stars (нужно реализовать)
      return NextResponse.json(
        {
          error: 'Недостаточно средств. Первая генерация бесплатна, следующие стоят 10 Telegram Stars',
          requiresPayment: true,
        },
        { status: 402 }
      )
    }

    // Улучшаем промпт через LLM
    const enhancedPrompt = await enhancePromptWithLLM(description)

    // Сохраняем изображение если загружено
    let imageUrl: string | null = null
    if (imageFile) {
      // TODO: Загрузить изображение в хранилище (S3, Cloudinary и т.д.)
      // Пока сохраняем в публичную папку
      const imageBuffer = await imageFile.arrayBuffer()
      const imagePath = `/uploads/${Date.now()}_${imageFile.name}`
      // В реальном приложении нужно сохранить файл
      imageUrl = imagePath
    }

    // Создаем запись о генерации
    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        description,
        prompt: enhancedPrompt,
        imageUrl,
        status: 'PENDING',
      },
    })

    // Уменьшаем количество бесплатных генераций
    if (canGenerateFree) {
      await prisma.user.update({
        where: { id: user.id },
        data: { freeGenerations: { decrement: 1 } },
      })
    }

    // Запускаем генерацию в фоне (через очередь задач)
    // Для простоты запускаем сразу
    generateMusicAsync(generation.id, enhancedPrompt).catch(console.error)

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      message: 'Генерация началась',
    })
  } catch (error: any) {
    console.error('Ошибка при создании генерации:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * Асинхронная генерация музыки
 */
async function generateMusicAsync(generationId: string, prompt: string) {
  try {
    // Обновляем статус
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'GENERATING_AUDIO' },
    })

    // Генерируем музыку через Suno
    const sunoResponse = await generateMusicWithSuno(prompt, {
      model: 'V4_5',
    })

    // Сохраняем taskId
    await prisma.generation.update({
      where: { id: generationId },
      data: { sunoTaskId: sunoResponse.taskId },
    })

    // Запускаем проверку статуса (в реальном приложении через очередь)
    checkSunoStatusAndContinue(generationId, sunoResponse.taskId)
  } catch (error: any) {
    console.error('Ошибка при генерации музыки:', error)
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'FAILED' },
    })
  }
}

/**
 * Проверка статуса Suno и продолжение генерации
 */
async function checkSunoStatusAndContinue(
  generationId: string,
  taskId: string
) {
  const { checkSunoTaskStatus } = await import('@/lib/kie-ai')
  const { generateImageWithAI } = await import('@/lib/kie-ai')
  const { generateVinylVideo, downloadAudio, downloadImage } = await import(
    '@/lib/video-generator'
  )
  const { sendTelegramVideo } = await import('@/lib/telegram')
  const path = await import('path')
  const fs = await import('fs')

  const maxAttempts = 60 // 5 минут при проверке каждые 5 секунд
  let attempts = 0

  const checkInterval = setInterval(async () => {
    attempts++

    try {
      const status = await checkSunoTaskStatus(taskId)

      // Проверяем успешное завершение генерации
      if (
        (status.status === 'SUCCESS' || status.status === 'FIRST_SUCCESS') &&
        status.response?.sunoData &&
        status.response.sunoData.length > 0
      ) {
        const track = status.response.sunoData[0]
        
        if (!track.audioUrl) {
          // Если трек еще не готов, продолжаем ждать
          return
        }

        clearInterval(checkInterval)

        // Скачиваем аудио
        const audioPath = path.join(
          process.cwd(),
          'temp',
          `audio_${generationId}.mp3`
        )
        await downloadAudio(track.audioUrl, audioPath)

        // Обновляем запись
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            audioUrl: track.audioUrl,
            sunoAudioId: track.id,
            status: 'GENERATING_IMAGE',
          },
        })

        // Генерируем или используем изображение
        const generation = await prisma.generation.findUnique({
          where: { id: generationId },
        })

        let imagePath: string
        if (generation?.imageUrl) {
          // Используем загруженное изображение
          imagePath = path.join(process.cwd(), 'public', generation.imageUrl)
        } else {
          // Генерируем изображение через AI
          const imageUrl = await generateImageWithAI(generation!.description)
          imagePath = path.join(process.cwd(), 'temp', `image_${generationId}.png`)
          await downloadImage(imageUrl, imagePath)

          await prisma.generation.update({
            where: { id: generationId },
            data: { imageUrl },
          })
        }

        // Генерируем видео
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: 'GENERATING_VIDEO' },
        })

        const videoPath = path.join(
          process.cwd(),
          'public',
          'generated',
          `vinyl_${generationId}.mp4`
        )

        await generateVinylVideo({
          audioPath,
          centerImagePath: imagePath,
          outputPath: videoPath,
          duration: 30,
        })

        const videoUrl = `/generated/vinyl_${generationId}.mp4`

        await prisma.generation.update({
          where: { id: generationId },
          data: {
            videoUrl,
            status: 'COMPLETED',
          },
        })

        // Отправляем уведомление пользователю
        const user = await prisma.user.findUnique({
          where: { id: generation!.userId },
        })

        if (user?.telegramId) {
          await sendTelegramVideo(
            Number(user.telegramId),
            `${process.env.NEXT_PUBLIC_APP_URL}${videoUrl}`,
            `Ваша виниловая пластинка готова! 🎵\n\n${generation!.description}`
          )
        }

        // Очищаем временные файлы
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
        }
        if (fs.existsSync(imagePath) && !generation?.imageUrl) {
          fs.unlinkSync(imagePath)
        }
      } else if (
        status.status === 'FAILED' ||
        status.status === 'CREATE_TASK_FAILED'
      ) {
        clearInterval(checkInterval)
        console.error('Ошибка генерации:', status.errorMessage)
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'FAILED',
          },
        })
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: 'FAILED' },
        })
      }
    } catch (error) {
      console.error('Ошибка при проверке статуса:', error)
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
      }
    }
  }, 5000) // Проверяем каждые 5 секунд
}
