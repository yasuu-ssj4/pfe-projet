import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session_id');

  const protectedRoutes = ['/dashboard'];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}
