import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Loader2, Play, Eye, ExternalLink, Save } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

import type { Clip } from "@/services/api";

const ClipGeneration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clip, setClip] = useState<Clip | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Editable fields
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Busca inicial do clip
  const { data: initialClip, isLoading } = useQuery({
    queryKey: ["clip", id],
    queryFn: () => api.getClip(Number(id)),
    enabled: !!id,
  });

  // Get video info
  const { data: video } = useQuery({
    queryKey: ["video", initialClip?.video],
    queryFn: () => api.getVideo(initialClip!.video),
    enabled: !!initialClip?.video,
  });

  // Inicia polling quando o clip é carregado
  useEffect(() => {
    if (!initialClip) return;

    setClip(initialClip);
    setEditedTitle(initialClip.title || "");
    setEditedDescription(initialClip.description || "");

    // Se já estiver completo ou falhou, não faz polling
    if (initialClip.status === 'completed' || initialClip.status === 'failed') {
      if (initialClip.status === 'completed') {
        toast.success("Clip gerado com sucesso!");
      } else if (initialClip.status === 'failed') {
        toast.error("Erro ao gerar clip");
      }
      return;
    }

    // Inicia polling
    const pollClip = async () => {
      try {
        await api.pollClipStatus(Number(id), (updatedClip) => {
          setClip(updatedClip);
        });
      } catch (error: any) {
        toast.error(error.message || "Erro no polling");
      }
    };

    pollClip();
  }, [initialClip, id]);

  // Track changes
  useEffect(() => {
    if (clip) {
      const titleChanged = editedTitle !== (clip.title || "");
      const descChanged = editedDescription !== (clip.description || "");
      setHasChanges(titleChanged || descChanged);
    }
  }, [editedTitle, editedDescription, clip]);

  const handleDownload = () => {
    if (!clip) return;
    const downloadUrl = api.getClipDownloadUrl(clip.id);
    window.open(downloadUrl, '_blank');
    toast.success("Download iniciado!");
  };

  const handleBackToEpisode = () => {
    if (clip && clip.video) {
      navigate(`/episode/${clip.video}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSaveChanges = () => {
    toast.info("Funcionalidade de salvar em breve!");
    setHasChanges(false);
  };

  const handleOpenYouTube = () => {
    if (video?.youtube_url && clip) {
      const url = `${video.youtube_url}&t=${Math.floor(clip.start_time)}s`;
      window.open(url, '_blank');
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!clip) return null;

    switch (clip.status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm rounded-full font-medium">Pronto</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm rounded-full font-medium">Processando</span>;
      case 'downloading':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm rounded-full font-medium">Baixando</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-500/10 text-red-500 text-sm rounded-full font-medium">Falhou</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm rounded-full font-medium">Pendente</span>;
    }
  };

  if (isLoading || !clip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const isCompleted = clip.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToEpisode}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Editor de Clip</h1>
                <p className="text-sm text-muted-foreground">{clip.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {getStatusBadge()}

              {isCompleted && (
                <>
                  <Button
                    variant="outline"
                    onClick={togglePlay}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Player */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {isCompleted ? (
                <div className="relative aspect-[9/16] max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={api.getClipStreamUrl(clip.id)}
                    className="w-full h-full object-contain"
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    {!isPlaying && (
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    )}
                  </div>

                  {/* Time Display */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 rounded text-sm text-white">
                    {formatTime(clip.duration)}
                  </div>
                </div>
              ) : (
                <div className="aspect-[9/16] max-w-md mx-auto bg-muted rounded-lg flex flex-col items-center justify-center p-8">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground text-center mb-2">
                    {clip.status === 'downloading' && 'Baixando vídeo...'}
                    {clip.status === 'processing' && 'Criando clip vertical...'}
                    {clip.status === 'pending' && 'Iniciando processamento...'}
                  </p>
                  <div className="w-full max-w-xs">
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${clip.progress_percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {clip.progress_percentage}% concluído
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Edit Panel */}
          <div className="space-y-6">
            {/* Edit Title & Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Editar Clip</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Título</Label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Digite o título do clip"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Descrição</Label>
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Digite a descrição do clip"
                    rows={3}
                  />
                </div>

                {hasChanges && (
                  <Button
                    onClick={handleSaveChanges}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                )}
              </div>
            </Card>

            {/* Clip Information */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Duração:</span>
                  <p className="font-medium">{formatTime(clip.duration)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Início:</span>
                  <p className="font-medium">{formatTime(clip.start_time)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fim:</span>
                  <p className="font-medium">{formatTime(clip.end_time)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Legendas:</span>
                  <p className="font-medium">{clip.include_subtitles ? 'Ativadas' : 'Desativadas'}</p>
                </div>
              </div>

              {video && (
                <Button
                  onClick={handleOpenYouTube}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver no YouTube
                </Button>
              )}
            </Card>

            {/* Transcription */}
            {clip.subtitle_text && (
              <Card className="p-6">
                <h3 className="text-sm font-semibold mb-4">Transcrição</h3>
                <div className="bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm leading-relaxed italic">
                    "{clip.subtitle_text}"
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipGeneration;
