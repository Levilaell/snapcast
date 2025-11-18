# 🚀 Como Configurar YouTube - Guia Passo a Passo

## Parte 1: Google Cloud Console (15 minutos)

### Passo 1: Criar Projeto

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. No topo da página, clique em **"Select a project"** (ou nome do projeto atual)
4. Clique em **"NEW PROJECT"**
5. Preencha:
   - **Project name:** `SnapCast`
   - **Organization:** deixe como está
6. Clique em **"CREATE"**
7. Aguarde alguns segundos até o projeto ser criado

---

### Passo 2: Habilitar YouTube Data API v3

1. Com o projeto `SnapCast` selecionado, no menu lateral:
   - Clique em **☰** (menu hambúrguer)
   - **APIs & Services** → **Library**

2. Na barra de busca, digite: `YouTube Data API v3`

3. Clique em **"YouTube Data API v3"**

4. Clique no botão **"ENABLE"**

5. Aguarde a ativação (alguns segundos)

---

### Passo 3: Configurar OAuth Consent Screen

1. No menu lateral: **APIs & Services** → **OAuth consent screen**

2. Escolha **"External"** (para qualquer usuário do Google)
   - Clique em **"CREATE"**

3. **Preencha o formulário:**

   **App information:**
   - App name: `SnapCast`
   - User support email: `seu-email@gmail.com` (seu email)
   - App logo: (opcional, pode pular)

   **App domain:**
   - Application home page: `http://localhost:8000` (pode deixar em branco por enquanto)

   **Developer contact information:**
   - Email addresses: `seu-email@gmail.com`

4. Clique em **"SAVE AND CONTINUE"**

5. **Scopes** (Permissões):
   - Clique em **"ADD OR REMOVE SCOPES"**
   - Na busca, digite: `youtube.upload`
   - Marque a caixa: **`https://www.googleapis.com/auth/youtube.upload`**
   - Role para baixo e clique em **"UPDATE"**
   - Clique em **"SAVE AND CONTINUE"**

6. **Test users** (Usuários de teste):
   - Clique em **"+ ADD USERS"**
   - Digite seu email: `seu-email@gmail.com`
   - Clique em **"ADD"**
   - Clique em **"SAVE AND CONTINUE"**

7. **Summary:**
   - Revise as informações
   - Clique em **"BACK TO DASHBOARD"**

---

### Passo 4: Criar Credenciais OAuth 2.0

1. No menu lateral: **APIs & Services** → **Credentials**

2. Clique no botão **"+ CREATE CREDENTIALS"** no topo

3. Escolha: **"OAuth 2.0 Client ID"**

4. **Configure o Cliente:**

   - **Application type:** Escolha **"Web application"**

   - **Name:** `SnapCast Web Client`

   - **Authorized JavaScript origins:** (deixe vazio por enquanto)

   - **Authorized redirect URIs:**
     - Clique em **"+ ADD URI"**
     - Digite: `http://localhost:8000/api/youtube/callback/`
     - Clique em **"+ ADD URI"** novamente (se for fazer deploy)
     - Digite: `https://seu-dominio.com/api/youtube/callback/` (substitua pelo seu domínio quando tiver)

5. Clique em **"CREATE"**

6. **IMPORTANTE:** Uma janela vai aparecer com suas credenciais:
   - **Client ID:** `1234567890-abc...apps.googleusercontent.com`
   - **Client secret:** `GOCSPX-abc123...`

7. Clique em **"DOWNLOAD JSON"** (botão de download)
   - Salve o arquivo (vai baixar como `client_secret_XXXX.json`)

8. Clique em **"OK"**

---

## Parte 2: Configurar o Backend (5 minutos)

### Passo 1: Copiar arquivo de credenciais

```bash
# No terminal, vá até a pasta do projeto
cd /Users/levilaell/Desktop/snapcast/backend

# Copie o arquivo baixado (substitua XXXX pelo nome real)
cp ~/Downloads/client_secret_*.json ./client_secrets.json

# Verifique se copiou
ls -la client_secrets.json
```

---

### Passo 2: Instalar dependências do Google

```bash
# Ative o ambiente virtual
source venv/bin/activate

# Instale as bibliotecas do Google
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client

# Verifique instalação
pip list | grep google
```

Você deve ver:
```
google-api-core
google-api-python-client
google-auth
google-auth-httplib2
google-auth-oauthlib
```

---

### Passo 3: Reiniciar o servidor

```bash
# Se o servidor estiver rodando, pare (Ctrl+C)

# Rode novamente
python manage.py runserver
```

---

## Parte 3: Testar (2 minutos)

### Passo 1: Acessar o frontend

1. Abra o navegador: `http://localhost:5173`
2. Vá para **Dashboard**
3. Clique em qualquer episódio
4. Clique em um clip **"Ver Clip"**
5. Clique no botão **"Publicar no YouTube"** (vermelho)

### Passo 2: Autenticar

1. Uma janela popup vai abrir
2. Você será redirecionado para Google
3. **Selecione sua conta Google**
4. **Permitir acesso:**
   - Vai mostrar: "SnapCast quer acessar sua Conta do Google"
   - **Marque** a caixa: "Gerenciar seus vídeos do YouTube"
   - Clique em **"Continuar"**

5. Se aparecer aviso "App não verificado":
   - Clique em **"Avançado"**
   - Clique em **"Ir para SnapCast (não seguro)"**
   - Isso é normal em modo de desenvolvimento!

6. A janela vai fechar automaticamente

### Passo 3: Publicar vídeo

1. Preencha o formulário:
   - **Título:** "Meu primeiro teste"
   - **Descrição:** "Testando integração SnapCast"
   - **Tags:** teste, snapcast
   - **Privacidade:** Escolha **"Não listado"** (para testes)

2. Clique em **"Publicar no YouTube"**

3. Aguarde o upload (pode demorar dependendo do tamanho do vídeo)

4. Quando terminar, vai aparecer **"Vídeo publicado com sucesso!"**

5. Clique em **"Ver no YouTube"** para ver seu vídeo!

---

## 🎉 Pronto! Configuração Completa

Agora você pode publicar clips direto do SnapCast para o YouTube!

---

## ⚠️ Troubleshooting

### Erro: "client_secrets.json não encontrado"
```bash
# Verifique se está no lugar certo
ls /Users/levilaell/Desktop/snapcast/backend/client_secrets.json
```

### Erro: "App não verificado"
- Normal em desenvolvimento
- Clique em "Avançado" → "Ir para SnapCast (não seguro)"
- Ou adicione seu email em Test Users no Google Cloud Console

### Erro: "Redirect URI mismatch"
- Verifique se no Google Cloud Console você adicionou:
- `http://localhost:8000/api/youtube/callback/`
- Com a barra `/` no final!

### Erro: "Quota exceeded"
- Você atingiu o limite de 10.000 unidades/dia
- Upload = 1.600 unidades
- Limite = ~6 uploads/dia
- Aguarde até amanhã OU solicite aumento de quota

### Upload muito lento?
- Normal! Depende do tamanho do vídeo e internet
- 1 minuto de vídeo = ~10-50 MB
- Seja paciente :)

---

## 📊 Quota do YouTube

Você tem **10.000 unidades/dia** (padrão):

| Ação | Custo | Quantas/dia |
|------|-------|-------------|
| Upload vídeo | 1.600 | ~6 |
| Listar vídeos | 1 | 10.000 |
| Deletar vídeo | 50 | 200 |

Para aumentar: https://support.google.com/youtube/contact/yt_api_form

---

## 🔐 Segurança

### ✅ Boas práticas:

1. **NUNCA** commite `client_secrets.json` no Git
   ```bash
   # Já está no .gitignore, mas confira:
   cat .gitignore | grep client_secrets
   ```

2. **Use variáveis de ambiente** em produção

3. **Adicione apenas emails confiáveis** como test users

4. **Use "Não listado"** para testes (não aparece em buscas)

5. **Delete vídeos de teste** depois

---

## 🚀 Próximos Passos

### Para Produção (depois):

1. **Verificar a app:**
   - Google Cloud Console → OAuth consent screen
   - Clique em "PUBLISH APP"
   - Submeta para verificação do Google (pode levar semanas)

2. **Deploy:**
   - Adicione seu domínio em Authorized redirect URIs
   - Configure HTTPS
   - Use variáveis de ambiente para secrets

3. **Aumentar quota:**
   - Solicite aumento se precisar mais de 6 uploads/dia

---

## 📞 Precisa de ajuda?

Se algo der errado:
1. Verifique os logs do backend
2. Veja mensagens de erro no console do navegador (F12)
3. Confira se seguiu todos os passos
4. Revise se o email está em Test Users

**Arquivos importantes:**
- `backend/client_secrets.json` - Suas credenciais (não commitar!)
- `YOUTUBE_SETUP.md` - Documentação detalhada
- `YOUTUBE_INTEGRATION.md` - Documentação técnica

Boa sorte! 🎬✨
