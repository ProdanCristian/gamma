import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const i18nMiddleware = createMiddleware(routing);

const middleware = async (request) => {
  const pathname = request.nextUrl.pathname;

  if (pathname.includes("/dashboard")) {
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

export const config = {
  matcher: [
    "/dashboard",
    "/(ro|ru)/dashboard",
    "/",
    "/ro",
    "/ru",
    "/(ro|ru)/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
