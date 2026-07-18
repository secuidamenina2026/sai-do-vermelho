import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a middleware client that will refresh the session
  const res = NextResponse.next()

  // This middleware runs on every request and refreshes the session
  // It ensures the session is available in cookies for server-side operations
  const supabase = createMiddlewareClient({ req: request, res })

  // This call refreshes the session if it exists and updates the cookies
  await supabase.auth.getSession()

  return res
}

// Run middleware on:
// - All API routes (/api/*)
// - All protected dashboard routes (/dashboard/*)
// - Auth routes (/auth/*)
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}
