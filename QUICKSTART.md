# Guia de Início Rápido - SnapCast

## Instalação Rápida (5 minutos)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- Python 3.10+
- Node.js 18+
- FFmpeg
- yt-dlp

### 2. Backend Setup

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e adicione suas API keys

# Execute as migrações
python manage.py makemigrations
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```

### 3. Frontend Setup

Em outro terminal:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.local.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

### 4. Acesse a aplicação

Abra seu navegador em: `http://localhost:3000`

## Obtendo as API Keys

### YouTube Data API Key

1. Vá para: https://console.cloud.google.com/
2. Crie um novo projeto
3. Habilite "YouTube Data API v3"
4. Vá em Credenciais > Criar Credenciais > Chave de API
5. Copie a chave gerada

### Gemini API Key

1. Vá para: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### Configure no .env

```
YOUTUBE_API_KEY=sua_chave_youtube_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
```

## Testando o Sistema

1. Cole um link do YouTube (ex: podcast ou entrevista longa)
2. Aguarde a análise (30-90 segundos)
3. Veja os momentos virais sugeridos
4. Clique em "Gerar Clip" no momento desejado
5. Aguarde o processamento
6. Baixe o clip vertical pronto!

## Estrutura de Portas

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Django Admin: `http://localhost:8000/admin`

## Comandos Úteis

### Backend

```bash
# Criar superuser para acessar admin
python manage.py createsuperuser

# Ver logs em tempo real
python manage.py runserver --verbosity 2

# Rodar shell Django
python manage.py shell
```

### Frontend

```bash
# Build de produção
npm run build

# Rodar build de produção
npm start

# Verificar tipos TypeScript
npx tsc --noEmit
```

## Solução de Problemas

### Erro: "FFmpeg not found"
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Baixe de ffmpeg.org e adicione ao PATH
```

### Erro: "yt-dlp not found"
```bash
pip install yt-dlp
```

### Erro: "CORS error"
Verifique se:
- Backend está rodando na porta 8000
- Frontend está configurado com `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- CORS está habilitado no settings.py

### Erro: "Invalid API Key"
Verifique se:
- As chaves estão corretas no `.env`
- O arquivo `.env` está na pasta `backend/`
- Você reiniciou o servidor após adicionar as chaves

## Próximos Passos

Leia o [README.md](README.md) completo para:
- Documentação da API
- Arquitetura do sistema
- Melhorias futuras
- Contribuindo

## Suporte

Se encontrar problemas, verifique:
1. Logs do backend (terminal onde roda `python manage.py runserver`)
2. Console do navegador (F12)
3. Permissões de arquivo na pasta `media/`
