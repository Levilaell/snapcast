'use client'

import { useState } from 'react'
import YouTubeInput from '@/components/YouTubeInput'
import ViralMoments from '@/components/ViralMoments'
import { videoApi, clipApi, Video, Clip } from '@/lib/api'

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [video, setVideo] = useState<Video | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingMomentIndex, setProcessingMomentIndex] = useState<number | null>(null)
  const [generatedClip, setGeneratedClip] = useState<Clip | null>(null)

  const handleSubmitUrl = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setVideo(null)
    setGeneratedClip(null)

    try {
      const videoData = await videoApi.create(url)
      setVideo(videoData)

      if (videoData.status === 'failed') {
        setError(videoData.error_message || 'Failed to analyze video')
      }
    } catch (err: any) {
      console.error('Error analyzing video:', err)
      setError(err.response?.data?.error || 'An error occurred while analyzing the video')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectMoment = async (momentIndex: number) => {
    if (!video) return

    setProcessingMomentIndex(momentIndex)
    setError(null)
    setGeneratedClip(null)

    try {
      const clip = await clipApi.create(video.id, momentIndex)
      setGeneratedClip(clip)
    } catch (err: any) {
      console.error('Error generating clip:', err)
      setError(err.response?.data?.error || 'An error occurred while generating the clip')
    } finally {
      setProcessingMomentIndex(null)
    }
  }

  const handleDownloadClip = async () => {
    if (!generatedClip) return

    try {
      const { download_url, filename } = await clipApi.getDownloadUrl(generatedClip.id)

      // Create download link
      const link = document.createElement('a')
      link.href = download_url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error('Error downloading clip:', err)
      setError('An error occurred while downloading the clip')
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="space-y-12">
        <YouTubeInput onSubmit={handleSubmitUrl} isLoading={isAnalyzing} />

        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
              <p className="font-semibold mb-1">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {video && video.status === 'completed' && video.viral_moments_sorted.length > 0 && (
          <ViralMoments
            videoTitle={video.title}
            thumbnailUrl={video.thumbnail_url}
            moments={video.viral_moments_sorted}
            onSelectMoment={handleSelectMoment}
            processingMomentIndex={processingMomentIndex}
          />
        )}

        {generatedClip && generatedClip.status === 'completed' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-400">Clip Gerado com Sucesso!</h3>
                  </div>
                  <p className="text-gray-300 mb-1">{generatedClip.title}</p>
                  <p className="text-sm text-gray-400">{generatedClip.description}</p>
                </div>
                <button
                  onClick={handleDownloadClip}
                  className="ml-4 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Download Clip
                </button>
              </div>
            </div>
          </div>
        )}

        {generatedClip && generatedClip.status !== 'completed' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="flex-1">
                  <p className="text-blue-400 font-semibold">Processando clip...</p>
                  <p className="text-sm text-gray-400">
                    {generatedClip.status === 'downloading' && 'Baixando segmento do vídeo...'}
                    {generatedClip.status === 'processing' && 'Criando clip vertical com legendas...'}
                    {generatedClip.progress_percentage > 0 && ` (${generatedClip.progress_percentage}%)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
