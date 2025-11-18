# Configuração da Integração YouTube - Guia Rápido

## 🚀 Modo Atual: DESENVOLVIMENTO

O sistema está configurado para funcionar SEM credenciais do Google/YouTube. Isso permite que você teste toda a interface e fluxo de publicação sem precisar configurar OAuth.

### Como funciona no modo desenvolvimento:

1. ✅ O modal abre direto no formulário (sem pedir autenticação)
2. ✅ Você preenche título, descrição, tags e privacidade
3. ✅ Ao clicar "Publicar", simula 2 segundos de upload
4. ✅ Retorna uma URL mockada: `https://youtube.com/watch?v=DEV_123_timestamp`
5. ✅ Não faz chamadas reais à API do YouTube

### Arquivos do modo desenvolvimento:

**Frontend:**
- `frontend/src/components/YouTubePublishModal.tsx` - Linha 47: `isConnected = true`

**Backend:**
- `backend/youtube/views.py` - Linha 21: `DEVELOPMENT_MODE = True`

---

## 📝 Quando você estiver pronto para PRODUÇÃO:

### Passo 1: Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)

2. **Criar Projeto:**
   - Clique em "Select a project" → "New Project"
   - Nome: SnapCast
   - Clique em "Create"

3. **Habilitar YouTube Data API v3:**
   - No menu lateral: APIs & Services → Library
   - Procure por "YouTube Data API v3"
   - Clique em "Enable"

4. **Configurar Tela de Consentimento OAuth:**
   - APIs & Services → OAuth consent screen
   - User Type: **External**
   - App name: **SnapCast**
   - User support email: seu email
   - Developer contact: seu email
   - Clique em "Save and Continue"

   **Scopes:**
   - Clique em "Add or Remove Scopes"
   - Procure e adicione: `https://www.googleapis.com/auth/youtube.upload`
   - Salve

   **Test users:**
   - Adicione seu email para testes
   - Salve

5. **Criar Credenciais OAuth 2.0:**
   - APIs & Services → Credentials
   - Clique em "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: SnapCast Web Client

   **Authorized redirect URIs:**
   ```
   http://localhost:8000/api/youtube/callback/
   https://seu-dominio.com/api/youtube/callback/  (quando em produção)
   ```

   - Clique em "Create"
   - **BAIXE o arquivo JSON** (client_secret_*.json)

### Passo 2: Configurar Backend

1. **Renomeie o arquivo baixado:**
   ```bash
   mv ~/Downloads/client_secret_*.json backend/client_secrets.json
   ```

2. **Adicione ao .gitignore:**
   ```bash
   echo "backend/client_secrets.json" >> .gitignore
   ```

3. **Instale dependências:**
   ```bash
   cd backend
   source venv/bin/activate  # ou .\venv\Scripts\activate no Windows
   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   ```

4. **Adicione campos ao modelo Clip:**

   Edite `backend/clips/models.py`:
   ```python
   class Clip(models.Model):
       # ... campos existentes ...

       # YouTube integration
       youtube_video_id = models.CharField(max_length=100, null=True, blank=True)
       youtube_url = models.URLField(null=True, blank=True)
       is_published_youtube = models.BooleanField(default=False)
       youtube_published_at = models.DateTimeField(null=True, blank=True)
   ```

5. **Rode migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Substitua `backend/youtube/views.py`:**

   Use o código completo de `YOUTUBE_INTEGRATION.md` seção "Views/Endpoints"

7. **Atualize configuração:**

   Em `backend/youtube/views.py`, mude:
   ```python
   DEVELOPMENT_MODE = False  # Linha 21
   ```

### Passo 3: Configurar Frontend

Edite `frontend/src/components/YouTubePublishModal.tsx`, linha 47:

```typescript
// ANTES (desenvolvimento):
const [isConnected, setIsConnected] = useState(true);

// DEPOIS (produção):
const [isConnected, setIsConnected] = useState(false);
```

### Passo 4: Testar

1. Reinicie o backend:
   ```bash
   python manage.py runserver
   ```

2. No frontend, acesse um clip e clique em "Publicar no YouTube"

3. Você será redirecionado para autenticação do Google

4. Após autorizar, o vídeo será publicado no seu canal!

---

## ⚠️ Limitações e Quotas

### Quotas do YouTube API:

- **Limite padrão:** 10.000 unidades/dia
- **Upload de vídeo:** 1.600 unidades
- **Uploads possíveis/dia:** ~6 vídeos

### Para aumentar quota:

1. Acesse [YouTube Quota Extension Request](https://support.google.com/youtube/contact/yt_api_form)
2. Preencha o formulário explicando seu caso de uso
3. Pode levar alguns dias para aprovação

### Enquanto em teste:

- Sua app estará em "Testing mode"
- Apenas test users podem usar
- Máximo de 100 test users

### Para produção:

1. Complete a verificação da app no Google Cloud Console
2. Submeta para revisão (pode levar semanas)
3. Após aprovado, qualquer usuário pode conectar

---

## 🔒 Segurança

### ✅ Boas práticas:

1. **NUNCA** commite `client_secrets.json`
2. Use variáveis de ambiente em produção
3. Valide sempre permissions do usuário
4. Use HTTPS em produção
5. Implemente rate limiting

### ❌ Nunca faça:

- Compartilhar client_secret publicamente
- Usar credenciais de desenvolvimento em produção
- Ignorar validação de state no OAuth callback

---

## 🐛 Troubleshooting

### "Access Not Configured"
→ YouTube Data API v3 não está habilitada no Google Cloud Console

### "Invalid Credentials"
→ Arquivo client_secrets.json está incorreto ou mal configurado

### "Redirect URI mismatch"
→ A URI no Google Cloud Console não corresponde à usada no código

### "Quota Exceeded"
→ Você atingiu o limite de 10.000 unidades/dia. Aguarde ou solicite aumento.

### "The app is not verified"
→ Adicione seus emails como test users OU complete o processo de verificação

---

## 📚 Recursos

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Web Server Flow](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Documentação Completa](./YOUTUBE_INTEGRATION.md)

---

## ✨ Status Atual

- ✅ Interface completa no frontend
- ✅ Modal de publicação funcional
- ✅ Mock endpoints para desenvolvimento
- ⏳ Integração real com YouTube (aguardando configuração)

**Próximo passo:** Seguir "Passo 1: Google Cloud Console" quando estiver pronto para produção.
