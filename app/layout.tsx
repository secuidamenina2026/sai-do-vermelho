import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { AnalyticsConsent } from '@/components/analytics-consent'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://sai-do-vermelho-vercel.vercel.app'),
  title: 'Sai do Vermelho | Sua rota para uma vida financeira mais leve',
  description: 'Organize seus gastos, escolha a melhor estratégia para quitar dívidas e construa sua primeira reserva com uma rota clara.',
  openGraph: {
    title: 'Sai do Vermelho | Sua rota financeira clara',
    description: 'Organize gastos, priorize dívidas e construa sua primeira reserva com um plano simples e possível.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sai do Vermelho',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sai do Vermelho | Sua rota financeira clara',
    description: 'Organize gastos, priorize dívidas e construa sua primeira reserva com um plano simples e possível.',
  },
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
        <AnalyticsConsent />
      </body>
    </html>
  )
}
