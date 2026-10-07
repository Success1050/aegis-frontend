import { generateUuid } from "./utils";
import type { ApiErrorResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export class ApiError extends Error {
  statusCode: number;
  error: string;
  details?: Record<string, unknown>;
  requestId?: string;
  rawMessages: string[];

  constructor(payload: ApiErrorResponse) {
    const msg = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message || "An unexpected error occurred";
    super(msg);
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.error = payload.error || "Error";
    this.details = payload.details;
    this.requestId = payload.requestId;
    this.rawMessages = Array.isArray(payload.message)
      ? payload.message
      : [payload.message];
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  idempotencyKey?: string;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Access token getter and setter from local memory / storage for bearer token fallback
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("aegis_access_token");
  },
  setAccessToken: (token: string | null): void => {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("aegis_access_token", token);
    } else {
      localStorage.removeItem("aegis_access_token");
    }
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("aegis_refresh_token");
  },
  setRefreshToken: (token: string | null): void => {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("aegis_refresh_token", token);
    } else {
      localStorage.removeItem("aegis_refresh_token");
    }
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("aegis_access_token");
    localStorage.removeItem("aegis_refresh_token");
    localStorage.removeItem("aegis_user");
  },
};

/**
 * Refresh access token helper
 */
async function refreshAuthTokens(): Promise<string | null> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-request-id": generateUuid(),
    };

    // Both HttpOnly cookies (via credentials: 'include') and explicit body
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clear();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      tokenStorage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }
      return data.accessToken;
    }
    return null;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

/**
 * Core HTTP client wrapper with automated request ID, idempotency keys,
 * dual-delivery credentials, and 401 refresh interceptor.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    body,
    idempotencyKey,
    skipAuth = false,
    headers: customHeaders,
    ...fetchInit
  } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const requestId = generateUuid();
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("x-request-id", requestId);

  // If a mutating request and caller provided or we generate an idempotency key
  if (
    idempotencyKey &&
    fetchInit.method &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(fetchInit.method.toUpperCase())
  ) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  // Dual-delivery: include Bearer token header if present in storage
  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const serializedBody =
    body !== undefined
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchInit,
      headers,
      body: serializedBody,
      credentials: "include", // Essential for HttpOnly cookie pass-through
    });
  } catch (err: unknown) {
    const networkError: ApiErrorResponse = {
      statusCode: 0,
      error: "NetworkError",
      message:
        err instanceof Error
          ? err.message
          : "Network request failed. Please check your connection.",
      requestId,
    };
    throw new ApiError(networkError);
  }

  // Handle 401 Unauthorized with token refresh flow (except on auth endpoints)
  if (
    response.status === 401 &&
    !skipAuth &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAuthTokens();
      isRefreshing = false;
      onRefreshed(newToken);

      if (newToken) {
        // Retry original request with new token
        headers.set("Authorization", `Bearer ${newToken}`);
        const retryRes = await fetch(url, {
          ...fetchInit,
          headers,
          body: serializedBody,
          credentials: "include",
        });
        return handleResponse<T>(retryRes, requestId);
      } else {
        // Redirect to login if in browser
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?expired=true";
        }
      }
    } else {
      // Wait for existing refresh to complete
      const retryPromise = new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async (token) => {
          if (!token) {
            reject(
              new ApiError({
                statusCode: 401,
                error: "Unauthorized",
                message: "Session expired. Please log in again.",
                requestId,
              })
            );
            return;
          }
          headers.set("Authorization", `Bearer ${token}`);
          try {
            const retryRes = await fetch(url, {
              ...fetchInit,
              headers,
              body: serializedBody,
              credentials: "include",
            });
            resolve(await handleResponse<T>(retryRes, requestId));
          } catch (e) {
            reject(e);
          }
        });
      });
      return retryPromise;
    }
  }

  return handleResponse<T>(response, requestId);
}

async function handleResponse<T>(res: Response, requestId: string): Promise<T> {
  // If no content returned (e.g. 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let errorData: ApiErrorResponse;
    if (isJson) {
      try {
        errorData = await res.json();
      } catch {
        errorData = {
          statusCode: res.status,
          error: res.statusText,
          message: "Failed to parse error response from server",
          requestId,
        };
      }
    } else {
      const text = await res.text();
      errorData = {
        statusCode: res.status,
        error: res.statusText,
        message: text || `HTTP ${res.status}: ${res.statusText}`,
        requestId,
      };
    }

    if (!errorData.requestId) {
      errorData.requestId = requestId;
    }

    throw new ApiError(errorData);
  }

  if (isJson) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body,
      // Auto-generate idempotency key for POST if not provided
      idempotencyKey: options?.idempotencyKey || generateUuid(),
    }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
      idempotencyKey: options?.idempotencyKey || generateUuid(),
    }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
      idempotencyKey: options?.idempotencyKey || generateUuid(),
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
