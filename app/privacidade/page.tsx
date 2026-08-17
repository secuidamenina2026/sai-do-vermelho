import Link from 'next/link'

export default function Privacidade() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-3 text-4xl font-bold">Política de Privacidade</h1>
      <p className="mb-8 text-gray-600">Última atualização: 15 de agosto de 2026.</p>
      <div className="card space-y-6 leading-7 text-gray-700">
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Quais dados usamos</h2><p>Usamos os dados de cadastro e as informações financeiras que você registra para oferecer orçamento, diagnósticos, metas e planos personalizados.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Por que tratamos esses dados</h2><p>Tratamos os dados necessários para executar o serviço contratado, proteger a conta, prestar suporte e cumprir obrigações legais. Métricas opcionais de campanha somente são ativadas após seu consentimento.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Com quem os dados são processados</h2><p>Usamos fornecedores de infraestrutura, autenticação, inteligência artificial e pagamento estritamente para operar o produto. A Kiwify processa os dados informados no checkout conforme os próprios termos e política de privacidade.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Como protegemos seus dados</h2><p>O acesso exige autenticação e os registros financeiros são isolados por usuário no banco de dados. Não vendemos seus dados pessoais.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Prazo e exclusão</h2><p>Mantemos os dados enquanto a conta estiver ativa e pelo período necessário ao cumprimento de obrigações legais. Depois, eles são excluídos ou anonimizados quando aplicável.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Seus direitos</h2><p>Você pode pedir confirmação do tratamento, acesso, correção, portabilidade quando aplicável, informação sobre compartilhamento, revogação do consentimento ou exclusão dos dados tratados com base nele.</p></section>
        <section><h2 className="mb-2 text-xl font-bold text-gray-900">Contato</h2><p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, escreva para <a className="font-semibold text-emerald-700 hover:underline" href="mailto:contato@ejdigitalia.com">contato@ejdigitalia.com</a>.</p></section>
      </div>
      <Link href="/" className="mt-6 inline-block font-medium text-blue-600 hover:underline">← Voltar ao início</Link>
    </div>
  )
}
