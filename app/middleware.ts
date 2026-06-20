import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/api/stripe',
    '/api/scores',
    '/api/winners',
    '/api/admin',
  ]
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname === route)

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
