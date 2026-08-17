import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Sai do Vermelho — sua rota financeira clara'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#07111f', color: 'white', padding: '72px', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: 999, background: '#34d399', opacity: .18, right: -120, top: -180 }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 800 }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: '#34d399', color: '#07111f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>
          Sai do <span style={{ color: '#34d399' }}>Vermelho</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#34d399', fontSize: 24, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' }}>Método 50 · 30 · 20</div>
          <div style={{ marginTop: 20, maxWidth: 920, fontSize: 72, lineHeight: 1.02, fontWeight: 900, letterSpacing: -3 }}>Dê ao seu dinheiro uma direção.</div>
          <div style={{ marginTop: 26, color: '#cbd5e1', fontSize: 30 }}>Organize gastos, priorize dívidas e construa sua primeira reserva.</div>
        </div>
        <div style={{ display: 'flex', gap: 28, color: '#cbd5e1', fontSize: 22 }}><span>Pagamento único</span><span>12 meses de acesso</span><span>Garantia de 7 dias</span></div>
      </div>
    </div>,
    size,
  )
}
