import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Sai do Vermelho - Sua Jornada Financeira',
  description: 'Organize sua vida financeira em 5 minutos. Use grátis, escale com IA.',
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
