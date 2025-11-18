import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, TrendingUp, Video, ExternalLink, Sparkles, Zap, Play, Scissors } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

const EpisodeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log('EpisodeDetails - ID from params:', id);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      console.log('Fetching video with ID:', id, 'as number:', Number(id));
      const data = await api.getVideo(Number(id));
      console.log('Video data:', data);
      console.log('Video viral_moments_sorted:', data.viral_moments_sorted);
      return data;
    },
    enabled: !!id,
  });

  const { data: clips } = useQuery({
    queryKey: ["clips", id],
    queryFn: async () => {
      const data = await api.getClips(Number(id));
      console.log('Clips data:', data);
      return data;
    },
    enabled: !!id,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (seconds: number) => {
    return formatDuration(seconds);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-500/10 border-green-500/20";
    if (score >= 70) return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
    return "text-orange-600 bg-orange-500/10 border-orange-500/20";
  };

  const getViralScore = (moment: any) => {
    return moment.viral_score || moment.virality_score || 0;
  };

  const handleViewClip = async (momentIndex: number) => {
    if (!video) return;

    try {
      // Cria ou busca o clip existente no backend
      const clip = await api.createClip(video.id, momentIndex);

      // Navega para a página do clip
      navigate(`/clip/${clip.id}`);

    } catch (error: any) {
      toast.error(error.message || "Erro ao acessar clip");
    }
  };

  if (videoLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Video className="w-8 h-8 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Episódio não encontrado</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
        {/* Episode Info */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            {video.thumbnail_url && (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-48 h-auto rounded-lg shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(video.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {video.viral_moments_sorted?.length || 0} momentos virais
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {clips?.length || 0} clips gerados
                </span>
              </div>
              {video.youtube_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(video.youtube_url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver no YouTube
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {video.status === 'processing' && (
          <Card className="p-6 mb-8 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
              <div>
                <h3 className="font-semibold text-blue-600">Analisando episódio...</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa IA está identificando os momentos mais virais. Isso pode levar alguns minutos.
                </p>
              </div>
            </div>
          </Card>
        )}

        {video.status === 'failed' && (
          <Card className="p-6 mb-8 bg-red-500/5 border-red-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-600">Erro no processamento</h3>
                <p className="text-sm text-muted-foreground">
                  {video.error_message || "Ocorreu um erro ao analisar o episódio."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Clips Grid */}
        {video.status === 'completed' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Clips Gerados
              </h2>
              <div className="text-sm text-muted-foreground">
                {video.viral_moments_sorted?.length || 0} clips disponíveis
              </div>
            </div>

            {video.viral_moments_sorted && video.viral_moments_sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {video.viral_moments_sorted.map((moment, index) => {
                  console.log(`Moment ${index}:`, moment);
                  const score = getViralScore(moment);
                  // Find clip by moment_index first, then by start_time as fallback
                  const correspondingClip = clips?.find(c =>
                    c.moment_index === index || Math.abs(c.start_time - moment.start_time) < 1
                  );
                  console.log(`Corresponding clip for moment ${index}:`, correspondingClip);

                  return (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition group cursor-pointer">
                      {/* Thumbnail */}
                      <div
                        className="relative aspect-video bg-secondary"
                        onClick={() => handleViewClip(index)}
                      >
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={`Clip ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-black ml-1" fill="black" />
                          </div>
                        </div>

                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {moment.duration}s
                        </div>

                        {/* Rank badge */}
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-bold">
                          #{index + 1}
                        </div>

                        {/* Clip title overlay */}
                        {correspondingClip?.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                            <p className="text-white text-sm font-semibold line-clamp-2">
                              {correspondingClip.title}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        {/* Clip Title */}
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
                          {correspondingClip?.title || moment.transcript || moment.reason || `Clip ${index + 1}`}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{moment.duration}s</span>
                          </div>
                          {correspondingClip && (
                            <span className={`px-2 py-0.5 rounded ${
                              correspondingClip.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                              correspondingClip.status === 'processing' ? 'bg-blue-500/10 text-blue-600' :
                              'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {correspondingClip.status === 'completed' ? 'Pronto' :
                               correspondingClip.status === 'processing' ? 'Processando' :
                               'Pendente'}
                            </span>
                          )}
                        </div>

                        {/* Progress bar for processing clips */}
                        {correspondingClip?.status === 'processing' && (
                          <div className="mb-3">
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${correspondingClip.progress_percentage || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `${video.youtube_url}&t=${Math.floor(moment.start_time)}s`;
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            onClick={() => handleViewClip(index)}
                          >
                            Ver Clip
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Scissors className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum clip ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Os momentos virais estão sendo identificados
                </p>
              </Card>
            )}
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default EpisodeDetails;
