# Интеграция с KIE AI

Этот проект использует KIE AI для доступа к Suno API и LLM.

## Настройка KIE AI

### 1. Получение API ключа

1. Зарегистрируйтесь на платформе KIE AI
2. Получите API ключ в личном кабинете
3. Добавьте ключ в `.env`:
```env
KIE_AI_API_KEY=your_api_key_here
KIE_AI_API_URL=https://api.kie.ai
```

### 2. Требуемые эндпоинты

KIE AI должен предоставлять следующие эндпоинты:

#### Генерация музыки через Suno
```
POST /suno/generate
Body: {
  prompt: string,
  title?: string,
  tags?: string[],
  duration?: number
}
Response: {
  taskId: string,
  status: string
}
```

#### Проверка статуса задачи Suno
```
GET /suno/task/:taskId
Response: {
  taskId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  audioUrl?: string,
  audioId?: string,
  error?: string
}
```

#### Генерация изображения
```
POST /image/generate
Body: {
  prompt: string,
  size?: string,
  format?: string
}
Response: {
  imageUrl: string
}
```

#### LLM чат (для улучшения промптов)
```
POST /llm/chat
Body: {
  messages: Array<{
    role: 'system' | 'user' | 'assistant',
    content: string
  }>,
  model?: string
}
Response: {
  choices: Array<{
    message: {
      content: string
    }
  }>
}
```

### 3. Адаптация под ваш API

Если структура вашего KIE AI API отличается, обновите файл `lib/kie-ai.ts`:

```typescript
// Пример адаптации
export async function generateMusicWithSuno(prompt: string) {
  const response = await axios.post(
    `${KIE_AI_API_URL}/your-endpoint`,
    { yourField: prompt },
    {
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}
```

### 4. Тестирование

После настройки протестируйте интеграцию:

```bash
# Запустите приложение
npm run dev

# Создайте тестовую генерацию через UI
# Или используйте curl для тестирования API
```

### 5. Обработка ошибок

Все функции в `lib/kie-ai.ts` включают обработку ошибок. При проблемах:

1. Проверьте логи в консоли
2. Убедитесь, что API ключ правильный
3. Проверьте доступность эндпоинтов
4. Убедитесь, что у вас есть квоты на API

### 6. Альтернативные решения

Если KIE AI недоступен, вы можете:

1. **Использовать Suno API напрямую:**
   - Зарегистрируйтесь на https://suno.ai
   - Получите API ключ
   - Обновите `lib/kie-ai.ts` для прямого вызова Suno API

2. **Использовать другие сервисы:**
   - OpenAI для LLM (улучшение промптов)
   - DALL-E или Midjourney для генерации изображений
   - Другие музыкальные AI сервисы

### 7. Примеры запросов

#### Генерация музыки
```typescript
const result = await generateMusicWithSuno(
  "Веселая электронная музыка в стиле 80-х",
  { duration: 30 }
)
console.log(result.taskId)
```

#### Улучшение промпта
```typescript
const enhanced = await enhancePromptWithLLM(
  "грустная музыка"
)
// Результат: более детальное описание для лучшей генерации
```

#### Генерация изображения
```typescript
const imageUrl = await generateImageWithAI(
  "Винтажная обложка альбома в стиле 70-х",
  "Vintage vinyl record style"
)
```

## Поддержка

При проблемах с интеграцией:
1. Проверьте документацию KIE AI
2. Убедитесь, что все эндпоинты доступны
3. Проверьте лимиты и квоты API
