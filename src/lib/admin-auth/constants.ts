export const ACCESS_COOKIE_NAME = "admin_access_token";
export const REFRESH_COOKIE_NAME = "admin_refresh_token";

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const BACKEND_API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "").replace(/\/+$/, "");

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
