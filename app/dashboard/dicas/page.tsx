import { NotificationInbox } from '@/components/notification-inbox'
import Link from 'next/link'

const tips = [
  { title: 'Antes de comprar, veja o mês inteiro', text: 'Some as contas que ainda vão vencer antes de considerar o saldo livre. Dinheiro na conta pode já ter destino.', href: '/dashboard/calendario', action: 'Revisar vencimentos' },
  { title: 'Uma economia que você consegue manter', text: 'Escolha uma despesa recorrente e compare custo, uso e alternativas. Priorize cortes que não comprometam saúde e necessidades essenciais.', href: '/dashboard/gastos', action: 'Revisar meus gastos' },
  { title: 'Renda extra começa com um teste pequeno', text: 'Use uma habilidade que já tem, calcule custos e busque interesse antes de comprar materiais. Não conte com uma receita que ainda não recebeu.', href: '/dashboard/renda-extra', action: 'Explorar ideias' },
  { title: 'Uma dívida por vez, com visão do conjunto', text: 'Registre saldo, juros e parcelas das dívidas. Compare prioridades sem deixar de lado as contas essenciais e as consequências do atraso.', href: '/dashboard/dividas', action: 'Organizar dívidas' },
]

export default function TipsPage() {
  return <div className="space-y-8"><header><p className="text-sm font-bold uppercase text-emerald-700">Dicas e novidades</p><h1 className="mt-2 text-3xl font-bold">Pequenas ações para avançar</h1><p className="mt-3 text-slate-600">Conteúdos educativos para colocar em prática no seu dia a dia.</p></header><NotificationInbox /><div className="grid gap-5 lg:grid-cols-2">{tips.map(tip => <article key={tip.title} className="card"><h2 className="text-xl font-bold">{tip.title}</h2><p className="mt-3 leading-7 text-slate-600">{tip.text}</p><Link className="mt-5 inline-block font-bold text-emerald-700 underline" href={tip.href}>{tip.action} →</Link></article>)}</div></div>
}
