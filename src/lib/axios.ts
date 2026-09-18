import axios from "axios";
import { BACKEND_API_BASE_URL, ACCESS_COOKIE_NAME } from "./admin-auth/constants";
import { apiCache } from "./cache";

/**
 * Cached GET request wrapper
 */
export const cachedGet = async (url: string, ttl: number = 5 * 60 * 1000) => {
  // Check cache first
  const cached = apiCache.get(url);
  if (cached) {
    console.log(`Cache hit for ${url}`);
    return { data: cached };
  }

  // If not cached, make request
  try {
    const response = await axiosInstance.get(url);
    apiCache.set(url, response.data, ttl);
    console.log(`Cache set for ${url}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, (error as any).message || error);
    throw error;
  }
};

/**
 * Helper to get a cookie value by name (client-side only)
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

const axiosInstance = axios.create({
  baseURL: BACKEND_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Note: Cookies are only accessible on the client side via document.cookie if they are NOT httpOnly.
    // In this project, ACCESS_COOKIE_NAME is set with httpOnly: true, which means it CANNOT be read via JS.
    // However, the browser will automatically send it with the request if it's a cookie-based auth.
    // If the backend expects a Bearer token in the Authorization header, we might need a different approach
    // (like a client-side API route that proxies the request or stores the token in a way accessible to JS).
    
    // For now, if there's an access token available in a non-httpOnly cookie or local storage, add it.
    const token = getCookie(ACCESS_COOKIE_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error statuses gracefully
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - could trigger a logout or token refresh
          console.error("Unauthorized request - 401");
          break;
        case 403:
          // Forbidden
          console.error("Forbidden request - 403");
          break;
        case 404:
          // Not Found
          console.error("Resource not found - 404");
          break;
        case 500:
          // Internal Server Error
          console.error("Internal server error - 500");
          break;
        default:
          console.error(`An error occurred: ${status}`, data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server. Is the backend running?");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Error:", (error as any).message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
