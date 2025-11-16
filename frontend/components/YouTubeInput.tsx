'use client'

import { useState } from 'react'

interface YouTubeInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function YouTubeInput({ onSubmit, isLoading }: YouTubeInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Transforme seu Conteúdo em Clips Virais
          </h2>
          <p className="text-gray-400">
            Cole o link do seu vídeo do YouTube e deixe a IA encontrar os melhores momentos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando vídeo...
              </span>
            ) : (
              'Gerar Clips Virais'
            )}
          </button>
        </form>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">AI</div>
            <div className="text-xs text-gray-400">Análise Inteligente</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-2xl font-bold text-secondary">9:16</div>
            <div className="text-xs text-gray-400">Formato Vertical</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">Auto</div>
            <div className="text-xs text-gray-400">Legendas</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-2xl font-bold text-secondary">1-Click</div>
            <div className="text-xs text-gray-400">Download</div>
          </div>
        </div>
      </div>
    </div>
  )
}
