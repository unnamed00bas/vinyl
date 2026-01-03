'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import WebApp from '@twa-dev/sdk'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  is_premium?: boolean
}

interface TelegramContextType {
  user: TelegramUser | null
  isReady: boolean
  initData: string | null
  sendData: (data: any) => void
  showAlert: (message: string) => void
  showConfirm: (message: string) => Promise<boolean>
  openLink: (url: string) => void
  ready: () => void
  expand: () => void
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [initData, setInitData] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем, запущено ли в Telegram
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
      WebApp.ready()
      WebApp.expand()
      
      const tgUser = WebApp.initDataUnsafe.user
      setUser({
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        is_premium: tgUser.is_premium,
      })
      setInitData(WebApp.initData)
      setIsReady(true)
    } else {
      // Если не в Telegram, создаем тестового пользователя
      setUser({
        id: 123456789,
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'test_user',
        is_premium: false,
      })
      setIsReady(true)
    }
  }, [])

  const sendData = (data: any) => {
    if (typeof window !== 'undefined' && WebApp.sendData) {
      try {
        WebApp.sendData(JSON.stringify(data))
      } catch (error) {
        console.warn('WebApp.sendData не поддерживается:', error)
      }
    }
  }

  const showAlert = (message: string) => {
    if (typeof window !== 'undefined' && WebApp.showAlert) {
      try {
        WebApp.showAlert(message)
      } catch (error) {
        // Если метод не поддерживается, используем fallback
        console.warn('WebApp.showAlert не поддерживается:', error)
        alert(message)
      }
    } else {
      alert(message)
    }
  }

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && WebApp.showConfirm) {
        try {
          WebApp.showConfirm(message, (confirmed) => {
            resolve(confirmed)
          })
        } catch (error) {
          // Если метод не поддерживается, используем fallback
          console.warn('WebApp.showConfirm не поддерживается:', error)
          resolve(confirm(message))
        }
      } else {
        resolve(confirm(message))
      }
    })
  }

  const openLink = (url: string) => {
    if (typeof window !== 'undefined' && WebApp.openLink) {
      try {
        WebApp.openLink(url)
      } catch (error) {
        // Если метод не поддерживается, используем fallback
        console.warn('WebApp.openLink не поддерживается:', error)
        window.open(url, '_blank')
      }
    } else {
      window.open(url, '_blank')
    }
  }

  const ready = () => {
    if (typeof window !== 'undefined' && WebApp.ready) {
      try {
        WebApp.ready()
      } catch (error) {
        console.warn('WebApp.ready не поддерживается:', error)
      }
    }
  }

  const expand = () => {
    if (typeof window !== 'undefined' && WebApp.expand) {
      try {
        WebApp.expand()
      } catch (error) {
        console.warn('WebApp.expand не поддерживается:', error)
      }
    }
  }

  return (
    <TelegramContext.Provider
      value={{
        user,
        isReady,
        initData,
        sendData,
        showAlert,
        showConfirm,
        openLink,
        ready,
        expand,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
