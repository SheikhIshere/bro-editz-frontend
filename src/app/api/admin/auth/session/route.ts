import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
} from "@/lib/admin-auth/constants";
import { refreshAccessToken, verifyAdmin } from "@/lib/admin-auth/server";
import { decodeJwt } from "@/lib/admin-auth/utils";

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

function unauthorizedResponse(message = "Session expired."): NextResponse {
  const response = NextResponse.json(
    { authenticated: false, message },
    { status: 401 }
  );
  clearAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;

  if (!accessToken && !refreshToken) {
    return unauthorizedResponse();
  }

  if (accessToken) {
    const accessCheck = await verifyAdmin(accessToken);
    if (accessCheck.ok) {
      const decoded = decodeJwt(accessToken);
      return NextResponse.json(
        { authenticated: true, email: decoded?.email },
        { status: 200 }
      );
    }
  }

  if (!refreshToken) {
    return unauthorizedResponse();
  }

  const refreshResult = await refreshAccessToken(refreshToken);
  if (!refreshResult.ok || !refreshResult.data) {
    return unauthorizedResponse();
  }

  const refreshedAccess = refreshResult.data.access;
  const refreshedAdminCheck = await verifyAdmin(refreshedAccess);
  if (!refreshedAdminCheck.ok) {
    return unauthorizedResponse();
  }

  const response = NextResponse.json(
    { authenticated: true, email: decodeJwt(refreshedAccess)?.email },
    { status: 200 }
  );
  setAccessCookie(response, refreshedAccess);
  return response;
}