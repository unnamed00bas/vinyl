'use client'

import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  image: string | null
  onImageChange: (file: File | null) => void
  disabled?: boolean
}

export function ImageUpload({ image, onImageChange, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageChange(file)
    }
  }

  const handleRemove = () => {
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-gray-700"
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer',
            'hover:border-primary-500 transition-colors bg-vinyl-black/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-gray-500 mb-2" />
          <span className="text-sm text-gray-400">
            Нажмите для загрузки изображения
          </span>
        </label>
      )}
    </div>
  )
}
