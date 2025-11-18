import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Youtube, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface YouTubePublishModalProps {
  clipId: number;
  clipTitle: string;
  clipDescription?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const YouTubePublishModal = ({
  clipId,
  clipTitle,
  clipDescription,
  open,
  onOpenChange,
}: YouTubePublishModalProps) => {
  const [title, setTitle] = useState(clipTitle);
  const [description, setDescription] = useState(clipDescription || "");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "unlisted" | "private">("unlisted");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleConnectYouTube = async () => {
    try {
      // Abre janela de OAuth do YouTube
      const authUrl = await api.getYouTubeAuthUrl();
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'YouTube Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Escuta mensagem de callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'youtube-auth-success') {
          setIsConnected(true);
          toast.success("Conta do YouTube conectada!");
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar com YouTube");
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("uploading");
    setUploadProgress(0);

    try {
      // Simula progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const result = await api.publishToYouTube(clipId, {
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        privacy,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setPublishStatus("success");
      setYoutubeUrl(result.youtube_url);
      toast.success("Vídeo publicado no YouTube!");

    } catch (error: any) {
      setPublishStatus("error");
      toast.error(error.message || "Erro ao publicar no YouTube");
    } finally {
      setIsPublishing(false);
    }
  };

  const resetModal = () => {
    setPublishStatus("idle");
    setUploadProgress(0);
    setYoutubeUrl("");
  };

  const handleClose = () => {
    if (!isPublishing) {
      resetModal();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            Publicar no YouTube
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes do vídeo e publique diretamente no YouTube
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          // YouTube Connection Step
          <div className="py-8">
            <Card className="p-6 text-center">
              <Youtube className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conecte sua conta do YouTube</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Para publicar vídeos, você precisa autorizar o SnapCast a acessar seu canal do YouTube
              </p>
              <Button onClick={handleConnectYouTube} className="bg-red-500 hover:bg-red-600">
                <Youtube className="w-4 h-4 mr-2" />
                Conectar com YouTube
              </Button>
            </Card>
          </div>
        ) : publishStatus === "success" ? (
          // Success State
          <div className="py-8">
            <Card className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vídeo publicado com sucesso!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Seu vídeo foi enviado para o YouTube e está disponível
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(youtubeUrl, '_blank')}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  Ver no YouTube
                </Button>
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </Card>
          </div>
        ) : publishStatus === "error" ? (
          // Error State
          <div className="py-8">
            <Card className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao publicar</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ocorreu um erro ao enviar o vídeo. Tente novamente.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
                <Button onClick={() => { resetModal(); }}>
                  Tentar Novamente
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          // Publish Form
          <>
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="youtube-title">Título *</Label>
                <Input
                  id="youtube-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do vídeo"
                  maxLength={100}
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="youtube-description">Descrição</Label>
                <Textarea
                  id="youtube-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Digite a descrição do vídeo"
                  rows={4}
                  maxLength={5000}
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">{description.length}/5000 caracteres</p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="youtube-tags">Tags</Label>
                <Input
                  id="youtube-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">Separe as tags por vírgula</p>
              </div>

              {/* Privacy */}
              <div className="space-y-2">
                <Label htmlFor="youtube-privacy">Privacidade</Label>
                <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)} disabled={isPublishing}>
                  <SelectTrigger id="youtube-privacy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="unlisted">Não listado</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {privacy === 'public' && 'Todos podem encontrar e assistir'}
                  {privacy === 'unlisted' && 'Somente quem tiver o link pode assistir'}
                  {privacy === 'private' && 'Somente você pode ver'}
                </p>
              </div>

              {/* Upload Progress */}
              {publishStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Enviando para o YouTube...</span>
                    <span className="font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
                Cancelar
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !title.trim()}
                className="bg-red-500 hover:bg-red-600"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4 mr-2" />
                    Publicar no YouTube
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
