'use client'

import { ReactNode, useEffect, useState } from 'react'
import { CHECKOUT_URL } from '@/lib/commerce'

const TRACKING_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck']

export function CheckoutLink({ children, className }: { children: ReactNode; className?: string }) {
  const [href, setHref] = useState(CHECKOUT_URL)

  useEffect(() => {
    const current = new URLSearchParams(window.location.search)
    const checkout = new URL(CHECKOUT_URL)
    TRACKING_KEYS.forEach((key) => {
      const value = current.get(key)
      if (value) checkout.searchParams.set(key, value)
    })
    setHref(checkout.toString())
  }, [])

  return <a href={href} className={className}>{children}</a>
}
