import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/jwt';

const TOKEN_COOKIE = 'cms_admin_token';
const PROTECTED_PREFIXES = ['/dashboard', '/pages', '/posts', '/media', '/settings'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function isTokenValid(token: string) {
  try {
    await verifyAuthToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token || !(await isTokenValid(token))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pages/:path*', '/posts/:path*', '/media/:path*', '/settings/:path*']
};
