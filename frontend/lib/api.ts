import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Video {
  id: number
  youtube_url: string
  youtube_id: string
  title: string
  duration: number
  thumbnail_url: string
  transcript: string
  transcript_with_timestamps: any[]
  viral_moments: ViralMoment[]
  viral_moments_sorted: ViralMoment[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string
  created_at: string
  updated_at: string
}

export interface ViralMoment {
  start_time: number
  end_time: number
  duration: number
  title: string
  description: string
  viral_score: number
  viral_reason: string
  category: 'historia' | 'humor' | 'conselho' | 'polemica' | 'revelacao'
}

export interface Clip {
  id: number
  video: Video
  title: string
  description: string
  start_time: number
  end_time: number
  duration: number
  viral_score: number
  viral_reason: string
  original_clip_path: string
  processed_clip_path: string
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed'
  error_message: string
  progress_percentage: number
  created_at: string
  updated_at: string
}

export const videoApi = {
  create: async (youtubeUrl: string): Promise<Video> => {
    const response = await api.post<Video>('/videos/', {
      youtube_url: youtubeUrl,
    })
    return response.data
  },

  get: async (id: number): Promise<Video> => {
    const response = await api.get<Video>(`/videos/${id}/`)
    return response.data
  },

  list: async (): Promise<Video[]> => {
    const response = await api.get<Video[]>('/videos/')
    return response.data
  },

  reanalyze: async (id: number): Promise<Video> => {
    const response = await api.post<Video>(`/videos/${id}/reanalyze/`)
    return response.data
  },
}

export const clipApi = {
  create: async (videoId: number, momentIndex: number): Promise<Clip> => {
    const response = await api.post<Clip>('/clips/', {
      video_id: videoId,
      moment_index: momentIndex,
    })
    return response.data
  },

  get: async (id: number): Promise<Clip> => {
    const response = await api.get<Clip>(`/clips/${id}/`)
    return response.data
  },

  list: async (): Promise<Clip[]> => {
    const response = await api.get<Clip[]>('/clips/')
    return response.data
  },

  getDownloadUrl: async (id: number): Promise<{ download_url: string; filename: string }> => {
    const response = await api.get(`/clips/${id}/download/`)
    return response.data
  },
}

export default api
