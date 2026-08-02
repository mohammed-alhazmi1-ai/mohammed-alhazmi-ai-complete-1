import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/register',
    '/pricing',
    '/about',
    '/contact',
    '/services',
    '/privacy',
    '/terms',
    '/forgot-password',
  ];

  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/user') ||
    pathname.startsWith('/api/gift') ||
    pathname.startsWith('/api/owner/maintenance')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/owner/:path*',
    '/api/generate',
    '/api/ai/:path*',
  ],
};
