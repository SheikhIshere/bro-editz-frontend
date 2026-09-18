"use server";

import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "./constants";
import type {
  AuthTokenPair,
  BackendResult,
  RefreshedAccessToken,
} from "./types";
import { HeroContent } from "@/app/admin/components/types";
import axiosInstance from "../axios";
import { AxiosError } from "axios";
import { decodeJwt } from "./utils";

type JsonObject = Record<string, unknown>;

export interface ChangeAdminPasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  password2: string;
}

function extractErrorMessage(payload: any): string | null {
  if (!payload) return null;

  const candidateKeys = ["error", "detail", "message"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return null;
}


/**
 * Executes an axios request and wraps the result in a BackendResult.
 */
async function executeRequest<T>(
  requestFn: () => Promise<any>
): Promise<BackendResult<T>> {
  try {
    const response = await requestFn();
    return {
      ok: true,
      status: response.status,
      data: response.data,
      message: response.data?.message || null,
    };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response) {
      return {
        ok: false,
        status: error.response.status,
        data: null,
        message: extractErrorMessage(error.response.data),
      };
    }
    return {
      ok: false,
      status: 503,
      data: null,
      message: error.message || "Service unavailable",
    };
  }
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<BackendResult<AuthTokenPair>> {
  return executeRequest(() =>
    axiosInstance.post("/users/login/", { email, password })
  );
}

export async function refreshAccessToken(
  refresh: string
): Promise<BackendResult<RefreshedAccessToken>> {
  return executeRequest(() =>
    axiosInstance.post("/users/token/refresh/", { refresh })
  );
}

export async function verifyAdmin(
  accessToken: string
): Promise<BackendResult<null>> {
  return executeRequest(() =>
    axiosInstance.get("/faqs/admin/?limit=1", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function changeAdminPassword(
  accessToken: string,
  input: ChangeAdminPasswordInput
): Promise<BackendResult<null>> {
  return executeRequest(() =>
    axiosInstance.post(
      "/users/change-password/",
      {
        old_password: input.oldPassword,
        new_password: input.newPassword,
        confirm_password: input.confirmPassword,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  );
}

export async function createAdmin(
  accessToken: string,
  input: CreateAdminInput
): Promise<BackendResult<null>> {
  return executeRequest(() =>
    axiosInstance.post(
      "/users/add/",
      {
        email: input.email,
        password: input.password,
        password2: input.password2,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  );
}

export async function getHeroContent(): Promise<BackendResult<any>> {
  return executeRequest(() => axiosInstance.get("/heroes/hero-card/text/"));
}

export async function listHeroContent(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/heroes/hero-card/text/list/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createHeroContent(
  data: Partial<HeroContent>
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/heroes/hero-card/text/list/", {
      ...data,
      verification_status: data.verification_status || "COMPLETED"
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateHeroContent(
  id: number,
  data: Partial<HeroContent>
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/heroes/hero-card/text/${id}/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteHeroContent(id: number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/heroes/hero-card/text/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Hero Videos API
export async function listHeroVideos(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/heroes/hero-card/video/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createHeroVideo(data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  // Use FormData if there is a file (thumbnail), otherwise JSON
  const headers: any = { Authorization: `Bearer ${accessToken}` };
  let body = data;

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
    body = data;
  }

  return executeRequest(() =>
    axiosInstance.post("/heroes/hero-card/video/", body, { headers })
  );
}

export async function updateHeroVideo(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: any = { Authorization: `Bearer ${accessToken}` };
  let body = data;

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
    body = data;
  }

  return executeRequest(() =>
    axiosInstance.patch(`/heroes/hero-card/video/${id}/`, body, { headers })
  );
}

export async function deleteHeroVideo(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/heroes/hero-card/video/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Core Services API
export async function listCoreServices(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/services/service/core/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createCoreService(data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/services/service/core/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateCoreService(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/services/service/core/${id}/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteCoreService(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/services/service/core/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Expertise API
export async function listExpertise(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/services/service/expertise/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createExpertise(data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/services/service/expertise/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateExpertise(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/services/service/expertise/${id}/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteExpertise(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/services/service/expertise/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Worked With API
export async function listWorkedWith(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/services/service/worked-with/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createWorkedWith(data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/services/service/worked-with/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateWorkedWith(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/services/service/worked-with/${id}/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteWorkedWith(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/services/service/worked-with/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Works API
export async function listWorksAdmin(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/works/admin/list/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createWork(
  data: FormData | JsonObject
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.post("/works/admin/post/", data, { headers })
  );
}

export async function updateWork(
  id: string | number,
  data: FormData | JsonObject
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.patch(`/works/admin/${id}/update/`, data, { headers })
  );
}

export async function deleteWork(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/works/admin/${id}/delete/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function featureWork(
  id: string | number,
  data: { is_featured?: boolean; visibility?: boolean }
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/works/admin/${id}/feature/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Tags API
export async function listTags(): Promise<BackendResult<any>> {
  return executeRequest(() => axiosInstance.get("/tags/post/"));
}

export async function createTag(data: {
  name: string;
  description?: string;
}): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/tags/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteTag(
  id: number | string
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/tags/delete/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Reviews API
export interface TextReviewPayload {
  client_name: string;
  designation?: string;
  review_text: string;
  star_rating: string;
  status?: "PENDING" | "RUNNING" | "VERIFIED" | "REJECTED";
  featured?: boolean;
  company_logo?: File;
}

export interface VideoReviewPayload {
  title: string;
  description?: string;
  video_url?: string;
  featured?: boolean;
}

export async function listTextReviews(params?: Record<string, any>): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/review/text/", {
      params,
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createTextReview(
  data: FormData | TextReviewPayload
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.post("/review/text/", data, { headers })
  );
}

export async function updateTextReview(
  id: string | number,
  data: FormData | Partial<TextReviewPayload>
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.patch(`/review/text/${id}/`, data, { headers })
  );
}

export async function deleteTextReview(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/review/text/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function featureTextReview(
  id: string | number,
  featured: boolean
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(
      `/review/text/${id}/featured`,
      { featured },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  );
}

export async function listVideoReviews(params?: Record<string, any>): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/review/video/", {
      params,
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createVideoReview(
  data: FormData | VideoReviewPayload
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.post("/review/video/", data, { headers })
  );
}

export async function updateVideoReview(
  id: string | number,
  data: FormData | Partial<VideoReviewPayload>
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return executeRequest(() =>
    axiosInstance.patch(`/review/video/${id}/`, data, { headers })
  );
}

export async function deleteVideoReview(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/review/video/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function featureVideoReview(
  id: string | number,
  featured: boolean
): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(
      `/review/video/${id}/featured`,
      { featured },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  );
}

/**
 * Server Action to authenticate an admin.
 */
export async function authenticateAdminAction(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; email?: string }> {
  try {
    const loginResult = await loginAdmin(email.trim(), password);

    if (!loginResult.ok || !loginResult.data) {
      return {
        success: false,
        message: loginResult.message ?? "Invalid email or password.",
      };
    }

    const adminCheck = await verifyAdmin(loginResult.data.access);
    if (!adminCheck.ok) {
      return {
        success: false,
        message: "You do not have admin access.",
      };
    }

    const cookieStore = cookies();

    cookieStore.set(ACCESS_COOKIE_NAME, loginResult.data.access, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    cookieStore.set(REFRESH_COOKIE_NAME, loginResult.data.refresh, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    const decoded = decodeJwt(loginResult.data.access);
    const userEmail = decoded?.email || email.trim();

    return {
      success: true,
      message: "Authenticated successfully.",
      email: userEmail
    };
  } catch (error) {
    console.error("Auth Action Error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during authentication.",
    };
  }
}
// FAQ Admin API
export async function listFAQsAdmin(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/faqs/admin/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function createFAQ(data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post("/faqs/admin-create/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateFAQ(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.put(`/faqs/${id}/edit/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteFAQ(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/faqs/${id}/delete/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function featureFAQ(id: string | number, isFeatured: boolean): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.put(`/faqs/${id}/feature/`, { is_featured: isFeatured }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}
export async function readFAQ(id: string | number, isRead: boolean): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.put(`/faqs/${id}/read/`, { is_read: isRead }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateFAQAnswered(id: string | number, isAnswered: boolean): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  // Note: we might not have a direct toggle for answered, but we can use edit endpoint
  return executeRequest(() =>
    axiosInstance.patch(`/faqs/${id}/edit/`, { is_answered: isAnswered }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}
// Contact Leads API
export async function listContactLeads(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/contacts/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateContactStatus(id: string | number, status: string): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.patch(`/contacts/${id}/`, { mail_status: status }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteContactLead(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/contacts/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

// Newsletter Admin API
export async function listNewsletterEmails(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/newsletters/emails/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function listNewsletterSpamEmails(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/newsletters/spam-emails/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function markEmailAsSpam(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post(`/newsletters/${id}/spam/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function restoreEmailFromSpam(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.post(`/newsletters/spam/${id}/restore/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function deleteNewsletterEmail(id: string | number): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.delete(`/newsletters/delete/${id}/email/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function exportNewsletterPDF(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  
  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      data: null,
      message: "Admin authentication required for export",
    };
  }
  
  return executeRequest(() =>
    axiosInstance.post("/newsletters/export/", {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function downloadNewsletterPDF(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  
  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      data: null,
      message: "Admin authentication required for download",
    };
  }
  
  try {
    const response = await axiosInstance.get("/newsletters/export/download/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'blob'
    });
    
    return {
      ok: true,
      status: 200,
      data: response.data, // Return the blob data
      message: "PDF data retrieved successfully",
    };
  } catch (error: any) {
    return {
      ok: false,
      status: error.response?.status || 500,
      data: null,
      message: error.response?.data?.detail || "Download failed",
    };
  }
}
// Footer Admin API
export async function listFooterAdmin(): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.get("/footer/admin/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}

export async function updateFooterAdmin(id: string | number, data: any): Promise<BackendResult<any>> {
  const accessToken = cookies().get(ACCESS_COOKIE_NAME)?.value;
  return executeRequest(() =>
    axiosInstance.put(`/footer/admin/${id}/`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
}
