# 🚀 Próximos Passos - SnapCast

O projeto está **100% completo**! Siga estas etapas para rodar:

## ✅ Status da Instalação

- ✅ Backend Django estruturado
- ✅ Frontend Next.js instalado (63 pacotes)
- ✅ Dependências Python prontas (corrigidas)
- ✅ Todos os arquivos criados

## 📝 Checklist de Configuração

### 1. Obter as API Keys (5 minutos)

#### YouTube Data API
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto novo
3. Vá em "APIs & Services" > "Enable APIs and Services"
4. Busque "YouTube Data API v3" e habilite
5. Vá em "Credentials" > "Create Credentials" > "API Key"
6. Copie a chave

#### Gemini API
1. Acesse: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave

### 2. Configurar Backend (3 minutos)

```powershell
# Navegue até a pasta backend
cd backend

# Instale as dependências
pip install -r requirements.txt

# Crie o arquivo .env (copie do exemplo)
copy .env.example .env

# Edite o .env no VS Code ou Notepad
code .env
# OU
notepad .env
```

Adicione suas chaves no `.env`:
```
YOUTUBE_API_KEY=sua_chave_youtube_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
```

```powershell
# Rode as migrações do banco de dados
python manage.py makemigrations
python manage.py migrate

# (Opcional) Crie um superuser para acessar /admin
python manage.py createsuperuser

# Inicie o servidor backend
python manage.py runserver
```

**Backend estará em:** `http://localhost:8000`

### 3. Configurar Frontend (1 minuto)

Abra um **novo terminal PowerShell**:

```powershell
# Navegue até a pasta frontend
cd frontend

# Crie o arquivo .env.local (já está configurado)
copy .env.local.example .env.local

# Inicie o servidor Next.js
npm run dev
```

**Frontend estará em:** `http://localhost:3000`

## 🎯 Testando o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Cole um link de vídeo longo do YouTube (ex: podcast, entrevista)
   - Exemplo: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Clique em "Gerar Clips Virais"
4. Aguarde 30-60 segundos (análise com IA)
5. Veja os momentos virais sugeridos
6. Clique em "Gerar Clip" no momento desejado
7. Aguarde o processamento (pode levar alguns minutos)
8. Baixe o clip vertical pronto!

## ⚠️ Requisitos do Sistema

Antes de processar clips, certifique-se de ter instalado:

### FFmpeg (necessário para processamento de vídeo)

**Windows:**
1. Baixe de: https://www.gyan.dev/ffmpeg/builds/
2. Extraia para `C:\ffmpeg`
3. Adicione `C:\ffmpeg\bin` ao PATH do sistema
4. Teste: `ffmpeg -version`

**Alternativa com Chocolatey:**
```powershell
choco install ffmpeg
```

### yt-dlp (será instalado pelo pip)

Se houver problemas, instale manualmente:
```powershell
pip install yt-dlp
```

## 📊 Estrutura de URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Django Admin:** http://localhost:8000/admin
- **API Videos:** http://localhost:8000/api/videos/
- **API Clips:** http://localhost:8000/api/clips/

## 🐛 Solução de Problemas Comuns

### Erro: "ModuleNotFoundError"
```powershell
# Certifique-se de estar no ambiente virtual (se usar)
cd backend
pip install -r requirements.txt
```

### Erro: "FFmpeg not found"
```powershell
# Instale o FFmpeg (veja instruções acima)
ffmpeg -version
```

### Erro: "CORS error" no navegador
- Certifique-se que o backend está rodando na porta 8000
- Verifique o arquivo `.env.local` do frontend

### Erro: "Invalid API Key"
- Confirme que as chaves estão corretas no `.env`
- Reinicie o servidor backend após editar `.env`

### Erro: "No transcript available"
- Alguns vídeos não têm legendas/transcrições disponíveis
- Tente com outro vídeo que tenha legendas

## 📖 Documentação Completa

- **README.md** - Documentação técnica completa
- **QUICKSTART.md** - Guia de início rápido

## 🎨 Exemplo de Vídeos para Testar

Use vídeos longos com legendas em português ou inglês:
- Podcasts (Flow, PodPah, etc.)
- Entrevistas
- Palestras
- Lives

## 💡 Dicas

1. **Performance:** O primeiro processamento pode demorar. Processamentos subsequentes são mais rápidos.
2. **Qualidade:** Vídeos com boa qualidade de áudio geram melhores análises.
3. **Duração:** Vídeos muito longos (>3h) podem demorar mais para analisar.
4. **Admin:** Use `/admin` para ver todos os vídeos e clips processados.

## 🚀 Deploy (Futuro)

Para produção, considere:
- **Backend:** Railway, Render, ou DigitalOcean
- **Frontend:** Vercel ou Netlify
- **Banco:** PostgreSQL (trocar SQLite)
- **Storage:** AWS S3 para clips processados
- **Queue:** Redis + Celery para processamento assíncrono

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do terminal (backend e frontend)
2. Abra o console do navegador (F12)
3. Confira a documentação completa no README.md

---

**Pronto para usar! 🎉**
