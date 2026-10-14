'use client'

import { useState } from 'react'
import Link from 'next/link'

const ideas = [
  { title: 'Serviços para negócios locais', skill: 'digital', time: '3', cost: 'Sem compra obrigatória; considere internet e ferramentas.', steps: ['Escolha um serviço que sabe entregar: posts, cadastro de produtos ou organização de documentos.', 'Crie uma amostra própria e defina escopo, prazo e preço.', 'Apresente a amostra a três negócios e registre as respostas.'] },
  { title: 'Aulas e apoio individual', skill: 'ensinar', time: '3', cost: 'Pode começar com materiais que já possui.', steps: ['Escolha uma habilidade que domina e um público específico.', 'Prepare uma aula curta e combine local, duração e preço.', 'Ofereça horários a pessoas da sua rede sem enviar mensagens em massa.'] },
  { title: 'Venda de itens que não usa', skill: 'vender', time: '1', cost: 'Considere embalagem, transporte e taxas do canal escolhido.', steps: ['Separe três itens em bom estado e confira se são seus para vender.', 'Fotografe e descreva condição e preço com clareza.', 'Combine pagamento e entrega com segurança; nunca pague para liberar uma venda.'] },
  { title: 'Produção sob encomenda', skill: 'manual', time: '5', cost: 'Calcule materiais, embalagem, entrega e seu tempo antes de aceitar.', steps: ['Escolha um produto que já sabe fazer.', 'Monte uma amostra e calcule o custo completo.', 'Teste poucas encomendas antes de comprar estoque; confira as exigências locais aplicáveis.'] },
]

export default function ExtraIncomePage() {
  const [skill, setSkill] = useState('todos')
  const [time, setTime] = useState('5')
  const filtered = ideas.filter(idea => (skill === 'todos' || idea.skill === skill) && Number(idea.time) <= Number(time))
  return <div className="space-y-8">
    <header><p className="text-sm font-bold uppercase text-emerald-700">Minha virada</p><h1 className="mt-2 text-3xl font-bold">Um primeiro passo para sua renda extra</h1><p className="mt-3 text-slate-600">Escolha uma ideia compatível com seu tempo e suas habilidades. São possibilidades para testar, sem promessa de ganhos.</p></header>
    <section className="card grid gap-4 sm:grid-cols-2" aria-label="Seu perfil"><div><label htmlFor="skill" className="label">O que combina com você?</label><select id="skill" className="input" value={skill} onChange={e => setSkill(e.target.value)}><option value="todos">Explorar todas as ideias</option><option value="digital">Serviços digitais</option><option value="ensinar">Ensinar</option><option value="vender">Vender</option><option value="manual">Trabalho manual</option></select></div><div><label htmlFor="time" className="label">Horas disponíveis por semana</label><select id="time" className="input" value={time} onChange={e => setTime(e.target.value)}><option value="1">Até 1 hora</option><option value="3">Até 3 horas</option><option value="5">5 horas ou mais</option></select></div></section>
    <div className="grid gap-5 lg:grid-cols-2">{filtered.map(idea => <article key={idea.title} className="card"><h2 className="text-xl font-bold">{idea.title}</h2><p className="mt-3 text-sm text-slate-600"><b>Custos:</b> {idea.cost}</p><ol className="mt-4 list-decimal space-y-3 pl-5">{idea.steps.map(step => <li key={step}>{step}</li>)}</ol><Link className="mt-5 inline-block font-bold text-emerald-700 underline" href={'/dashboard/ia?pergunta=' + encodeURIComponent('Quero testar ' + idea.title + '. Ajude-me a montar um primeiro passo sem comprometer as contas essenciais. Antes, pergunte sobre minhas habilidades, tempo e orçamento.')}>Planejar com a IA</Link></article>)}</div>
    {filtered.length === 0 && <p role="status" className="card">Nenhuma ideia desta seleção combina com esse tempo. Experimente outro perfil ou peça ajuda à IA.</p>}
    <aside className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">Sua missão: escolha uma ideia, calcule os custos e converse com três possíveis compradores antes de investir. Quando receber, registre o valor em <Link className="font-bold underline" href="/dashboard/entradas">Entradas</Link>.</aside>
  </div>
}
