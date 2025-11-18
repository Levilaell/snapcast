import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Upload, Play, Sparkles, TrendingUp, Video as VideoIcon, Clock, Scissors, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const averageClipDuration = allClips && allClips.length > 0
    ? Math.floor(allClips.reduce((acc, clip) => acc + (clip.end_time - clip.start_time), 0) / allClips.length)
    : 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      toast.success("Episódio deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar episódio");
    },
  });

  const handleDelete = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja deletar este episódio?")) {
      deleteMutation.mutate(videoId);
    }
  };

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
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatDuration(averageClipDuration)}
            </div>
            <div className="text-sm text-muted-foreground">Duração Média dos Clips</div>
          </Card>
        </div>

        {/* Episodes Section Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Episódios</h1>
            <p className="text-muted-foreground">Adicione vídeos do YouTube para análise</p>
          </div>
          <Button onClick={() => navigate('/add-episode')} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Episódio
          </Button>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos && videos.length > 0 && videos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition group cursor-pointer">
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-secondary"
                onClick={() => navigate(`/episode/${video.id}`)}
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" fill="black" />
                  </div>
                </div>
                {/* Duration badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, video.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                  title="Deletar episódio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    <span>{video.viral_moments_sorted?.length || 0} clips</span>
                  </div>
                  <span>{formatDate(video.created_at)}</span>
                </div>

                {video.status === 'completed' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/episode/${video.id}`);
                    }}
                  >
                    Ver Clips
                  </Button>
                ) : video.status === 'processing' ? (
                  <div className="text-xs text-blue-500 text-center py-2">
                    <Sparkles className="w-3 h-3 inline animate-spin mr-1" />
                    Processando...
                  </div>
                ) : (
                  <div className="text-xs text-center py-2">
                    {getStatusBadge(video.status)}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Upload New Episode Card */}
          <Card
            className="border-2 border-dashed border-muted-foreground/30 hover:border-orange-500/50 transition cursor-pointer flex items-center justify-center min-h-[300px]"
            onClick={() => navigate('/add-episode')}
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-1">Upload New Episode</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your audio file or click to browse
              </p>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {(!videos || videos.length === 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card
              className="border-2 border-dashed border-muted-foreground/30 hover:border-orange-500/50 transition cursor-pointer flex items-center justify-center min-h-[300px]"
              onClick={() => navigate('/add-episode')}
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-1">Upload New Episode</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your audio file or click to browse
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
