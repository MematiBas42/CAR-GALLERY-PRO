import { auth } from "@/auth";
import { routes } from "./config/routes";
import { NextResponse } from "next/server";


function setRequestHeaders(requestHeaders: Headers) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
      style-src 'self' 'nonce-${nonce}';
      img-src 'self' blob: data:;
      font-src 'self';
      base-uri 'self';
      object-src 'none';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
  `;

	const contentSecurityPolicy = cspHeader.replace(/\s{2,}/g, " ").trim();
	requestHeaders.set("x-nonce", nonce);
	requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
}
export default auth((req) => {
  const nextUrl = req.nextUrl.clone();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-next-intl-pathname', nextUrl.pathname);

  if (req.auth) {
    if (req.auth.requires2FA) {
      if (nextUrl.pathname === routes.challenge) {
        return NextResponse.next();
      }

      const challengeurl = new URL(routes.challenge, req.nextUrl.origin);
      return NextResponse.redirect(challengeurl);
    }
    if (nextUrl.pathname === routes.challenge ||
      nextUrl.pathname === routes.signIn
    ) {
      const adminUrl = new URL(routes.admin.dashboard, req.nextUrl.origin);
      return NextResponse.redirect(adminUrl);
    }
  } else {
    if (
      nextUrl.pathname.startsWith("/admin") ||
      nextUrl.pathname === routes.challenge
    ) {
      const signInurl = new URL(routes.signIn, req.nextUrl.origin);
      return NextResponse.redirect(signInurl);
    }
  }
  return NextResponse.next({
    request: {
			headers: requestHeaders,
		},
  });
});

export const config = {
  matcher:
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|logo.svg|sitemap.xml|robots.txt).*)",
    runtime: "nodejs",
};
