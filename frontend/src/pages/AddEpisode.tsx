import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Youtube, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/Layout";

const AddEpisode = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Por favor, insira um link do YouTube válido");
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast.error("Link do YouTube inválido. Use um formato como: https://www.youtube.com/watch?v=VIDEO_ID");
      return;
    }

    setIsAnalyzing(true);

    try {
      toast.info("Iniciando análise do vídeo...");

      // Cria o vídeo no backend
      const video = await api.createVideo(youtubeUrl);

      toast.success("Vídeo enviado para análise!");

      // Redireciona para a página de detalhes
      navigate(`/episode/${video.id}`);

    } catch (error: any) {
      console.error("Error analyzing video:", error);
      toast.error(error.message || "Erro ao analisar vídeo. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>

            <h1 className="text-4xl font-bold mb-2">Adicionar Episódio</h1>
            <p className="text-muted-foreground">
              Cole o link de um vídeo do YouTube para começar a análise
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Link do YouTube
            </CardTitle>
            <CardDescription>
              Insira a URL completa do vídeo (ex: https://www.youtube.com/watch?v=...)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL do Vídeo</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isAnalyzing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnalyzing && youtubeUrl.trim()) {
                    handleAnalyze();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !youtubeUrl.trim()}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando vídeo...
                </>
              ) : (
                "Analisar Vídeo"
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold">O que acontece ao analisar:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Download e extração do áudio do YouTube</li>
                <li>Transcrição automática com Whisper AI</li>
                <li>Análise de IA para identificar momentos virais</li>
                <li>Detecção de histórias, humor e conteúdo impactante</li>
                <li>Geração de scores de viralidade</li>
              </ul>
              <p className="text-xs italic mt-4">
                ⏱️ O processo pode levar alguns minutos dependendo do tamanho do vídeo
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddEpisode;
