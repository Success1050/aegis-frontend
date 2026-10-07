import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random UUID v4 string for request tracing and idempotency keys
 */
export function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Mask Nigerian phone numbers according to NDPR standards:
 * e.g. +2348012345678 -> +234801•••5678
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.trim();
  if (cleaned.length < 9) return cleaned;
  const prefix = cleaned.slice(0, 7); // e.g. +234801
  const suffix = cleaned.slice(-4);  // e.g. 5678
  return `${prefix}•••${suffix}`;
}

/**
 * Format a Date to West Africa Time (WAT, UTC+1) with a readable label
 * e.g. "06 Oct 2026, 17:30 WAT"
 */
export function formatWAT(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d) + " WAT";
}

/**
 * Format relative time (e.g. "3 mins ago", "just now")
 */
export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
