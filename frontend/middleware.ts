import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard/admin': ['admin'],
  '/dashboard/faculty': ['admin', 'faculty'],
  '/dashboard/student': ['admin', 'faculty', 'student'],
  '/dashboard': ['admin', 'faculty', 'student'],
  '/users': ['admin'],
  '/analytics': ['admin', 'faculty'],
  '/setup-wizard': ['admin']
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/about',
  '/privacy-policy',
  '/demo-interactive',
  '/nep-2020'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  
  // If no tokens, redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For protected routes, check role-based access
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )
  
  if (matchedRoute) {
    // In a real app, you'd decode the JWT to get the user role
    // For now, we'll let the client-side handle role verification
    // since we can't easily decode JWT in middleware without additional setup
    
    // Add user info to headers for client-side use
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
