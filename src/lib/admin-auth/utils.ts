import { BACKEND_API_BASE_URL } from "./constants";

/**
 * Decodes a JWT token without verification.
 * Safe for both server and client environments.
 */
export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // atob() works in both modern Node.js (≥16) and all browsers
    // No need for the Buffer branch which causes TypeScript errors in browser context
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Ensures an image URL is absolute, prepending the backend host if necessary.
 * It also handles cases where the backend returns an internal Docker URL (e.g. backend:8000)
 * which the browser cannot resolve.
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // If it's a local blob (from file upload preview), return as is
  if (url.startsWith('blob:')) return url;

  let path = url;

  // If the internal Docker host is present, strip it to get the relative path
  // (e.g., http://backend:8000/media/foo.jpg -> /media/foo.jpg)
  if (url.includes('/media/')) {
    const parts = url.split('/media/');
    path = '/media/' + parts[parts.length - 1];
  } else if (url.startsWith('http')) {
    // If it's already an absolute URL and doesn't look like an internal one, return it
    return url;
  }
  
  // Extract external host from BACKEND_API_BASE_URL 
  // (e.g., http://localhost:8005/v1/api -> http://localhost:8005)
  try {
    const urlObj = new URL(BACKEND_API_BASE_URL);
    const host = `${urlObj.protocol}//${urlObj.host}`;
    
    // Combine host with the cleaned path
    return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
  } catch (e) {
    // Fallback to relative URL if constants are missing/broken
    return path;
  }
}
