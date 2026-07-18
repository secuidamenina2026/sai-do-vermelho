#!/bin/bash
# Script rápido de deploy - copie e cole no terminal!

echo "🚀 SAI DO VERMELHO - DEPLOY RÁPIDO"
echo "=================================="

# 1. Verificar git
echo "✅ Verificando git..."
git status

# 2. Criar remote
echo "📝 Adicionar remote GitHub..."
echo "⚠️  Antes, você precisa:"
echo "  1. Criar repo em github.com/new (nome: sai-do-vermelho)"
echo "  2. Gerar token em Settings → Developer settings → Tokens"
echo ""
echo "Depois, rode estes comandos:"
echo ""
echo "git remote add origin https://github.com/SEU_USUARIO/sai-do-vermelho.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "👆 Cola os comandos acima no terminal!"
