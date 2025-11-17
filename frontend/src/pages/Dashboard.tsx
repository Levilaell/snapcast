import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Upload, Play, Sparkles, TrendingUp, Video as VideoIcon, Clock, Scissors } from "lucide-react";
import { api } from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const data = await api.getVideos();
      console.log('Videos from API:', data);
      return data;
    },
  });

  const { data: allClips } = useQuery({
    queryKey: ["clips"],
    queryFn: () => api.getClips(),
  });

  const totalEpisodes = videos?.length || 0;
  const totalClips = allClips?.length || 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-500' },
      processing: { label: 'Processando', className: 'bg-blue-500/10 text-blue-500' },
      completed: { label: 'Concluído', className: 'bg-green-500/10 text-green-500' },
      failed: { label: 'Falhou', className: 'bg-red-500/10 text-red-500' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SnapCast</span>
          </div>
          <Button size="sm" onClick={() => navigate('/add-episode')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Episódio
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <VideoIcon className="w-8 h-8 text-primary" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalEpisodes}</div>
            <div className="text-sm text-muted-foreground">Episódios</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Scissors className="w-8 h-8 text-primary" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalClips}</div>
            <div className="text-sm text-muted-foreground">Clipes</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </Card>
        </div>

        {/* Episodes List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Episódios</h2>
          <Button onClick={() => navigate('/add-episode')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {videos && videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video) => {
              console.log('Video card - ID:', video.id, 'Type:', typeof video.id, 'Video:', video);
              return (
              <Card key={video.id} className="p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  console.log('Clicking video with ID:', video.id);
                  navigate(`/episode/${video.id}`);
                }}>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 bg-secondary rounded flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Play className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duration)}
                      </div>
                      <div>{formatDate(video.created_at)}</div>
                      <div>{video.viral_moments_sorted?.length || 0} momentos</div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      {getStatusBadge(video.status)}

                      {video.status === 'completed' && (
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/episode/${video.id}`);
                        }}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Ver Momentos
                        </Button>
                      )}

                      {video.status === 'processing' && (
                        <div className="text-sm text-blue-500">
                          <Sparkles className="w-4 h-4 inline animate-spin mr-2" />
                          Processando...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum episódio</h3>
            <p className="text-muted-foreground mb-4">Adicione seu primeiro episódio</p>
            <Button onClick={() => navigate('/add-episode')}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
