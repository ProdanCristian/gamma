import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const i18nMiddleware = createMiddleware(routing);

const middleware = async (request) => {
  const pathname = request.nextUrl.pathname;
  
  // Add cache headers for static routes
  if (pathname === '/' || pathname === '/ro' || pathname === '/ru') {
    const response = i18nMiddleware(request);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    // Remove unnecessary cookie setting for static routes
    response.headers.delete('Set-Cookie');
    response.headers.delete('x-middleware-set-cookie');
    return response;
  }

  // Only check auth for dashboard routes
  if (pathname.includes('/dashboard')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session) {
      const locale = pathname.startsWith("/ro")
        ? "ro"
        : pathname.startsWith("/ru")
        ? "ru"
        : "";

      const redirectUrl = new URL(locale ? `/${locale}` : "/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return i18nMiddleware(request);
};

export default middleware;

// Optimize matcher to be more specific
export const config = {
  matcher: [
    // Protected routes
    '/dashboard',
    '/(ro|ru)/dashboard',
    
    // Static routes
    '/',
    '/ro',
    '/ru',
    
    // Dynamic routes that need i18n
    '/(ro|ru)/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
