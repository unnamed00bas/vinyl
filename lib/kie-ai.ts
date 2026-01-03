import axios from 'axios'

const KIE_AI_API_URL = process.env.KIE_AI_API_URL || 'https://api.kie.ai/api/v1'
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY

interface SunoGenerateRequest {
  prompt: string
  customMode?: boolean
  instrumental?: boolean
  model?: string
  style?: string
  title?: string
  negativeTags?: string
  callBackUrl?: string
}

interface SunoGenerateResponse {
  taskId: string
}

interface SunoTrack {
  id: string
  title: string
  audioUrl: string
  streamAudioUrl?: string
  imageUrl?: string
  prompt?: string
  tags?: string
  duration?: number
  createTime?: string
}

interface SunoTaskStatus {
  taskId: string
  status: 'SUCCESS' | 'FIRST_SUCCESS' | 'TEXT_SUCCESS' | 'PENDING' | 'PROCESSING' | 'CREATE_TASK_FAILED' | 'FAILED'
  response?: {
    sunoData: SunoTrack[]
  }
  errorMessage?: string
}

/**
 * Генерация музыки через Suno API через KIE AI
 */
export async function generateMusicWithSuno(
  prompt: string,
  options?: { 
    title?: string
    style?: string
    customMode?: boolean
    instrumental?: boolean
    model?: string
    negativeTags?: string
    callBackUrl?: string
  }
): Promise<SunoGenerateResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не настроен')
  }

  try {
    const requestBody: SunoGenerateRequest = {
      prompt,
      customMode: options?.customMode || false,
      instrumental: options?.instrumental || false,
      model: options?.model || 'V4_5',
    }

    if (options?.title) {
      requestBody.title = options.title
    }
    if (options?.style) {
      requestBody.style = options.style
    }
    if (options?.negativeTags) {
      requestBody.negativeTags = options.negativeTags
    }
    if (options?.callBackUrl) {
      requestBody.callBackUrl = options.callBackUrl
    }

    const response = await axios.post(
      `${KIE_AI_API_URL}/generate`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Ошибка при генерации музыки')
    }

    return {
      taskId: response.data.data.taskId,
    }
  } catch (error: any) {
    console.error('Ошибка при генерации музыки через Suno:', error)
    throw new Error(
      error.response?.data?.msg || error.message || 'Ошибка при генерации музыки'
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
      `${KIE_AI_API_URL}/generate/record-info`,
      {
        params: {
          taskId,
        },
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      }
    )

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Ошибка при проверке статуса')
    }

    const data = response.data.data
    return {
      taskId: data.taskId || taskId,
      status: data.status || 'PENDING',
      response: data.response,
      errorMessage: data.errorMessage,
    }
  } catch (error: any) {
    console.error('Ошибка при проверке статуса задачи:', error)
    throw new Error(
      error.response?.data?.msg || error.message || 'Ошибка при проверке статуса'
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
