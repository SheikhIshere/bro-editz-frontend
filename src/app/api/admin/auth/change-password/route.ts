import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
} from "@/lib/admin-auth/constants";
import {
  changeAdminPassword,
  type ChangeAdminPasswordInput,
  refreshAccessToken,
  verifyAdmin,
} from "@/lib/admin-auth/server";

interface ChangePasswordApiResponse {
  changed: boolean;
  message?: string;
}

function setAccessCookie(response: NextResponse, accessToken: string): void {
  response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

function parseRequestPayload(payload: unknown): ChangeAdminPasswordInput | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const currentPassword =
    typeof data.currentPassword === "string"
      ? data.currentPassword
      : null;
  const newPassword =
    typeof data.newPassword === "string" ? data.newPassword : null;
  const confirmPassword =
    typeof data.confirmPassword === "string"
      ? data.confirmPassword
      : null;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return null;
  }

  return {
    oldPassword: currentPassword,
    newPassword,
    confirmPassword,
  };
}

function withRefreshedAccessCookie(
  response: NextResponse,
  refreshedAccessToken: string | null
): NextResponse {
  if (refreshedAccessToken) {
    setAccessCookie(response, refreshedAccessToken);
  }
  return response;
}

function unauthorizedResponse(
  message = "Session expired. Please login again."
): NextResponse {
  const response = NextResponse.json<ChangePasswordApiResponse>(
    { changed: false, message },
    { status: 401 }
  );
  clearAuthCookies(response);
  return response;
}

function failureResponse(
  status: number,
  message: string,
  refreshedAccessToken: string | null
): NextResponse {
  const response = NextResponse.json<ChangePasswordApiResponse>(
    { changed: false, message },
    { status }
  );
  return withRefreshedAccessCookie(response, refreshedAccessToken);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json<ChangePasswordApiResponse>(
      {
        changed: false,
        message: "Current password, new password, and confirm password are required.",
      },
      { status: 400 }
    );
  }

  const payload = parseRequestPayload(rawPayload);
  if (!payload) {
    return NextResponse.json<ChangePasswordApiResponse>(
      {
        changed: false,
        message: "Current password, new password, and confirm password are required.",
      },
      { status: 400 }
    );
  }

  if (payload.newPassword.length < 8) {
    return NextResponse.json<ChangePasswordApiResponse>(
      { changed: false, message: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  if (payload.newPassword !== payload.confirmPassword) {
    return NextResponse.json<ChangePasswordApiResponse>(
      { changed: false, message: "New passwords do not match." },
      { status: 400 }
    );
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;

  if (!accessToken && !refreshToken) {
    return unauthorizedResponse();
  }

  let refreshedAccessToken: string | null = null;
  let changeResult = accessToken
    ? await changeAdminPassword(accessToken, payload)
    : null;

  const shouldTryRefresh =
    !changeResult || changeResult.status === 401 || changeResult.status === 403;

  if (shouldTryRefresh) {
    if (!refreshToken) {
      return unauthorizedResponse();
    }

    const refreshedAccess = await refreshAccessToken(refreshToken);
    if (!refreshedAccess.ok || !refreshedAccess.data) {
      return unauthorizedResponse();
    }

    const adminCheck = await verifyAdmin(refreshedAccess.data.access);
    if (!adminCheck.ok) {
      return unauthorizedResponse();
    }

    refreshedAccessToken = refreshedAccess.data.access;
    changeResult = await changeAdminPassword(refreshedAccessToken, payload);
  }

  if (!changeResult) {
    return failureResponse(
      503,
      "Unable to change password right now.",
      refreshedAccessToken
    );
  }

  if (changeResult.ok) {
    const response = NextResponse.json<ChangePasswordApiResponse>(
      {
        changed: true,
        message: changeResult.message ?? "Password changed successfully.",
      },
      { status: 200 }
    );
    return withRefreshedAccessCookie(response, refreshedAccessToken);
  }

  if (changeResult.status === 401 || changeResult.status === 403) {
    return unauthorizedResponse();
  }

  if (changeResult.status === 400) {
    return failureResponse(
      400,
      changeResult.message ?? "Unable to change password.",
      refreshedAccessToken
    );
  }

  const fallbackStatus =
    changeResult.status >= 400 && changeResult.status < 600
      ? changeResult.status
      : 503;

  return failureResponse(
    fallbackStatus,
    changeResult.message ?? "Unable to change password right now.",
    refreshedAccessToken
  );
}
