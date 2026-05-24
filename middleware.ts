import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('crm_admin_token')?.value;

  if (PUBLIC_PATHS.includes(pathname)) {
    // Already authenticated admin visiting /login → send to dashboard
    if (token && isTokenValid(token)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // No token → send to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token present but invalid (expired, wrong role, malformed) → clear + redirect
  if (!isTokenValid(token)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('crm_admin_token');
    return response;
  }

  return NextResponse.next();
}

/**
 * Validates the JWT for middleware-level access control.
 *
 * IMPORTANT: The edge runtime cannot verify the JWT signature (no access to
 * the secret). This function is a UX guard, not a security boundary — the
 * backend validates the full JWT on every API call. What we add here:
 *   1. Structural validity (3 segments)
 *   2. Required claims present (exp, userId, role)
 *   3. Role must be 'admin' — prevents a customer token from reaching the CRM
 *   4. Token must not be expired
 *
 * A customer token with a valid exp would previously pass through. Now it
 * is rejected at the middleware level before any dashboard code runs.
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    // A well-formed JWT always has exactly 3 dot-separated segments
    if (parts.length !== 3) return false;

    // Base64url → Base64 → JSON (URL-safe alphabet uses - and _ instead of + and /)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as Record<string, unknown>;

    // Reject tokens missing required claims
    if (!payload.exp || !payload.userId || !payload.role) return false;

    // Reject non-admin tokens — a customer JWT must not access the CRM
    if (payload.role !== 'admin') return false;

    // Reject expired tokens (exp is in seconds; Date.now() is in ms)
    if ((payload.exp as number) * 1000 < Date.now()) return false;

    return true;
  } catch {
    // Any parse error (malformed base64, invalid JSON) → treat as invalid
    return false;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|mockServiceWorker.js).*)'],
};
