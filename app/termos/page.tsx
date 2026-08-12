export default function TermsPage() {
  return (
    <main className="container max-w-3xl py-12">
      <div className="card space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Termos de Serviço</h1>
          <p className="text-sm text-gray-500">Última atualização: 12 de agosto de 2026</p>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-2">1. Finalidade do serviço</h2>
          <p className="text-gray-700">
            O Sai do Vermelho é uma ferramenta de organização e educação financeira. Os cálculos e
            conteúdos exibidos são estimativas baseadas nos dados informados pelo próprio usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Decisões financeiras</h2>
          <p className="text-gray-700">
            O serviço não substitui orientação profissional individual, negociação com credores ou
            análise das condições oficiais de contratos, faturas e propostas de crédito.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Responsabilidade pelos dados</h2>
          <p className="text-gray-700">
            A qualidade das estimativas depende da correção dos valores, taxas e datas informados.
            O usuário deve conferir as condições diretamente com cada instituição financeira.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Assinatura e cancelamento</h2>
          <p className="text-gray-700">
            As condições de cobrança, renovação, cancelamento e garantia são apresentadas antes da
            contratação no ambiente seguro do provedor de pagamentos.
          </p>
        </section>

        <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-4">
          Este texto é uma versão inicial operacional e deve passar por revisão jurídica antes da
          abertura comercial em escala.
        </p>
      </div>
    </main>
  )
}
