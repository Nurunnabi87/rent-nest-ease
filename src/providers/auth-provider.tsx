"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api-client";
import {
  clearToken,
  getServerTokenSnapshot,
  getTokenSnapshot,
  setToken,
  subscribeToToken,
} from "@/lib/auth-cookie";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import { DASHBOARD_HOME } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import type { AuthUser } from "@/types/models";

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, redirect?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // The cookie is the single source of truth; subscribing to it avoids
  // duplicating auth state (and keeps SSR output token-free).
  const token = useSyncExternalStore(
    subscribeToToken,
    getTokenSnapshot,
    getServerTokenSnapshot
  );

  const payload = useMemo(() => {
    if (!token) return null;
    const decoded = decodeJwtPayload(token);
    return decoded && !isTokenExpired(decoded) ? decoded : null;
  }, [token]);

  const { data: me, isPending } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return (await apiFetch<AuthUser>("/api/auth/me")).data;
      } catch (error) {
        // A rejected token is a dead token — drop it so the UI logs out.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearToken();
          if (error.status === 403) {
            toast.error("Your account has been banned. Contact support for help.");
          }
        }
        throw error;
      }
    },
    enabled: payload !== null,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && [401, 403].includes(error.status)) &&
      failureCount < 1,
  });

  // Until /auth/me resolves, the JWT claims are enough to render the UI.
  const user: AuthUser | null = useMemo(() => {
    if (me) return me;
    if (!payload) return null;
    return {
      id: payload.userId,
      name: payload.email.split("@")[0],
      email: payload.email,
      role: payload.role,
    };
  }, [me, payload]);

  const login = useCallback(
    async (email: string, password: string, redirect?: string) => {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const { accessToken, user: loggedIn } = res.data;

      queryClient.clear();
      setToken(accessToken);
      queryClient.setQueryData(queryKeys.me, loggedIn);

      toast.success(`Welcome back, ${loggedIn.name}!`);
      router.push(redirect ?? DASHBOARD_HOME[loggedIn.role] ?? "/");
      router.refresh();
    },
    [queryClient, router]
  );

  const logout = useCallback(() => {
    clearToken();
    queryClient.clear();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }, [queryClient, router]);

  const value = useMemo(
    () => ({ user, isLoading: payload !== null && !me && isPending, login, logout }),
    [user, payload, me, isPending, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
