import Link from 'next/link'

export default function AcessoExpirado() {
  return (
    <div className="container flex min-h-[78vh] max-w-3xl items-center py-12">
      <div className="w-full rounded-[2.5rem] border border-amber-200 bg-[radial-gradient(circle_at_top,_#fffbeb,_#ffffff_55%)] p-8 text-center shadow-2xl shadow-amber-950/10 md:p-14">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-5xl">🔐</span>
        <h1 className="mt-5 text-3xl font-bold">Seu período de acesso terminou</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">Seus dados continuam protegidos. Renove por mais 12 meses para voltar ao seu plano financeiro e acompanhar sua evolução.</p>
        <Link href="/#pricing" className="btn btn-primary mt-7 inline-flex">Renovar por mais 12 meses</Link>
      </div>
    </div>
  )
}
