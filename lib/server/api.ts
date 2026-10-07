import { cookies, headers } from "next/headers";
import type { ApiErrorResponse } from "@/types";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

/**
 * Server-side API client for React Server Components.
 * Automatically forwards HttpOnly cookies and request tracking headers.
 */
export async function serverApi<T = unknown>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined | null>;
    revalidate?: number | false;
    tags?: string[];
  } = {}
): Promise<T | null> {
  const { method = "GET", body, params, revalidate, tags } = options;

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

  // Read cookies from incoming request headers in RSC
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const reqHeaders = await headers();
  const requestId = reqHeaders.get("x-request-id") || crypto.randomUUID();

  const fetchHeaders = new Headers({
    "Content-Type": "application/json",
    "x-request-id": requestId,
  });

  if (cookieHeader) {
    fetchHeaders.set("Cookie", cookieHeader);
  }

  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    fetchHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const nextOptions: Record<string, unknown> = {};
  if (revalidate !== undefined) {
    nextOptions.revalidate = revalidate;
  }
  if (tags && tags.length > 0) {
    nextOptions.tags = tags;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
      next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
      cache: revalidate === undefined && !tags ? "no-store" : undefined,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 404) {
        return null;
      }
      const errText = await res.text();
      console.error(`[ServerApi Error] ${method} ${url} -> ${res.status}:`, errText);
      return null;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[ServerApi Network Error] ${method} ${url}:`, error);
    return null;
  }
}
