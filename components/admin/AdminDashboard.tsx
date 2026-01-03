'use client'

import { useState, useEffect } from 'react'
import { Users, Music, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { AdminStats } from '@/components/admin/AdminStats'
import { AdminGenerations } from '@/components/admin/AdminGenerations'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminSettings } from '@/components/admin/AdminSettings'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'generations' | 'users' | 'settings'>('stats')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGenerations: 0,
    completedGenerations: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Админ-панель Vinyl</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего пользователей</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего генераций</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalGenerations}</p>
              </div>
              <Music className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Завершено</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.completedGenerations}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Доход (Stars)</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalRevenue}</p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {[
            { id: 'stats', label: 'Статистика' },
            { id: 'generations', label: 'Генерации' },
            { id: 'users', label: 'Пользователи' },
            { id: 'settings', label: 'Настройки' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'generations' && <AdminGenerations />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}
