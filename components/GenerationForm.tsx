'use client'

import { useState } from 'react'
import { useTelegram } from '@/hooks/useTelegram'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'
import { ImageUpload } from '@/components/ImageUpload'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export function GenerationForm() {
  const { user, showAlert } = useTelegram()
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationId, setGenerationId] = useState<string | null>(null)

  const handleImageChange = (file: File | null) => {
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      showAlert('Пожалуйста, опишите желаемую музыку')
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append('description', description)
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при генерации')
      }

      setGenerationId(data.generationId)
      setDescription('')
      setImage(null)
      setImagePreview(null)
      showAlert('Генерация началась! Вы получите уведомление, когда пластинка будет готова.')
    } catch (error: any) {
      showAlert(error.message || 'Произошла ошибка')
    } finally {
      setIsGenerating(false)
    }
  }

  if (generationId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-vinyl-dark/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-bold text-white">
              Генерация началась!
            </h2>
            <p className="text-gray-400">
              Ваша пластинка создается. Это может занять несколько минут.
            </p>
            <Button
              onClick={() => setGenerationId(null)}
              className="mt-4"
            >
              Создать еще одну
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-vinyl-dark/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          Создать виниловую пластинку
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Опишите музыку, которую хотите создать
            </label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: Веселая электронная музыка в стиле 80-х с синтезаторами и битом..."
              rows={5}
              className="w-full"
              disabled={isGenerating}
            />
            <p className="mt-2 text-xs text-gray-500">
              Чем подробнее описание, тем лучше результат
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Изображение для центра пластинки (опционально)
            </label>
            <ImageUpload
              image={imagePreview}
              onImageChange={handleImageChange}
              disabled={isGenerating}
            />
            <p className="mt-2 text-xs text-gray-500">
              Если не загрузите изображение, оно будет сгенерировано автоматически
            </p>
          </div>

          <div className="bg-primary-900/20 border border-primary-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-1">Информация о генерации:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Первая генерация бесплатна</li>
                  <li>Последующие генерации стоят 10 Telegram Stars</li>
                  <li>Генерация может занять 2-5 минут</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isGenerating || !description.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" showText={false} />
                <span>Создаю пластинку...</span>
              </>
            ) : (
              'Создать пластинку'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
