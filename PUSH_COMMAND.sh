#!/bin/bash

# 🚀 COMANDO FINAL PARA FAZER DEPLOY

echo "=== Sai do Vermelho - Deploy Final ==="
echo ""
echo "Este script faz o push do código corrigido para Vercel"
echo ""

# Ir para o repositório
cd ~/seu-repositorio/sai-do-vermelho

# Fazer push
echo "📤 Fazendo push para GitHub..."
git push origin main

echo ""
echo "✅ Push concluído!"
echo ""
echo "Próximas etapas automáticas:"
echo "  1. Vercel detecta o push (5-10 segundos)"
echo "  2. Build inicia automaticamente (3-5 minutos)"
echo "  3. Você recebe email quando terminar"
echo "  4. URL ao vivo: https://sai-do-vermelho-vercel.vercel.app"
echo ""
