import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18n } from "@root/i18n-config";
import { HIDE_PANORAMA_REPORT } from "@/constants/features";

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get("NEXT_LOCALE");
  const cookieLocale = cookie?.value;
  const pathname = request.nextUrl.pathname;

  // the stored PDFs of the Panorama reports are hidden until they are released
  if (HIDE_PANORAMA_REPORT && pathname.startsWith("/panorama-pdf/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  //console.log("Middleware running for:", pathname);
  //console.log("Current NEXT_LOCALE cookie:", cookieLocale);

  // Exclude static assets and API routes from locale redirection
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|geojson|json|svg|css|js|pdf)$/)
  ) {
    return NextResponse.next();
  }

  // Determine if the pathname includes a supported locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  //console.log("Pathname is missing locale:", pathnameIsMissingLocale);
  if (pathnameIsMissingLocale) {
    const preferredLocale = cookieLocale || i18n.defaultLocale;
    //console.log("Redirecting to preferred locale:", preferredLocale);

    // Redirect to the preferred locale
    const response = NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url),
    );

    // Set the locale in a cookie for future requests
    response.cookies.set("NEXT_LOCALE", preferredLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } else if (cookieLocale && !pathname.startsWith(`/${cookieLocale}`)) {
    const currentLocale = i18n.locales.find((locale) =>
      pathname.startsWith(`/${locale}`),
    );
    if (currentLocale) {
      // console.log("Updating cookie to current locale:", currentLocale);
      const response = NextResponse.next();
      response.cookies.set("NEXT_LOCALE", currentLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return response;
    }
  }

  //console.log("Proceeding without modification.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
