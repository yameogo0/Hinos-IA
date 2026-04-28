'use client'

import { useState } from 'react'
import Chatbot from '@/components/Chatbot'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="font-bold text-xl text-gray-800">Hinos IA</span>
          </div>
          <div className="text-sm text-gray-500">
            🌍 Français • Português • English
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Hinos IA
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          🌍 Agriculture • Élevage • Pisciculture • Transformation
        </p>
        <p className="text-gray-500">
          🇫🇷 Français | 🇵🇹 Português | 🇬🇧 English
        </p>
      </section>

      <div className="container mx-auto px-6 pb-12 max-w-4xl">
        <Chatbot />
      </div>
    </main>
  )
}
