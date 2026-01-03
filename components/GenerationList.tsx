'use client'

import { useEffect, useState } from 'react'
import { useTelegram } from '@/hooks/useTelegram'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Play, Download, Share2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/Button'

interface Generation {
  id: string
  description: string
  audioUrl: string | null
  imageUrl: string | null
  videoUrl: string | null
  status: string
  createdAt: string
}

export function GenerationList() {
  const { user } = useTelegram()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations')
      const data = await response.json()
      if (response.ok) {
        setGenerations(data.generations || [])
      }
    } catch (error) {
      console.error('Error fetching generations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (generation: Generation) => {
    if (generation.videoUrl) {
      try {
        await navigator.share({
          title: 'Моя виниловая пластинка',
          text: generation.description,
          url: generation.videoUrl,
        })
      } catch (error) {
        // Fallback to copying link
        navigator.clipboard.writeText(generation.videoUrl)
        alert('Ссылка скопирована в буфер обмена')
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидание'
      case 'GENERATING_AUDIO':
        return 'Генерация аудио...'
      case 'GENERATING_IMAGE':
        return 'Генерация изображения...'
      case 'GENERATING_VIDEO':
        return 'Создание видео...'
      case 'COMPLETED':
        return 'Готово'
      case 'FAILED':
        return 'Ошибка'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-vinyl-dark/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
          <p className="text-gray-400 text-lg">
            У вас пока нет созданных пластинок
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Создайте свою первую виниловую пластинку!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-4">
        {generations.map((generation) => (
          <div
            key={generation.id}
            className="bg-vinyl-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-start gap-4">
              {/* Vinyl Preview */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {generation.videoUrl ? (
                  <video
                    src={generation.videoUrl}
                    className="w-full h-full rounded-full object-cover"
                    loop
                    muted
                    autoPlay
                  />
                ) : generation.imageUrl ? (
                  <div className="w-full h-full rounded-full bg-vinyl-black border-4 border-vinyl-gold flex items-center justify-center overflow-hidden">
                    <img
                      src={generation.imageUrl}
                      alt="Vinyl"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-vinyl-black border-4 border-gray-700 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-white font-medium line-clamp-2">
                    {generation.description}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(generation.status)}
                    <span className="text-sm text-gray-400">
                      {getStatusText(generation.status)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  {new Date(generation.createdAt).toLocaleString('ru-RU')}
                </p>

                {/* Actions */}
                {generation.status === 'COMPLETED' && (
                  <div className="flex gap-2">
                    {generation.audioUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(generation.audioUrl!, '_blank')}
                      >
                        <Play className="w-4 h-4" />
                        Слушать
                      </Button>
                    )}
                    {generation.videoUrl && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(generation.videoUrl!, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                          Скачать
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleShare(generation)}
                        >
                          <Share2 className="w-4 h-4" />
                          Поделиться
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
