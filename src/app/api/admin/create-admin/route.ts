import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
} from "@/lib/admin-auth/constants";
import {
  createAdmin,
  type CreateAdminInput,
  refreshAccessToken,
  verifyAdmin,
} from "@/lib/admin-auth/server";

interface CreateAdminApiResponse {
  success: boolean;
  message?: string;
  error?: string;
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

function parseRequestPayload(payload: unknown): CreateAdminInput | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email : null;
  const password = typeof data.password === "string" ? data.password : null;
  const password2 = typeof data.password2 === "string" ? data.password2 : null;

  if (!email || !password || !password2) {
    return null;
  }

  return { email, password, password2 };
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
  const response = NextResponse.json<CreateAdminApiResponse>(
    { success: false, error: message },
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
  const response = NextResponse.json<CreateAdminApiResponse>(
    { success: false, error: message },
    { status }
  );
  return withRefreshedAccessCookie(response, refreshedAccessToken);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json<CreateAdminApiResponse>(
      {
        success: false,
        error: "Email, password, and confirm password are required.",
      },
      { status: 400 }
    );
  }

  const payload = parseRequestPayload(rawPayload);
  if (!payload) {
    return NextResponse.json<CreateAdminApiResponse>(
      {
        success: false,
        error: "Email, password, and confirm password are required.",
      },
      { status: 400 }
    );
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;

  if (!accessToken && !refreshToken) {
    return unauthorizedResponse();
  }

  let refreshedAccessToken: string | null = null;
  let createResult = accessToken
    ? await createAdmin(accessToken, payload)
    : null;

  const shouldTryRefresh =
    !createResult || createResult.status === 401 || createResult.status === 403;

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
    createResult = await createAdmin(refreshedAccessToken, payload);
  }

  if (!createResult) {
    return failureResponse(
      503,
      "Unable to create admin right now.",
      refreshedAccessToken
    );
  }

  if (createResult.ok) {
    const response = NextResponse.json<CreateAdminApiResponse>(
      {
        success: true,
        message: createResult.message ?? "Admin user created successfully.",
      },
      { status: 201 }
    );
    return withRefreshedAccessCookie(response, refreshedAccessToken);
  }

  if (createResult.status === 401 || createResult.status === 403) {
    return unauthorizedResponse();
  }

  const fallbackStatus =
    createResult.status >= 400 && createResult.status < 600
      ? createResult.status
      : 503;

  return failureResponse(
    fallbackStatus,
    createResult.message ?? "Unable to create admin user.",
    refreshedAccessToken
  );
}
