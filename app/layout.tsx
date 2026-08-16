import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Sai do Vermelho | Sua rota para uma vida financeira mais leve',
  description: 'Organize seus gastos, escolha a melhor estratégia para quitar dívidas e construa sua primeira reserva com uma rota clara.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
