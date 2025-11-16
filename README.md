# SnapCast

**Transforme vídeos longos em clips virais com IA**

SnapCast é uma ferramenta de clipping inteligente e automatizada para criadores de conteúdo. Insira um link do YouTube e obtenha 5-10 clips verticais (9:16) prontos para Reels, Shorts e TikTok.

## Funcionalidades

- **Análise Inteligente com IA**: Usa Gemini AI para identificar momentos virais automaticamente
- **Transcrição Automática**: Extrai legendas do YouTube com timestamps
- **Scoring Viral**: Pontua cada momento baseado em potencial viral (histórias, humor, conselhos, polêmicas)
- **Clips Verticais**: Converte automaticamente para formato 9:16
- **Legendas Animadas**: Adiciona legendas dinâmicas queimadas no vídeo
- **Download Rápido**: Um clique para baixar o clip processado

## Arquitetura

### Backend (Django + DRF)
- **YouTube Data API**: Extrai metadados e informações do vídeo
- **youtube-transcript-api**: Obtém transcrições com timestamps
- **Gemini API**: Analisa conteúdo e identifica momentos virais
- **yt-dlp**: Baixa segmentos específicos do vídeo
- **FFmpeg**: Processa vídeo (crop vertical, legendas, rendering)

### Frontend (Next.js + TypeScript)
- Interface moderna e responsiva
- Tailwind CSS para estilização
- Axios para comunicação com API

## Pré-requisitos

- **Python** 3.10+
- **Node.js** 18+
- **FFmpeg** instalado no sistema
- **yt-dlp** instalado no sistema
- **Chaves de API**:
  - YouTube Data API Key
  - Gemini API Key

## Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd snapcast
```

### 2. Configure o Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cp .env.example .env

# Editar .env e adicionar suas API keys:
# YOUTUBE_API_KEY=sua_chave_aqui
# GEMINI_API_KEY=sua_chave_aqui

# Rodar migrações
python manage.py makemigrations
python manage.py migrate

# Criar superuser (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

O backend estará rodando em `http://localhost:8000`

### 3. Configure o Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
cp .env.local.example .env.local

# Editar .env.local se necessário (padrão já aponta para localhost:8000)

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## Como Usar

1. **Acesse** `http://localhost:3000`
2. **Cole** o link de um vídeo do YouTube
3. **Aguarde** a análise (pode levar 30-60 segundos dependendo do tamanho do vídeo)
4. **Veja** os 5-10 momentos virais identificados pela IA
5. **Selecione** o momento que deseja transformar em clip
6. **Aguarde** o processamento (download + rendering)
7. **Baixe** o clip pronto para publicar

## APIs Disponíveis

### Videos

**POST /api/videos/**
```json
{
  "youtube_url": "https://youtube.com/watch?v=..."
}
```

**GET /api/videos/{id}/**

**GET /api/videos/**

**POST /api/videos/{id}/reanalyze/**

### Clips

**POST /api/clips/**
```json
{
  "video_id": 1,
  "moment_index": 0
}
```

**GET /api/clips/{id}/**

**GET /api/clips/**

**GET /api/clips/{id}/download/**

## Estrutura do Projeto

```
snapcast/
├── backend/
│   ├── snapcast_backend/      # Configurações Django
│   ├── videos/                # App de vídeos
│   │   ├── models.py         # Modelo Video
│   │   ├── views.py          # ViewSet de vídeos
│   │   ├── serializers.py    # Serializers
│   │   └── services.py       # YouTube & Gemini services
│   ├── clips/                 # App de clips
│   │   ├── models.py         # Modelo Clip
│   │   ├── views.py          # ViewSet de clips
│   │   ├── serializers.py    # Serializers
│   │   └── services.py       # Video processing service
│   ├── media/                 # Arquivos de mídia (clips gerados)
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Página inicial
│   │   └── globals.css       # Estilos globais
│   ├── components/
│   │   ├── YouTubeInput.tsx  # Input de URL
│   │   └── ViralMoments.tsx  # Lista de momentos
│   ├── lib/
│   │   └── api.ts            # Cliente API
│   └── package.json
│
└── README.md
```

## Obter API Keys

### YouTube Data API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Habilite "YouTube Data API v3"
4. Crie credenciais (API Key)
5. Copie a chave para `.env`

### Gemini API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API Key
3. Copie a chave para `.env`

## Instalação de Dependências do Sistema

### FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Baixe de [ffmpeg.org](https://ffmpeg.org/download.html)

### yt-dlp

```bash
pip install yt-dlp
```

## Melhorias Futuras (Pós-MVP)

- [ ] Processamento assíncrono com Celery
- [ ] Suporte a múltiplos formatos de saída
- [ ] Editor de clips (ajustar início/fim)
- [ ] Templates personalizados de marca
- [ ] Sistema de usuários e autenticação
- [ ] Histórico de clips gerados
- [ ] Integração com redes sociais (publicação direta)
- [ ] Suporte a vídeos de outras plataformas

## Tecnologias Utilizadas

### Backend
- Django 5.0
- Django REST Framework
- Google Generative AI (Gemini)
- YouTube Data API
- youtube-transcript-api
- yt-dlp
- FFmpeg

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Licença

MIT

## Suporte

Para reportar bugs ou solicitar funcionalidades, abra uma issue no repositório.
