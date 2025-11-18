#!/usr/bin/env python
"""
Script de teste para verificar configuração do YouTube
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'snapcast_backend.settings')
django.setup()

from django.conf import settings
import json

def test_youtube_config():
    print("🔍 Verificando configuração do YouTube...\n")

    # 1. Verificar se arquivo existe
    client_secrets = settings.YOUTUBE_CLIENT_SECRETS_FILE
    print(f"📁 Client secrets file: {client_secrets}")

    if not os.path.exists(client_secrets):
        print("❌ ERRO: client_secrets.json não encontrado!")
        print(f"   Por favor, coloque o arquivo em: {client_secrets}")
        return False

    print("✅ Arquivo encontrado!\n")

    # 2. Verificar estrutura do JSON
    try:
        with open(client_secrets, 'r') as f:
            config = json.load(f)

        print("📋 Estrutura do arquivo:")

        if 'web' in config:
            web = config['web']
            print(f"   ✅ Client ID: {web.get('client_id', 'MISSING')[:50]}...")
            print(f"   ✅ Client Secret: {web.get('client_secret', 'MISSING')[:20]}...")
            print(f"   ✅ Redirect URIs: {web.get('redirect_uris', [])}")

            # Verificar redirect URI
            expected_uri = "http://localhost:8000/api/youtube/callback/"
            redirect_uris = web.get('redirect_uris', [])

            if expected_uri in redirect_uris:
                print(f"   ✅ Redirect URI configurado corretamente!\n")
            else:
                print(f"   ⚠️  AVISO: Redirect URI esperado não encontrado!")
                print(f"      Esperado: {expected_uri}")
                print(f"      Encontrados: {redirect_uris}\n")
        else:
            print("   ❌ ERRO: Estrutura 'web' não encontrada no JSON")
            return False

    except json.JSONDecodeError as e:
        print(f"❌ ERRO: JSON inválido - {e}")
        return False

    # 3. Verificar dependências
    print("📦 Verificando dependências:")
    try:
        import google.auth
        import google_auth_oauthlib
        import googleapiclient
        print("   ✅ google-auth")
        print("   ✅ google-auth-oauthlib")
        print("   ✅ google-api-python-client\n")
    except ImportError as e:
        print(f"   ❌ ERRO: Faltando dependência - {e}\n")
        print("   Instale com:")
        print("   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client\n")
        return False

    # 4. Verificar modelo
    print("🗄️  Verificando banco de dados:")
    try:
        from youtube.models import YouTubeCredential
        count = YouTubeCredential.objects.count()
        print(f"   ✅ Modelo YouTubeCredential OK")
        print(f"   📊 Credenciais armazenadas: {count}\n")
    except Exception as e:
        print(f"   ❌ ERRO no modelo: {e}\n")
        return False

    # 5. Testar serviço
    print("🔧 Testando serviço YouTube:")
    try:
        from youtube.services import YouTubeService

        # Verificar se consegue ler config
        test_config = YouTubeService.get_client_config()
        print(f"   ✅ Consegue ler client_config")
        print(f"   ✅ Project ID: {test_config.get('web', {}).get('project_id')}\n")
    except Exception as e:
        print(f"   ❌ ERRO no serviço: {e}\n")
        return False

    print("=" * 60)
    print("🎉 CONFIGURAÇÃO COMPLETA E FUNCIONANDO!")
    print("=" * 60)
    print("\n📝 Próximos passos:")
    print("   1. Acesse o frontend: http://localhost:5173")
    print("   2. Vá para um clip")
    print("   3. Clique em 'Publicar no YouTube'")
    print("   4. Autentique com sua conta Google")
    print("   5. Publique seu vídeo!\n")

    return True

if __name__ == '__main__':
    success = test_youtube_config()
    sys.exit(0 if success else 1)
