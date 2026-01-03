import * as fs from 'fs'
import * as path from 'path'

// Динамический импорт canvas
let canvasModule: typeof import('canvas') | null = null

async function getCanvas() {
  if (!canvasModule) {
    try {
      canvasModule = await import('canvas')
    } catch (error) {
      throw new Error(
        'Canvas module не доступен. Убедитесь, что canvas установлен и совместим с вашей платформой.'
      )
    }
  }
  return canvasModule
}

// Проверка доступности FFmpeg
function isFFmpegAvailable(): boolean {
  try {
    // Проверяем наличие ffmpeg в системе
    const { execSync } = require('child_process')
    execSync('ffmpeg -version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'generated')
const TEMP_DIR = path.join(process.cwd(), 'temp')

// Создаем директории если их нет
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

interface GenerateVinylVideoOptions {
  audioPath: string
  centerImagePath: string
  outputPath: string
  duration?: number
  size?: { width: number; height: number }
}

/**
 * Генерация видео с вращающейся виниловой пластинкой
 */
export async function generateVinylVideo({
  audioPath,
  centerImagePath,
  outputPath,
  duration = 30,
  size = { width: 1080, height: 1080 },
}: GenerateVinylVideoOptions): Promise<string> {
  // Проверяем доступность FFmpeg
  if (!isFFmpegAvailable()) {
    throw new Error(
      'FFmpeg недоступен. Генерация видео требует FFmpeg. Установите FFmpeg в системе.'
    )
  }

  const ffmpeg = await import('fluent-ffmpeg')

  return new Promise((resolve, reject) => {
    // Создаем кадры для анимации
    const framesDir = path.join(TEMP_DIR, `frames_${Date.now()}`)
    fs.mkdirSync(framesDir, { recursive: true })

    // Генерируем кадры с вращающейся пластинкой
    generateVinylFrames({
      centerImagePath,
      framesDir,
      duration,
      size,
      fps: 30,
    })
      .then(() => {
        // Собираем видео из кадров с аудио
        ffmpeg.default()
          .input(path.join(framesDir, 'frame_%04d.png'))
          .inputOptions(['-framerate', '30'])
          .input(audioPath)
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-pix_fmt', 'yuv420p',
          ])
          .output(outputPath)
          .on('end', () => {
            // Очищаем временные файлы
            fs.rmSync(framesDir, { recursive: true, force: true })
            resolve(outputPath)
          })
          .on('error', (err) => {
            fs.rmSync(framesDir, { recursive: true, force: true })
            reject(err)
          })
          .run()
      })
      .catch(reject)
  })
}

/**
 * Генерация кадров с вращающейся пластинкой
 */
async function generateVinylFrames({
  centerImagePath,
  framesDir,
  duration,
  size,
  fps,
}: {
  centerImagePath: string
  framesDir: string
  duration: number
  size: { width: number; height: number }
  fps: number
}): Promise<void> {
  const totalFrames = duration * fps
  const { createCanvas, loadImage, Image } = await getCanvas()
  const canvas = createCanvas(size.width, size.height)
  const ctx = canvas.getContext('2d')

  // Загружаем центральное изображение
  // canvas loadImage принимает путь к файлу или URL
  // Для Buffer используем Image класс напрямую
  let centerImage: any
  if (typeof centerImagePath === 'string' && centerImagePath.startsWith('http')) {
    // Если это URL, используем loadImage напрямую
    centerImage = await loadImage(centerImagePath)
  } else if (Buffer.isBuffer(centerImagePath)) {
    // Если это Buffer, создаем Image и устанавливаем src
    const img = new Image()
    centerImage = new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = centerImagePath
    })
    centerImage = await centerImage
  } else {
    // Если это путь к файлу, используем loadImage
    centerImage = await loadImage(centerImagePath)
  }

  // Параметры пластинки
  const centerX = size.width / 2
  const centerY = size.height / 2
  const vinylRadius = Math.min(size.width, size.height) * 0.45
  const centerImageRadius = vinylRadius * 0.3

  // Генерируем каждый кадр
  for (let frame = 0; frame < totalFrames; frame++) {
    const rotation = (frame / totalFrames) * 360

    // Очищаем canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, size.width, size.height)

    // Рисуем градиентный фон
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      vinylRadius * 1.2
    )
    gradient.addColorStop(0, '#2d2d2d')
    gradient.addColorStop(1, '#1a1a1a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size.width, size.height)

    // Сохраняем состояние для вращения
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)

    // Рисуем виниловую пластинку (внешний круг)
    ctx.beginPath()
    ctx.arc(0, 0, vinylRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a1a'
    ctx.fill()
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 4
    ctx.stroke()

    // Рисуем концентрические круги (дорожки пластинки)
    for (let i = 1; i <= 5; i++) {
      const radius = (vinylRadius * i) / 6
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Рисуем центральное отверстие
    ctx.beginPath()
    ctx.arc(0, 0, centerImageRadius * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a1a'
    ctx.fill()

    // Рисуем центральное изображение
    ctx.beginPath()
    ctx.arc(0, 0, centerImageRadius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(
      centerImage,
      -centerImageRadius,
      -centerImageRadius,
      centerImageRadius * 2,
      centerImageRadius * 2
    )

    ctx.restore()

    // Сохраняем кадр
    const framePath = path.join(framesDir, `frame_${String(frame + 1).padStart(4, '0')}.png`)
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(framePath, buffer)
  }
}

/**
 * Скачивание аудио файла по URL
 */
export async function downloadAudio(
  audioUrl: string,
  outputPath: string
): Promise<string> {
  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error(`Ошибка при скачивании аудио: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  fs.writeFileSync(outputPath, Buffer.from(buffer))
  return outputPath
}

/**
 * Скачивание изображения по URL
 */
export async function downloadImage(
  imageUrl: string,
  outputPath: string
): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Ошибка при скачивании изображения: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  fs.writeFileSync(outputPath, Buffer.from(buffer))
  return outputPath
}
