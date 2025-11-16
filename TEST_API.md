# 🧪 Testando a API do SnapCast

Você pode testar a API diretamente usando cURL, Postman, ou o navegador.

## 📡 Endpoints Disponíveis

### 1. Criar Análise de Vídeo

**POST** `http://localhost:8000/api/videos/`

```bash
curl -X POST http://localhost:8000/api/videos/ \
  -H "Content-Type: application/json" \
  -d "{\"youtube_url\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}"
```

**PowerShell:**
```powershell
$body = @{
    youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/videos/" -Method Post -Body $body -ContentType "application/json"
```

**Resposta:**
```json
{
  "id": 1,
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "Título do Vídeo",
  "status": "completed",
  "viral_moments_sorted": [
    {
      "title": "Momento incrível",
      "start_time": 120.5,
      "end_time": 165.3,
      "viral_score": 95,
      "category": "historia"
    }
  ]
}
```

### 2. Listar Todos os Vídeos

**GET** `http://localhost:8000/api/videos/`

```bash
curl http://localhost:8000/api/videos/
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/videos/"
```

### 3. Obter Vídeo Específico

**GET** `http://localhost:8000/api/videos/{id}/`

```bash
curl http://localhost:8000/api/videos/1/
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/videos/1/"
```

### 4. Gerar Clip de um Momento

**POST** `http://localhost:8000/api/clips/`

```bash
curl -X POST http://localhost:8000/api/clips/ \
  -H "Content-Type: application/json" \
  -d "{\"video_id\": 1, \"moment_index\": 0}"
```

**PowerShell:**
```powershell
$body = @{
    video_id = 1
    moment_index = 0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/clips/" -Method Post -Body $body -ContentType "application/json"
```

**Resposta:**
```json
{
  "id": 1,
  "title": "Momento incrível",
  "status": "completed",
  "processed_clip_path": "/path/to/clip_1_final.mp4",
  "progress_percentage": 100
}
```

### 5. Listar Todos os Clips

**GET** `http://localhost:8000/api/clips/`

```bash
curl http://localhost:8000/api/clips/
```

### 6. Obter URL de Download do Clip

**GET** `http://localhost:8000/api/clips/{id}/download/`

```bash
curl http://localhost:8000/api/clips/1/download/
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/clips/1/download/"
```

**Resposta:**
```json
{
  "download_url": "/media/clips/clip_1_final.mp4",
  "filename": "Momento_incrível.mp4"
}
```

## 🔍 Testando no Navegador

### Django REST Framework Interface

Abra no navegador:
- http://localhost:8000/api/videos/
- http://localhost:8000/api/clips/

A interface do DRF permite testar diretamente pelo navegador.

### Django Admin

1. Crie um superuser:
```powershell
cd backend
python manage.py createsuperuser
```

2. Acesse: http://localhost:8000/admin
3. Veja todos os vídeos e clips processados

## 📊 Fluxo Completo de Teste

```powershell
# 1. Criar análise de vídeo
$video = Invoke-RestMethod -Uri "http://localhost:8000/api/videos/" -Method Post -Body (@{youtube_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"} | ConvertTo-Json) -ContentType "application/json"

# 2. Ver resultado
$video | ConvertTo-Json -Depth 10

# 3. Gerar clip do primeiro momento
$clip = Invoke-RestMethod -Uri "http://localhost:8000/api/clips/" -Method Post -Body (@{video_id=$video.id; moment_index=0} | ConvertTo-Json) -ContentType "application/json"

# 4. Ver status do clip
$clip | ConvertTo-Json -Depth 10

# 5. Obter URL de download
$download = Invoke-RestMethod -Uri "http://localhost:8000/api/clips/$($clip.id)/download/"
$download
```

## 🐍 Testando com Python

```python
import requests

# 1. Analisar vídeo
response = requests.post(
    'http://localhost:8000/api/videos/',
    json={'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
)
video = response.json()
print(f"Video ID: {video['id']}")
print(f"Momentos encontrados: {len(video['viral_moments_sorted'])}")

# 2. Gerar clip
response = requests.post(
    'http://localhost:8000/api/clips/',
    json={'video_id': video['id'], 'moment_index': 0}
)
clip = response.json()
print(f"Clip ID: {clip['id']}")
print(f"Status: {clip['status']}")

# 3. Baixar clip
response = requests.get(f"http://localhost:8000/api/clips/{clip['id']}/download/")
download_info = response.json()
print(f"Download URL: {download_info['download_url']}")
```

## 📝 Códigos de Status

- **200 OK** - Sucesso (GET, vídeo já existe)
- **201 Created** - Recurso criado com sucesso
- **400 Bad Request** - Dados inválidos
- **404 Not Found** - Recurso não encontrado
- **500 Internal Server Error** - Erro no servidor

## 🎯 Exemplos de Vídeos para Testar

Videos públicos com legendas:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ (teste rápido)
- Qualquer podcast do Flow, PodPah, etc
- TEDx Talks
- Entrevistas longas

## ⚡ Dicas

1. **Cache**: O sistema retorna vídeos já analisados se você tentar analisar o mesmo URL novamente
2. **Tempo**: Análise inicial pode levar 30-60 segundos
3. **Processamento**: Geração de clip pode levar 2-5 minutos dependendo da duração
4. **Logs**: Acompanhe os logs no terminal do backend para debug
