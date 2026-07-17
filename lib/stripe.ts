import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16',
})

export const PRICE_IDS = {
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
}

export const PRICING = {
  premium: {
    name: 'Premium',
    price: 1900,
    description: 'Acesso completo à IA e acompanhamento',
  },
  pro: {
    name: 'Pro',
    price: 4900,
    description: 'Comunidade + análise avançada',
  },
}
