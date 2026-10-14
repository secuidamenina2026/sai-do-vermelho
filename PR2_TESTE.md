# PR 2 — revisão e versão de teste (14/10/2026)

## Banco identificado e bloqueio real

O bundle JavaScript publicado em `https://sai-do-vermelho-vercel.vercel.app` aponta para
`https://edhoumedxofyitzfosra.supabase.co`: Supabase/PostgreSQL. O conector identifica o
projeto como `secuidamenina2026's Project`, região `ca-central-1`, PostgreSQL 17,
estado `INACTIVE`. Uma consulta SQL somente de leitura falhou por timeout.

Assim, **não foi validada gravação no banco hospedado**. O retorno HTTP 200 da página
não comprova que o banco, o login ou os formulários funcionem.

## Revisão e correções

- Entradas: falhas não deixam o botão preso; formulário é preservado; recebimento exige
  confirmação do banco; total recebido usa a data de recebimento, não a prevista.
- Gastos: consulta e exclusão deixam de falhar silenciosamente; exclusão exige retorno
  do registro; valores positivos; sucesso apenas após confirmação do banco. O histórico
  continua mensal, inclusive após salvar uma despesa com vencimento em outro mês.
- Layout: indisponibilidade não é tratada como assinatura vencida, e mostra nova tentativa.
- O schema versionado original não contém `income_entries`, `user_categories` nem campos
  novos de `expenses`. Foi criada uma migração aditiva, sem alegar que o schema remoto
  esteja ausente: será necessário compará-lo quando o projeto voltar a responder.
- Renda extra, integração com IA, dicas originais e demais páginas foram preservadas.

## Dicas e notificações dentro do app

- `/dashboard/dicas`: mantém dicas originais e adiciona caixa de notificações,
  marcação de leitura e preferências separadas para dicas e ofertas (ambas opt-in).
- `/dashboard/dicas/gerenciar`: título, mensagem, destino interno, rascunho,
  agendamento, prévia, cancelamento e histórico (últimos 100 registros).
- A administração exige uma linha em `tip_admins`, criada somente por operador confiável.
  Perfil editável pelo usuário não concede administração. API e RLS verificam acesso.
- Vercel Cron: rodada diária às 12h UTC / 9h de Brasília. Agenda determina o instante
  mínimo; a entrega ocorre na próxima rodada, não no minuto exato. Cada rodada processa
  até 20 campanhas vencidas, em ordem. Volume maior precisa de ajuste de frequência/capacidade.
- Entrega transacional em PostgreSQL, bloqueios `FOR UPDATE SKIP LOCKED` e chave única
  por campanha/usuário. Reexecução não duplica; falha reverte toda a transação.
- Consentimento é conferido no processamento. Cancelar impede futuros envios; notificações
  já entregues permanecem no histórico. Apenas `read_at` pode ser alterado pelo destinatário.
- Não há e-mail, WhatsApp ou push fora do navegador. Caixa atualiza ao abrir, voltar à aba
  e a cada minuto enquanto a aba estiver visível.

## Prévia isolada

`/teste/dicas` funciona em preview Vercel e desenvolvimento, sem login, usando os mesmos
componentes de painel/caixa. Dados ficam no localStorage do próprio navegador, claramente
identificados como fictícios. A simulação avança o relógio para as campanhas agendadas e
entrega apenas à caixa local. Não chama a fila real nem modifica dados de usuários.
Em produção, essa rota retorna 404. Para testar um build local, use
`ENABLE_LOCAL_PREVIEW=true` (não configurar em produção).

Roteiro: criar dica → agendar data futura → recarregar → simular rodada → marcar como lida
→ recarregar; criar outra → cancelar; desmarcar preferências e verificar ausência de entrega.

## Verificação reproduzível

```
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

- `npm test`: PostgreSQL embarcado PGlite em diretório temporário, usando schema/migrações
  reais; grava entrada e gasto, fecha e reabre o banco, confirma valores e recebimento,
  testa exclusão, isolamento entre usuários, restrições de administração, preferências,
  agendamentos e idempotência. Validação de conteúdo/datas/links também testada.
- Playwright: formulários reais contra HTTP simulado (não confundir com Supabase online),
  erros de inserção/exclusão, preservação do formulário, salvamento, recarga e recebimento;
  painel de teste com agendamento, leitura, recarga e cancelamento; rejeição de API/cron
  sem autorização e fila desativada em ambiente de teste.
- Build e TypeScript. O lint mantém avisos preexistentes; não houve atualização ampla
  das dependências legadas neste PR.

## Antes de publicar/ativar

1. Restaurar o projeto Supabase correto e comparar schema real com migrações do repositório.
   Não executar cegamente `database.sql` numa base existente: ele não é um baseline completo
   de todas as alterações históricas (entitlements, onboarding, pagamentos etc.).
2. Aplicar primeiro as migrações num Supabase de homologação e executar advisors e os testes
   completos com sessão real, incluindo entradas/gastos e integração API → PostgreSQL.
3. Provisionar o UUID real do administrador em `tip_admins` por uma sessão administrativa.
4. Na publicação aprovada, configurar `CRON_SECRET` forte e `TIP_DELIVERY_ENABLED=true`
   somente em produção. A rota de cron fica inerte sem isso e exige `VERCEL_ENV=production`.
5. Validar rodada real, consentimento e recarga da caixa com contas de teste antes de liberar.

Nenhuma migração foi aplicada ao banco remoto. Nenhuma produção foi publicada por este PR.
