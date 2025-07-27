import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Para rutas de la API
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.json({ message: 'Sin autorización' }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Para rutas de páginas
  if (url.pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/setup', '/login', '/track', '/map', '/settings/:path*', '/api/((?!auth).*)'],
}
