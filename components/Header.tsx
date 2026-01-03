'use client'

import { useTelegram } from '@/hooks/useTelegram'
import { Coins } from 'lucide-react'

export function Header() {
  const { user } = useTelegram()

  return (
    <header className="bg-vinyl-black/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vinyl</h1>
              <p className="text-xs text-gray-400">Создай свою пластинку</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-vinyl-dark px-4 py-2 rounded-full">
                <Coins className="w-4 h-4 text-vinyl-gold" />
                <span className="text-sm font-semibold text-white">
                  {user.is_premium ? '∞' : '1'}
                </span>
              </div>
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.first_name[0]}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
