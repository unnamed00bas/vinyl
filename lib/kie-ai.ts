import axios from 'axios'

const KIE_AI_API_URL = process.env.KIE_AI_API_URL || 'https://api.kie.ai'
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY

interface SunoGenerateRequest {
  prompt: string
  title?: string
  tags?: string[]
  duration?: number
}

interface SunoGenerateResponse {
  taskId: string
  status: string
}

interface SunoTaskStatus {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  audioUrl?: string
  audioId?: string
  error?: string
}

/**
 * Генерация музыки через Suno API через KIE AI
 */
export async function generateMusicWithSuno(
  prompt: string,
  options?: { title?: string; tags?: string[]; duration?: number }
): Promise<SunoGenerateResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не настроен')
  }

  try {
    const response = await axios.post(
      `${KIE_AI_API_URL}/suno/generate`,
      {
        prompt,
        title: options?.title,
        tags: options?.tags || [],
        duration: options?.duration || 30,
      },
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Ошибка при генерации музыки через Suno:', error)
    throw new Error(
      error.response?.data?.message || 'Ошибка при генерации музыки'
    )
  }
}

/**
 * Проверка статуса задачи генерации музыки
 */
export async function checkSunoTaskStatus(
  taskId: string
): Promise<SunoTaskStatus> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не настроен')
  }

  try {
    const response = await axios.get(
      `${KIE_AI_API_URL}/suno/task/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Ошибка при проверке статуса задачи:', error)
    throw new Error(
      error.response?.data?.message || 'Ошибка при проверке статуса'
    )
  }
}

/**
 * Генерация изображения через LLM через KIE AI
 */
export async function generateImageWithAI(
  description: string,
  style?: string
): Promise<string> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не настроен')
  }

  try {
    const response = await axios.post(
      `${KIE_AI_API_URL}/image/generate`,
      {
        prompt: `Create a circular album cover image for: ${description}. ${style || 'Vintage vinyl record style, high quality, detailed'}`,
        size: '512x512',
        format: 'png',
      },
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.imageUrl
  } catch (error: any) {
    console.error('Ошибка при генерации изображения:', error)
    throw new Error(
      error.response?.data?.message || 'Ошибка при генерации изображения'
    )
  }
}

/**
 * Улучшение промпта через LLM через KIE AI
 */
export async function enhancePromptWithLLM(
  userDescription: string
): Promise<string> {
  if (!KIE_AI_API_KEY) {
    return userDescription // Fallback если нет API ключа
  }

  try {
    const response = await axios.post(
      `${KIE_AI_API_URL}/llm/chat`,
      {
        messages: [
          {
            role: 'system',
            content:
              'Ты помощник для создания музыки. Улучшай описания пользователей, делая их более детальными и подходящими для генерации музыки. Отвечай только улучшенным промптом, без дополнительных объяснений.',
          },
          {
            role: 'user',
            content: `Улучши это описание музыки: ${userDescription}`,
          },
        ],
        model: 'gpt-4',
      },
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.choices[0]?.message?.content || userDescription
  } catch (error: any) {
    console.error('Ошибка при улучшении промпта:', error)
    return userDescription // Fallback на оригинальный промпт
  }
}
