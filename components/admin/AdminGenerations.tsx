'use client'

import { useState, useEffect } from 'react'

interface Generation {
  id: string
  description: string
  status: string
  createdAt: string
  user: {
    firstName: string
    username: string
  }
}

export function AdminGenerations() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/generations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations || [])
      }
    } catch (error) {
      console.error('Error fetching generations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-500'
      case 'FAILED':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  if (loading) {
    return <div className="text-gray-400">Загрузка...</div>
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Все генерации</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {generations.map((gen) => (
              <tr key={gen.id} className="hover:bg-gray-900/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {gen.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                  {gen.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {gen.user.firstName} (@{gen.user.username})
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(gen.status)}`}>
                  {gen.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(gen.createdAt).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
