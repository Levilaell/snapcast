import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, TrendingUp, Video, ExternalLink, Sparkles, Zap } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

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
      return data;
    },
    enabled: !!id,
  });

  const { data: clips } = useQuery({
    queryKey: ["clips", id],
    queryFn: () => api.getClips(Number(id)),
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
      const clip = await api.createClip(video.id, momentIndex, true);

      // Navega para a página do clip
      navigate(`/clip/${clip.id}`);

    } catch (error: any) {
      toast.error(error.message || "Erro ao acessar clip");
    }
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Video className="w-8 h-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Episódio não encontrado</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

        {/* Viral Moments */}
        {video.status === 'completed' && video.viral_moments_sorted && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              <Sparkles className="w-6 h-6 inline mr-2 text-primary" />
              Momentos Virais Identificados
            </h2>

            {video.viral_moments_sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {video.viral_moments_sorted.map((moment, index) => {
                  const score = getViralScore(moment);
                  return (
                  <Card
                    key={index}
                    className={`p-6 hover:shadow-lg transition-shadow border-2 ${getScoreColor(score)}`}
                  >
                    {/* Score Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold">#{index + 1}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(moment.start_time)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-lg font-bold">{score}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-muted-foreground mb-3">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Duração: ~{moment.duration}s
                    </div>

                    {/* Reason */}
                    {moment.reason && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                          Por que é viral:
                        </h4>
                        <p className="text-sm line-clamp-3">{moment.reason}</p>
                      </div>
                    )}

                    {/* Transcript Preview */}
                    {moment.transcript && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm italic line-clamp-3">
                          "{moment.transcript}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const url = `${video.youtube_url}&t=${Math.floor(moment.start_time)}s`;
                          window.open(url, '_blank');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleViewClip(index)}
                        className="flex-1"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ver Clip
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum momento viral foi identificado neste episódio.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Generated Clips Section */}
        {clips && clips.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              <Video className="w-6 h-6 inline mr-2 text-primary" />
              Clips Gerados ({clips.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clips.map((clip) => (
                <Card key={clip.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/clip/${clip.id}`)}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{clip.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      clip.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                      clip.status === 'processing' ? 'bg-blue-500/10 text-blue-600' :
                      clip.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                      'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {clip.status === 'completed' ? 'Pronto' :
                       clip.status === 'processing' ? 'Processando' :
                       clip.status === 'failed' ? 'Falhou' :
                       'Pendente'}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    {formatTimestamp(clip.start_time)} - {formatTimestamp(clip.end_time)}
                  </div>

                  {clip.status === 'processing' && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${clip.progress_percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        {clip.progress_percentage}%
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeDetails;
