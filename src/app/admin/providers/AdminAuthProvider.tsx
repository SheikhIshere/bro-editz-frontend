"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  AdminAuthApiResponse,
  AdminAuthContextValue,
  AdminAuthStatus,
} from "@/lib/admin-auth/types";

const LOGOUT_EVENT_KEY = "admin_logout_at";

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

async function requestSessionState(): Promise<AdminAuthApiResponse> {
  try {
    const response = await fetch("/api/admin/auth/session", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | AdminAuthApiResponse
      | null;

    if (response.ok) {
      return { authenticated: true };
    }

    return {
      authenticated: false,
      message: payload?.message ?? "Session expired.",
    };
  } catch {
    return {
      authenticated: false,
      message: "Unable to verify session.",
    };
  }
}

async function callLogoutEndpoint(): Promise<void> {
  try {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    });
  } catch {
    // no-op: local auth state is still reset on client
  }
}

export function AdminAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const session = await requestSessionState();
    if (session.authenticated) {
      setStatus("authenticated");
      if (session.email) {
        localStorage.setItem("admin_user_email", session.email);
      }
      return;
    }

    setStatus("unauthenticated");
    setError(session.message ?? "Session expired.");
  }, []);

  const logout = useCallback(async () => {
    await callLogoutEndpoint();

    setStatus("unauthenticated");
    setError(null);

    try {
      localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
      localStorage.removeItem("admin_user_email");
    } catch {
      // no-op for browsers where storage is unavailable
    }

    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      const session = await requestSessionState();
      if (!isActive) {
        return;
      }

      if (session.authenticated) {
        setStatus("authenticated");
        if (session.email) {
          localStorage.setItem("admin_user_email", session.email);
        }
        setError(null);
        return;
      }

      setStatus("unauthenticated");
      setError(session.message ?? "Session expired.");
    };

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      const safeNextPath =
        pathname && pathname.startsWith("/admin") ? pathname : "/admin";
      router.replace(`/admin/login?next=${encodeURIComponent(safeNextPath)}`);
    }
  }, [pathname, router, status]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        void refreshSession();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshSession]);

  const contextValue = useMemo<AdminAuthContextValue>(
    () => ({
      status,
      isAuthenticated: status === "authenticated",
      error,
      refreshSession,
      logout,
    }),
    [error, logout, refreshSession, status]
  );

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function AdminAuthGate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const auth = useContext(AdminAuthContext);

  if (!auth) {
    return <>{children}</>;
  }

  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p className="text-sm tracking-wider uppercase text-text-muted">
          Checking session...
        </p>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p className="text-sm tracking-wider uppercase text-text-muted">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
