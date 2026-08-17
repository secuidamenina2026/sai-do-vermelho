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
          <h2 className="text-xl font-bold mb-2">4. Compra, acesso e garantia</h2>
          <p className="text-gray-700">
            A compra concede acesso ao serviço pelo período de 12 meses, sem renovação automática.
            O pagamento é único e as condições de garantia de 7 dias são apresentadas antes da
            contratação no ambiente seguro do provedor de pagamentos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Uso responsável e disponibilidade</h2>
          <p className="text-gray-700">O acesso é pessoal e não pode ser compartilhado, revendido ou usado de forma automatizada. Podemos realizar manutenções e melhorias para preservar a segurança e a qualidade do serviço.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Atendimento</h2>
          <p className="text-gray-700">Dúvidas sobre acesso, pagamento ou garantia podem ser enviadas para <a className="font-semibold text-emerald-700 hover:underline" href="mailto:contato@ejdigitalia.com">contato@ejdigitalia.com</a>.</p>
        </section>
      </div>
    </main>
  )
}
