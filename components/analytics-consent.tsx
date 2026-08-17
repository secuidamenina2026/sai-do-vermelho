'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'sdv-analytics-consent'
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY)
    if (saved === 'accepted' || saved === 'rejected') setConsent(saved)
  }, [])

  useEffect(() => {
    const trackCheckout = () => {
      if (consent === 'accepted') window.fbq?.('track', 'InitiateCheckout')
    }
    window.addEventListener('sdv:initiate-checkout', trackCheckout)
    return () => window.removeEventListener('sdv:initiate-checkout', trackCheckout)
  }, [consent])

  const choose = (value: 'accepted' | 'rejected') => {
    window.localStorage.setItem(CONSENT_KEY, value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'accepted' && PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
          </Script>
          <noscript><img height="1" width="1" className="hidden" alt="" src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} /></noscript>
        </>
      )}

      {consent === null && (
        <div className="fixed bottom-20 left-3 right-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl md:bottom-5 md:flex md:items-center md:gap-5 md:p-5" role="dialog" aria-label="Preferências de privacidade">
          <p className="text-sm leading-6 text-slate-600">
            Usamos cookies opcionais para medir campanhas e melhorar sua experiência. Você pode aceitar ou continuar sem rastreamento. Veja nossa <a href="/privacidade" className="font-bold text-emerald-700 underline">Política de Privacidade</a>.
          </p>
          <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
            <button type="button" onClick={() => choose('rejected')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Recusar</button>
            <button type="button" onClick={() => choose('accepted')} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">Aceitar</button>
          </div>
        </div>
      )}
    </>
  )
}
