'use client'

import { ViralMoment } from '@/lib/api'
import Image from 'next/image'

interface ViralMomentsProps {
  videoTitle: string
  thumbnailUrl: string
  moments: ViralMoment[]
  onSelectMoment: (index: number) => void
  processingMomentIndex: number | null
}

const categoryColors = {
  historia: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  humor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  conselho: 'bg-green-500/20 text-green-400 border-green-500/50',
  polemica: 'bg-red-500/20 text-red-400 border-red-500/50',
  revelacao: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
}

const categoryLabels = {
  historia: 'História',
  humor: 'Humor',
  conselho: 'Conselho',
  polemica: 'Polêmica',
  revelacao: 'Revelação',
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function ViralMoments({
  videoTitle,
  thumbnailUrl,
  moments,
  onSelectMoment,
  processingMomentIndex,
}: ViralMomentsProps) {
  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Nenhum momento viral encontrado.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-start gap-6">
            <div className="relative w-48 h-27 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={thumbnailUrl}
                alt={videoTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{videoTitle}</h3>
              <p className="text-gray-400">
                {moments.length} momentos virais encontrados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moments.map((moment, index) => (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-gray-600">
                  #{index + 1}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    categoryColors[moment.category] || categoryColors.historia
                  }`}
                >
                  {categoryLabels[moment.category] || moment.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">
                  {moment.viral_score}
                </div>
                <div className="text-xs text-gray-400">score</div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-2">{moment.title}</h4>
            <p className="text-gray-400 text-sm mb-4">{moment.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
                <span className="mx-2">•</span>
                {Math.floor(moment.duration)}s
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-400 italic">{moment.viral_reason}</p>
            </div>

            <button
              onClick={() => onSelectMoment(index)}
              disabled={processingMomentIndex !== null}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processingMomentIndex === index ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Gerar Clip'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
