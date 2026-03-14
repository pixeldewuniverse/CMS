import { NextResponse } from 'next/server';

const TOKEN_COOKIE = 'cms_admin_token';

export async function POST(request: Request) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
