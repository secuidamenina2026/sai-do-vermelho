export type DebtInput = {
  id?: string
  name: string
  balance: number
  monthlyInterestRate: number
  minimumPayment: number
}

export type PayoffStrategy = 'snowball' | 'avalanche'

export type PayoffResult = {
  months: number | null
  totalInterest: number
  totalPaid: number
  monthlyBudget: number
  reason?: 'insufficient-payment' | 'simulation-limit'
}

export function addMonthsToDate(months: number, from = new Date()) {
  const date = new Date(from)
  date.setDate(1)
  date.setMonth(date.getMonth() + Math.max(0, months))
  return date
}

export function formatPayoffDate(months: number, from = new Date()) {
  return addMonthsToDate(months, from).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

const MONEY_EPSILON = 0.005

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function parseMoney(value: string | number | null | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (!value) return 0

  const normalized = value
    .trim()
    .replace(/\s/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Simula a quitação mês a mês, com juros compostos e orçamento mensal fixo.
 * Bola de neve prioriza o menor saldo; avalanche prioriza a maior taxa.
 */
export function simulatePayoffPlan(
  debts: DebtInput[],
  requestedMonthlyBudget: number,
  strategy: PayoffStrategy = 'snowball',
  maxMonths = 600,
): PayoffResult {
  const active = debts
    .filter((debt) => debt.balance > MONEY_EPSILON)
    .map((debt, index) => ({
      ...debt,
      key: debt.id ?? `${debt.name}-${index}`,
      balance: Math.max(0, debt.balance),
      monthlyInterestRate: Math.max(0, debt.monthlyInterestRate) / 100,
      minimumPayment: Math.max(0, debt.minimumPayment),
    }))

  if (active.length === 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, monthlyBudget: 0 }
  }

  const minimumTotal = active.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const monthlyBudget = Math.max(0, requestedMonthlyBudget, minimumTotal)
  const initialInterest = active.reduce(
    (sum, debt) => sum + debt.balance * debt.monthlyInterestRate,
    0,
  )

  if (monthlyBudget <= initialInterest + MONEY_EPSILON) {
    return {
      months: null,
      totalInterest: 0,
      totalPaid: 0,
      monthlyBudget,
      reason: 'insufficient-payment',
    }
  }

  let totalInterest = 0
  let totalPaid = 0

  for (let month = 1; month <= maxMonths; month += 1) {
    for (const debt of active) {
      if (debt.balance <= MONEY_EPSILON) continue
      const interest = debt.balance * debt.monthlyInterestRate
      debt.balance += interest
      totalInterest += interest
    }

    let remainingBudget = monthlyBudget

    for (const debt of active) {
      if (debt.balance <= MONEY_EPSILON || remainingBudget <= MONEY_EPSILON) continue
      const payment = Math.min(debt.balance, debt.minimumPayment, remainingBudget)
      debt.balance -= payment
      remainingBudget -= payment
      totalPaid += payment
    }

    const ordered = active
      .filter((debt) => debt.balance > MONEY_EPSILON)
      .sort((a, b) =>
        strategy === 'avalanche'
          ? b.monthlyInterestRate - a.monthlyInterestRate || a.balance - b.balance
          : a.balance - b.balance || b.monthlyInterestRate - a.monthlyInterestRate,
      )

    for (const debt of ordered) {
      if (remainingBudget <= MONEY_EPSILON) break
      const payment = Math.min(debt.balance, remainingBudget)
      debt.balance -= payment
      remainingBudget -= payment
      totalPaid += payment
    }

    if (active.every((debt) => debt.balance <= MONEY_EPSILON)) {
      return { months: month, totalInterest, totalPaid, monthlyBudget }
    }
  }

  return {
    months: null,
    totalInterest,
    totalPaid,
    monthlyBudget,
    reason: 'simulation-limit',
  }
}
