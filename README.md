# 🎙️ SnapCast - Gerador de Clips Virais para Podcasts

Plataforma para transformar episódios de podcast em clips virais para redes sociais usando IA.

## 📁 Estrutura do Projeto

```
snapcast/
├── backend/           # Django API
│   ├── clips/         # App de clips
│   ├── videos/        # App de vídeos/episódios
│   └── manage.py
│
├── frontend/          # Vite + React + Shadcn UI (Lovable)
│   ├── src/
│   │   ├── pages/              # Páginas principais
│   │   │   ├── Landing.tsx     # Landing page
│   │   │   ├── Dashboard.tsx   # Dashboard principal
│   │   │   ├── AddEpisode.tsx  # Upload de episódio
│   │   │   ├── EpisodeDetails.tsx  # Momentos virais
│   │   │   └── ClipGeneration.tsx  # Geração de clip (NOVA)
│   │   ├── services/
│   │   │   └── api.ts          # Cliente API para Django
│   │   └── components/         # Componentes Shadcn UI
│   └── .env.local              # URL da API
│
└── README.md          # Este arquivo
```

## 🚀 Como Rodar

### Backend (Django)
```bash
cd backend
python manage.py runserver
# Roda em http://localhost:8000
```

### Frontend (Vite)
```bash
cd frontend
npm install  # Primeira vez
npm run dev
# Roda em http://localhost:8080
```

## 🌐 URLs

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000/api

## 📋 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/dashboard` | Lista de episódios |
| `/add-episode` | Upload novo episódio (YouTube URL) |
| `/episode/:id` | Momentos virais detectados |
| `/clip/:id` | Acompanhamento da geração do clip |

## 🎬 Fluxo Principal

1. **Upload**: Usuário cola URL do YouTube em `/add-episode`
2. **Análise**: Backend analisa e detecta momentos virais
3. **Momentos**: Visualiza momentos em `/episode/:id`
4. **Gerar**: Clica "Gerar Clip" em um momento
5. **Progresso**: Acompanha em tempo real em `/clip/:id`
6. **Download**: Baixa o MP4 quando completo

## 🛠️ Tecnologias

### Backend
- Django 5.1.4
- Django REST Framework
- yt-dlp (download de vídeos)
- FFmpeg (processamento de vídeo)
- Whisper (transcrição)

### Frontend
- Vite 5.4
- React 18
- TypeScript
- Shadcn UI (Radix + Tailwind)
- TanStack Query
- React Router

## ⚙️ Variáveis de Ambiente

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:8000/api
```

## 📊 API Endpoints

### Vídeos
- `GET /api/videos/` - Lista todos os vídeos
- `POST /api/videos/` - Cria novo vídeo (YouTube URL)
- `GET /api/videos/:id/` - Detalhes do vídeo

### Clips
- `GET /api/clips/` - Lista todos os clips
- `POST /api/clips/` - Cria novo clip
- `GET /api/clips/:id/` - Status do clip (polling)
- `GET /api/clips/:id/download/` - Download do MP4

## 🎯 Próximos Passos

- [ ] Implementar autenticação (Django + JWT)
- [ ] Adicionar templates de caption
- [ ] Melhorar detecção de momentos virais
- [ ] Adicionar compartilhamento social
- [ ] Dashboard de analytics

## 📝 Documentação Adicional

- `INTEGRATION_PLAN.md` - Plano de integração frontend/backend
- `FLUXO_GERAR_CLIP.md` - Documentação detalhada do fluxo de geração
- `SETUP_INSTRUCTIONS.md` - Instruções de setup completas

## 🆘 Troubleshooting

### CORS Error
Certifique-se de que `CORS_ALLOWED_ORIGINS` no Django inclui `http://localhost:8080`

### API não conecta
Verifique se `VITE_API_URL` em `.env.local` está correto

### Vídeo não baixa
Verifique se `yt-dlp` está instalado e atualizado

## 📄 Licença

Propriedade privada - Todos os direitos reservados
