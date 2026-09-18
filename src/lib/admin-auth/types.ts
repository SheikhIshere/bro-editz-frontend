export type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AdminAuthApiResponse {
  authenticated: boolean;
  message?: string;
  email?: string;
}

export interface AuthTokenPair {
  access: string;
  refresh: string;
  email?: string;
}

export interface RefreshedAccessToken {
  access: string;
}

export interface BackendResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string | null;
}

export interface AdminAuthContextValue {
  status: AdminAuthStatus;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}
