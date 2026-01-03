'use client'

import { useEffect, useState } from 'react'
import { useTelegram } from '@/hooks/useTelegram'
import { GenerationForm } from '@/components/GenerationForm'
import { GenerationList } from '@/components/GenerationList'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Home() {
  const { user, isReady } = useTelegram()
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vinyl-black via-vinyl-dark to-black">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vinyl-black via-vinyl-dark to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Создать пластинку
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Мои пластинки
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <GenerationForm />
        ) : (
          <GenerationList />
        )}
      </div>
    </div>
  )
}
