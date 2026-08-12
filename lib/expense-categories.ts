export type BudgetBucket = 'essential' | 'desire' | 'financial'

export type ExpenseCategory = {
  value: string
  label: string
  group: string
  bucket: BudgetBucket
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { value: 'aluguel', label: 'Aluguel', group: 'Moradia', bucket: 'essential' },
  { value: 'financiamento_imovel', label: 'Financiamento do imóvel', group: 'Moradia', bucket: 'essential' },
  { value: 'condominio', label: 'Condomínio', group: 'Moradia', bucket: 'essential' },
  { value: 'iptu', label: 'IPTU', group: 'Moradia', bucket: 'essential' },
  { value: 'manutencao_casa', label: 'Manutenção da casa', group: 'Moradia', bucket: 'essential' },
  { value: 'energia', label: 'Energia elétrica', group: 'Contas da casa', bucket: 'essential' },
  { value: 'agua', label: 'Água', group: 'Contas da casa', bucket: 'essential' },
  { value: 'gas', label: 'Gás', group: 'Contas da casa', bucket: 'essential' },
  { value: 'internet', label: 'Internet', group: 'Contas da casa', bucket: 'essential' },
  { value: 'telefone', label: 'Telefone', group: 'Contas da casa', bucket: 'essential' },
  { value: 'mercado', label: 'Supermercado', group: 'Alimentação', bucket: 'essential' },
  { value: 'feira_padaria', label: 'Feira e padaria', group: 'Alimentação', bucket: 'essential' },
  { value: 'restaurante', label: 'Restaurante', group: 'Alimentação', bucket: 'desire' },
  { value: 'delivery', label: 'Delivery', group: 'Alimentação', bucket: 'desire' },
  { value: 'combustivel', label: 'Combustível', group: 'Transporte', bucket: 'essential' },
  { value: 'transporte_publico', label: 'Transporte público', group: 'Transporte', bucket: 'essential' },
  { value: 'aplicativo_transporte', label: 'Aplicativo de transporte', group: 'Transporte', bucket: 'essential' },
  { value: 'manutencao_veiculo', label: 'Manutenção do veículo', group: 'Transporte', bucket: 'essential' },
  { value: 'seguro_ipva', label: 'Seguro e IPVA', group: 'Transporte', bucket: 'essential' },
  { value: 'plano_saude', label: 'Plano de saúde', group: 'Saúde', bucket: 'essential' },
  { value: 'consulta_exame', label: 'Consultas e exames', group: 'Saúde', bucket: 'essential' },
  { value: 'medicamentos', label: 'Medicamentos', group: 'Saúde', bucket: 'essential' },
  { value: 'dentista_terapia', label: 'Dentista e terapia', group: 'Saúde', bucket: 'essential' },
  { value: 'escola_faculdade', label: 'Escola ou faculdade', group: 'Educação', bucket: 'essential' },
  { value: 'cursos', label: 'Cursos', group: 'Educação', bucket: 'desire' },
  { value: 'material_escolar', label: 'Material escolar', group: 'Educação', bucket: 'essential' },
  { value: 'filhos_dependentes', label: 'Filhos e dependentes', group: 'Família', bucket: 'essential' },
  { value: 'pensao', label: 'Pensão', group: 'Família', bucket: 'essential' },
  { value: 'animais', label: 'Animais de estimação', group: 'Família', bucket: 'essential' },
  { value: 'lazer', label: 'Lazer e passeios', group: 'Desejos', bucket: 'desire' },
  { value: 'assinaturas', label: 'Streaming e assinaturas', group: 'Desejos', bucket: 'desire' },
  { value: 'roupas', label: 'Roupas e acessórios', group: 'Desejos', bucket: 'desire' },
  { value: 'presentes', label: 'Presentes', group: 'Desejos', bucket: 'desire' },
  { value: 'viagens', label: 'Viagens', group: 'Desejos', bucket: 'desire' },
  { value: 'tarifas_juros', label: 'Tarifas, juros e multas', group: 'Financeiro', bucket: 'financial' },
  { value: 'pagamento_divida', label: 'Pagamento de dívida', group: 'Financeiro', bucket: 'financial' },
  { value: 'reserva_emergencia', label: 'Reserva de emergência', group: 'Financeiro', bucket: 'financial' },
  { value: 'investimentos', label: 'Investimentos', group: 'Financeiro', bucket: 'financial' },
  { value: 'doacoes_ajuda', label: 'Doações e ajuda familiar', group: 'Outros', bucket: 'desire' },
  { value: 'outro', label: 'Outro gasto', group: 'Outros', bucket: 'essential' },
]

export const CATEGORY_GROUPS = Array.from(
  new Set(EXPENSE_CATEGORIES.map((category) => category.group)),
)

export function getExpenseCategory(value: string) {
  return EXPENSE_CATEGORIES.find((category) => category.value === value)
}

export function getExpenseCategoryLabel(value: string) {
  return getExpenseCategory(value)?.label ?? value.replace(/_/g, ' ')
}
