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
    const { requires2FA } = req.auth;

    // CASE 1: User is logged in but needs 2FA
    if (requires2FA) {
      // Always allow access to the challenge page
      if (nextUrl.pathname === routes.challenge) {
        return NextResponse.next();
      }
      
      // If user tries to access Admin or Sign In page while pending 2FA, send to Challenge
      if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname === routes.signIn) {
        const challengeUrl = new URL(routes.challenge, req.nextUrl.origin);
        return NextResponse.redirect(challengeUrl);
      }

      // Allow access to all other public pages (Home, Inventory, etc.)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // CASE 2: User is fully authenticated (2FA completed)
    // Redirect Login or Challenge pages to Admin Dashboard
    if (nextUrl.pathname === routes.challenge || nextUrl.pathname === routes.signIn) {
      const adminUrl = new URL(routes.admin.dashboard, req.nextUrl.origin);
      return NextResponse.redirect(adminUrl);
    }
  } else {
    // User is NOT logged in
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
