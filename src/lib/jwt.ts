import type { Role } from "@/types/models";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Decodes a JWT payload without verifying the signature (Edge-safe, no
 * dependencies). Used only for routing/display — the backend re-verifies
 * the signature on every API request, so tampering here gains nothing.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as JwtPayload;
    if (!payload.userId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
}
