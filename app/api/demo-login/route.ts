import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * A demonstração pública foi encerrada antes do lançamento comercial.
 * A rota permanece apenas para invalidar com segurança links antigos.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Acesso de demonstração encerrado.' },
    {
      status: 410,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
