export type UserRole = "ADMIN" | "SECURITY" | "RESIDENT";

export type Language = "ENGLISH" | "HAUSA" | "IGBO" | "YORUBA" | "PIDGIN";

export type IncidentType =
  | "POSSIBLE_INTRUSION"
  | "SUSPICIOUS_PERSON"
  | "SUSPICIOUS_VEHICLE"
  | "FIRE"
  | "OTHER";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "ALERTING"
  | "ALERTS_SENT"
  | "ALERTS_PARTIALLY_FAILED"
  | "DISMISSED"
  | "RESOLVED";

export type AlertStatus =
  | "PENDING"
  | "QUEUED"
  | "SENDING"
  | "SENT"
  | "DELIVERED"
  | "FAILED";

export interface Zone {
  id: string;
  name: string;
  description?: string | null;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users?: number;
    incidents?: number;
  };
}

export interface UserProfile {
  id: string;
  email?: string | null;
  phone: string;
  name?: string | null;
  fullName?: string | null;
  role: UserRole;
  preferredLanguage: Language;
  alertsEnabled: boolean;
  latitude?: number | null;
  longitude?: number | null;
  zoneId?: string | null;
  zoneName?: string | null;
  houseNumber?: string | null;
  areaDescription?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  zone?: Zone | null;
}

export interface DashboardRouting {
  route: string;
  roleTitle: string;
  allowedSections: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  dashboard: DashboardRouting;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  blastRadiusMeters: number;
  latitude: number;
  longitude: number;
  zoneId: string | null;
  reportedById: string;
  verifiedById: string | null;
  dismissedById: string | null;
  resolvedById: string | null;
  dismissReason: string | null;
  resolveNotes: string | null;
  version: number;
  reportedAt: string;
  verifiedAt: string | null;
  dismissedAt: string | null;
  resolvedAt: string | null;
  alertsCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    phone: string;
    fullName: string | null;
    role: UserRole;
  } | null;
  verifier?: {
    id: string;
    phone: string;
    fullName: string | null;
    role: UserRole;
  } | null;
  zone?: Zone | null;
  alerts?: AlertItem[];
  _count?: {
    alerts?: number;
  };
}

export interface AlertItem {
  id: string;
  incidentId: string;
  recipientId: string;
  recipientPhone: string;
  recipientRole: UserRole;
  language: Language;
  messageText: string;
  status: AlertStatus;
  segmentCount: number;
  attemptCount: number;
  providerMessageId: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface RenderedMessagePreview {
  language: Language;
  text: string;
  segmentCount: number;
  encoding: "GSM-7" | "UCS-2";
  reviewStatus: "APPROVED" | "NEEDS_NATIVE_REVIEW";
}

export interface RecipientPreviewResult {
  incidentId: string;
  incidentNumber: string;
  severity: IncidentSeverity;
  blastRadiusMeters: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  totalRecipients: number;
  physicallyNearbyCount: number;
  communityMemberCount: number;
  overlapCount: number;
  roleBreakdown: {
    residents: number;
    security: number;
  };
  languageBreakdown: Record<Language, number>;
  skippedCount: number;
  skippedReasons?: {
    noCoordinatesOrZone?: number;
    alertsDisabled?: number;
    inactiveAccount?: number;
  };
  estimatedSegments: number;
  estimatedCostNgn: number;
  renderedMessages: Record<Language, RenderedMessagePreview>;
  requiresNativeReviewWarning: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
