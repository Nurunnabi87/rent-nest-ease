import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { API_BASE_URL } from "@/lib/constants";
import { getToken } from "@/lib/auth-cookie";
import type { ApiEnvelope, ApiFieldError } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorDetails?: ApiFieldError[] | string | Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends RequestInit {
  token?: string;
}

/**
 * Typed fetch against the RentNest backend. Returns the full response
 * envelope (so callers can read `meta`) and throws `ApiError` on any
 * non-2xx / `success: false` response.
 *
 * The backend uses wildcard CORS without credentials, so auth travels
 * exclusively via the Authorization header — never cookies.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiEnvelope<T>> {
  const { token, headers, ...init } = options;

  const authToken = token ?? getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, "Network error — please check your connection and try again.");
  }

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

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.errorDetails === "string" && error.errorDetails) {
      return error.errorDetails;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Maps backend Zod validation errors (`errorDetails: [{ field: "body.email",
 * message }]`) onto react-hook-form fields; anything that doesn't match a
 * form field is surfaced as a toast.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: string[]
): boolean {
  if (!(error instanceof ApiError) || !Array.isArray(error.errorDetails)) {
    return false;
  }
  let applied = false;
  for (const detail of error.errorDetails) {
    const name = detail.field.replace(/^(body|query|params)\./, "");
    if (fields.includes(name)) {
      setError(name as Path<T>, { type: "server", message: detail.message });
      applied = true;
    } else {
      toast.error(detail.message);
    }
  }
  return applied;
}
