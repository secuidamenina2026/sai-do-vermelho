import Link from 'next/link'

export default function Privacidade() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-3 text-4xl font-bold">Política de Privacidade</h1>
      <p className="mb-8 text-gray-600">Última atualização: 15 de agosto de 2026.</p>
      <div className="card space-y-6 leading-7 text-gray-700">
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Quais dados usamos</h2><p>Usamos os dados de cadastro e as informações financeiras que você registra para oferecer orçamento, diagnósticos, metas e planos personalizados.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Como protegemos seus dados</h2><p>O acesso exige autenticação e os registros financeiros são isolados por usuário no banco de dados. Não vendemos seus dados pessoais.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Suas escolhas</h2><p>Você pode corrigir seus dados, solicitar uma cópia ou pedir a exclusão da conta e dos registros associados entrando em contato com nosso atendimento.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Contato</h2><p>Para dúvidas sobre privacidade, use o canal oficial de atendimento informado pelo Sai do Vermelho.</p></section>
      </div>
      <Link href="/" className="mt-6 inline-block font-medium text-blue-600 hover:underline">← Voltar ao início</Link>
    </div>
  )
}
