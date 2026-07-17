import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'

let supabaseInstance: any = null
let supabaseAdminInstance: any = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdminInstance
}

export const supabase = typeof window !== 'undefined' ? getSupabase() : getSupabase()
export const supabaseAdmin = getSupabaseAdmin()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'premium' | 'pro'
          monthly_income: number | null
          created_at: string
          updated_at: string
        }
      }
      monthly_budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          monthly_income: number
          essentials_budget: number | null
          desires_budget: number | null
          savings_budget: number | null
          created_at: string
          updated_at: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category: string
          planned_amount: number | null
          actual_amount: number | null
          month: string
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      debts: {
        Row: {
          id: string
          user_id: string
          creditor: string
          total_amount: number
          monthly_interest_rate: number | null
          monthly_payment: number | null
          priority_order: number | null
          is_paid: boolean
          created_at: string
          updated_at: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_name: string
          target_amount: number
          saved_amount: number
          target_date: string | null
          created_at: string
          updated_at: string
        }
      }
      ai_consultations: {
        Row: {
          id: string
          user_id: string
          category: string | null
          question: string
          ai_response: string | null
          tokens_used: number | null
          created_at: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'premium' | 'pro'
          status: 'active' | 'canceled' | 'failed'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
