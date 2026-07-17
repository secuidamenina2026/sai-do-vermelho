import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'SAI DO VERMELHO - Organize suas Finanças com IA',
  description: 'Aplicação SaaS de finanças pessoais com consultoria IA, método 50-30-20',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              💰 SAI DO VERMELHO
            </Link>
            <div className="flex gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/auth/register" className="btn btn-primary">Registrar</Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="container max-w-6xl mx-auto text-center">
            <p>&copy; 2024 SAI DO VERMELHO. Todos os direitos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
