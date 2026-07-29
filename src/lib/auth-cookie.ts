import Cookies from "js-cookie";

import { TOKEN_COOKIE } from "@/lib/constants";

/**
 * The JWT lives in a non-httpOnly cookie: the backend authenticates via
 * Authorization header only (wildcard CORS, no credentials), so client JS
 * must be able to read the token anyway — and keeping it in a cookie lets
 * Next.js Middleware read it server-side for route protection.
 *
 * Reads/writes go through a tiny subscribable store so components can track
 * the token with `useSyncExternalStore` instead of mirroring it into state.
 */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(TOKEN_COOKIE);
}

/** Snapshot form for useSyncExternalStore — must return a stable primitive. */
export function getTokenSnapshot(): string | null {
  return getToken() ?? null;
}

export function getServerTokenSnapshot(): string | null {
  return null;
}

export function setToken(token: string) {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: 7, // matches backend JWT_EXPIRES_IN=7d
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  emit();
}

export function clearToken() {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
  emit();
}
