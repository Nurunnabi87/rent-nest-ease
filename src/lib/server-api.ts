import "server-only";
import { cookies } from "next/headers";

import { API_BASE_URL, TOKEN_COOKIE } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import type { ApiEnvelope, ApiFieldError } from "@/types/api";

interface ServerFetchOptions extends RequestInit {
  revalidate?: number | false;
}

/**
 * Envelope-aware fetch for Server Components. Reads the auth token from the
 * request cookies (public pages simply won't have one).
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {}
): Promise<ApiEnvelope<T>> {
  const { revalidate = 60, headers, ...init } = options;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    next: { revalidate },
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "Unexpected response from the server.");
  }

  const body = json as {
    success?: boolean;
    message?: string;
    errorDetails?: ApiFieldError[] | string;
  };

  if (!res.ok || body.success === false) {
    throw new ApiError(
      res.status,
      body.message ?? `Request failed (${res.status})`,
      body.errorDetails
    );
  }

  return json as ApiEnvelope<T>;
}
