#!/bin/bash

# 🚀 SCRIPT PARA DEPLOY AGORA

echo "=== Sai do Vermelho - Deploy Script ==="
echo ""

# 1. Verificar commits
echo "📝 Status do Git:"
git log --oneline -3
echo ""

# 2. Fazer push
echo "📤 Fazendo push para GitHub..."
echo "Você pode precisar inserir seu GitHub personal access token"
echo ""

git push origin main
git push origin master

echo ""
echo "✅ Push concluído!"
echo ""
echo "Vercel vai detectar automaticamente e começar o build."
echo "Você vai receber uma notificação por email quando terminar."
echo ""
echo "Enquanto isso, você pode acompanhar em:"
echo "  https://vercel.com/ej-digital/sai-do-vermelho-vercel/deployments"
