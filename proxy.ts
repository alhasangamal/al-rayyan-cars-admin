import { NextRequest, NextResponse } from 'next/server';

const sessionCookieName = 'al_rayyan_admin_session';
const publicPaths = new Set(['/login']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);
  const isPublicPath = publicPaths.has(pathname);

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon-32x32.png|apple-touch-icon.png|logo-cropped.png|uploads|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico)$).*)',
  ],
};
