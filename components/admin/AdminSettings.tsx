'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'

interface Setting {
  key: string
  value: string
  description: string
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, value: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })
      if (response.ok) {
        alert('Настройка сохранена')
        fetchSettings()
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Ошибка при сохранении')
    }
  }

  if (loading) {
    return <div className="text-gray-400">Загрузка...</div>
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-6">Настройки приложения</h2>
      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="border-b border-gray-700 pb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {setting.key}
            </label>
            <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={setting.value}
                onChange={(e) => {
                  setSettings(
                    settings.map((s) =>
                      s.key === setting.key ? { ...s, value: e.target.value } : s
                    )
                  )
                }}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                onClick={() => handleSave(setting.key, setting.value)}
                size="sm"
              >
                Сохранить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
