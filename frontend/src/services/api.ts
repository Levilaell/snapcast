const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Video {
  id: number;
  youtube_url: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  viral_moments_sorted: ViralMoment[];
  created_at: string;
  updated_at: string;
}

export interface ViralMoment {
  start_time: number; // Backend usa start_time
  timestamp?: number; // Compatibilidade
  duration: number;
  viral_score: number; // Backend usa viral_score, não virality_score
  virality_score?: number; // Mantém compatibilidade
  reason: string;
  transcript: string;
}

export interface Clip {
  id: number;
  video: Video;
  video_id: number;
  moment_index: number;
  start_time: number;
  end_time: number;
  duration: number;
  title: string;
  description: string;
  subtitle_text: string | null;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  output_file_path: string | null;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return undefined as T;
      }

      const text = await response.text();
      return text ? JSON.parse(text) : undefined as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Videos/Episodes
  async getVideos(): Promise<Video[]> {
    return this.request<Video[]>('/videos/');
  }

  async getVideo(id: number): Promise<Video> {
    return this.request<Video>(`/videos/${id}/`);
  }

  async createVideo(youtubeUrl: string): Promise<Video> {
    return this.request<Video>('/videos/', {
      method: 'POST',
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    });
  }

  async deleteVideo(id: number): Promise<void> {
    return this.request<void>(`/videos/${id}/`, {
      method: 'DELETE',
    });
  }

  // Clips
  async getClips(videoId?: number): Promise<Clip[]> {
    const endpoint = videoId ? `/clips/?video=${videoId}` : '/clips/';
    return this.request<Clip[]>(endpoint);
  }

  async getClip(id: number): Promise<Clip> {
    return this.request<Clip>(`/clips/${id}/`);
  }

  async createClip(
    videoId: number,
    momentIndex: number
  ): Promise<Clip> {
    return this.request<Clip>('/clips/', {
      method: 'POST',
      body: JSON.stringify({
        video_id: videoId,
        moment_index: momentIndex,
      }),
    });
  }

  async deleteClip(id: number): Promise<void> {
    return this.request<void>(`/clips/${id}/`, {
      method: 'DELETE',
    });
  }

  async updateClipTimes(
    id: number,
    startTime: number,
    endTime: number
  ): Promise<Clip> {
    return this.request<Clip>(`/clips/${id}/update_times/`, {
      method: 'POST',
      body: JSON.stringify({
        start_time: startTime,
        end_time: endTime,
      }),
    });
  }

  getClipDownloadUrl(id: number): string {
    return `${API_BASE_URL}/clips/${id}/download/`;
  }

  getClipStreamUrl(id: number): string {
    return `${API_BASE_URL}/clips/${id}/stream/`;
  }

  // Polling for status updates
  async pollVideoStatus(id: number, onUpdate: (video: Video) => void): Promise<Video> {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const video = await this.getVideo(id);
          onUpdate(video);

          if (video.status === 'completed' || video.status === 'failed') {
            clearInterval(interval);
            resolve(video);
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Polling timeout'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000); // Poll every 5 seconds
    });
  }

  async pollClipStatus(id: number, onUpdate: (clip: Clip) => void): Promise<Clip> {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const clip = await this.getClip(id);
          onUpdate(clip);

          if (clip.status === 'completed' || clip.status === 'failed') {
            clearInterval(interval);
            resolve(clip);
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Polling timeout'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000);
    });
  }
}

export const api = new ApiService();
