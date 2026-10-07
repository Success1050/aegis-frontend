# AEGIS Frontend Implementation Plan & Daily Tasks

> **Phase 1: Manual Early-Warning System — Production Dashboard**  
> **Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Leaflet/OpenStreetMap, Lucide Icons.  
> **Repository:** `aegis`

---

## Design Philosophy & UX Guarantees

1. **High-Stress Operational Clarity:** Designed for emergency response officers on phones (360px+) and desktop dispatch centers. Clear typography, high-contrast statuses, no ambiguous states.
2. **Never Verify Blind:** The verify action requires an interactive dry-run preview displaying exact recipient counts, language breakdown, message previews, and cost estimates before dispatch.
3. **Double-Action Prevention & Idempotency:** Submissions are debounced, submission buttons lock immediately with spinners, and all mutating requests transmit an `Idempotency-Key`.
4. **Resilient Real-Time State:** 10-second polling / SSE with automatic tab-visibility pausing, background reconnect, and audio-visual cues on new pending alerts.
5. **Human-Centric Nigerian Localization:** Times displayed in Africa/Lagos (WAT) with UTC on hover, phone numbers masked for NDPR privacy compliance (`+234801•••5678`), multilingual copy verification badges.

---

## Daily Task Breakdown

### Day 1: Project Setup, Design System & API Architecture
- [x] **Next.js & Tailwind Setup:** Verify App Router configuration, Tailwind CSS variables, and layout conventions.
- [x] **Design Tokens & Theme:** Set up accessible color palette for alert severities (`CRITICAL`: Red, `HIGH`: Orange, `MEDIUM`: Amber, `LOW`: Blue) and statuses (`PENDING_REVIEW`: Yellow, `VERIFIED`: Indigo, `ALERTING`: Purple, `ALERTS_SENT`: Emerald, `DISMISSED`: Slate, `RESOLVED`: Gray).
- [x] **Component Library Scaffolding:** Create accessible core primitives:
  - `Button` (loading state, variants: primary, destructive, outline, ghost).
  - `Badge` (severity and status indicators with icons).
  - `Card`, `Modal` (focus trapping, keyboard ESC, portal rendering).
  - `Input`, `Textarea`, `Select`, `Checkbox`.
  - `Skeleton` & `LoadingState` skeletons.
  - `Toast` notification system.
- [x] **Typed API Client (`lib/api.ts`):**
  - Fetch / Axios wrapper with standard error envelope unpacking `{ statusCode, error, message, details?, requestId }`.
  - Automated `x-request-id` forwarding and `Idempotency-Key` generation.
  - Token interceptors: bearer token attachment and refresh flow on 401.

### Day 2: Authentication, Session Lifecycle & Role-Based App Shell
- [x] **Authentication State (`context/auth-context.tsx` & `stores/auth-store.ts`):**
  - Store token / user profile with role (`ADMIN`, `SECURITY`, `RESIDENT`).
  - Auto-routing upon login to role-specific dashboard (`/admin`, `/dashboard`, or `/portal`).
  - Auto-refresh token rotation and logout handling.
- [x] **Login Screen (`/login`):**
  - Clean, mobile-friendly login interface.
  - Phone / email and password validation.
  - Rate-limit and account lockout countdown UX.
  - Role switcher helper in development mode.
- [x] **Adaptive Role-Based App Shells:**
  - **Officer App Shell (`/dashboard`):** High-contrast header, audible emergency chime toggle, quick "REPORT INCIDENT" trigger button, mobile-optimized navigation for field officers.
  - **Admin App Shell (`/admin`):** Full governance sidebar (Users, Zones, Incidents, Blast History, Audit Logs, Carrier Health).
  - **Resident Portal Shell (`/portal`):** Simplified community view (Local Safety Notices, Alert History, Language & Opt-Out Settings).
- [x] **Session Expiry Protection:**
  - Modal prompt when session expires mid-operation with form state preservation.
- [x] **PII & Time Formatting Utilities:**
  - Phone masking component (`maskPhone('+2348012345678')` → `+234801•••5678`).
  - Date formatter: `formatWAT(date)` displaying WAT with UTC tooltip.

### Day 3: Role-Specific Dashboards & Real-Time Monitoring
- [ ] **1. Security Command Center (`/dashboard`):**
  - Operational metric cards: Pending Review (with age badge and pulse animation), Active Alerts, People at Risk, Resolved Today.
  - Real-time incident feed with audio-visual chime on new `PENDING_REVIEW` entries.
  - Quick-action buttons: Review, Verify Modal trigger, Dismiss Modal trigger.
  - 10-second polling / SSE with tab visibility auto-pause.
- [ ] **2. System Administrator Dashboard (`/admin`):**
  - Global overview: Total users by role and language, community zone counters, system delivery breakdown.
  - Infrastructure banner: Provider outages, carrier balance status, unreviewed templates warning badge.
  - Direct shortcuts to User Management, Zone Management, and Audit Logs.
- [ ] **3. Resident Community Safety Portal (`/portal`):**
  - Home community status card ("Your Community is currently SECURE / ALERT ACTIVE").
  - Localized alert notice feed (showing area name, WAT time, severity — coordinates masked).
  - Safety alert notification preferences (toggle SMS on/off) and preferred language selector (Hausa, Pidgin, Yoruba, Igbo, English).
  - 10-second polling with visibility detection (`document.hidden` pause/resume).
  - Audio and visual chime cue when a new incident enters `PENDING_REVIEW` to alert officers on duty.
- [ ] **System Status Banner:** Display alerts when queue is paused, provider encounters errors, or templates need native review.

### Day 4: Incident Reporting Workflow (`/incidents/new`)
- [ ] **Report Form Creation:**
  - Type selection (`POSSIBLE_INTRUSION`, `SUSPICIOUS_PERSON`, `SUSPICIOUS_VEHICLE`, `FIRE`, `OTHER`).
  - Severity radio group with visual indicators (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Sanitized description input (10–1000 characters).
  - Optional radius override for Admins.
- [ ] **Location Picker Component:**
  - Manual latitude/longitude coordinate input with range validation.
  - "Use Zone Center" shortcut dropdown.
  - Leaflet + OpenStreetMap interactive marker picker with graceful fallback when map tiles are unreachable.
- [ ] **Safety & Sanity Warning Dialogs:**
  - Coordinates outside Nigeria bounding box soft-warning modal ("I confirm this location").
  - Swapped coordinate detection prompt.
- [ ] **Duplicate Incident Guard:**
  - Fetch open incidents within 500m / 30m window and present duplicate warning modal with explicit acknowledgement checkbox.
- [ ] **Submit Guarding:** Debounce submission, lock buttons, generate `Idempotency-Key`, and redirect to `/incidents/[id]` on success.

### Day 5: Incident Detail & Two-Officer Verification Modal (`/incidents/[id]`)
- [ ] **Incident Detail View:**
  - Complete incident summary, map location marker, reporter details, and timeline of status changes.
- [ ] **Two-Officer Verification Modal:**
  - Fetch dry-run `GET /incidents/:id/preview-recipients`.
  - **Dual-Pillar Recipient Breakdown:**
    - Physically nearby count (detected via GPS within blast radius).
    - Registered community members count (members anchored to this zone, even if currently away/working).
    - Total deduplicated recipient blast target.
  - Recipient role breakdown: Residents vs Security personnel.
  - Multilingual distribution chart (Hausa, English, Yoruba, Igbo, Pidgin).
  - Skipped recipient audit (users without coordinates or opted-out).
  - SMS segment count estimator & cost forecast.
  - Multilingual message text inspection tabs.
  - Warning badges if any template has `NEEDS_NATIVE_REVIEW` status.
  - Confirmation button: "Confirm and Send Alerts" (disabled until preview successfully loads).
- [ ] **Four-Eyes Policy Guard:**
  - Clear UX feedback when the reporter attempts to self-verify without Admin override permission.
- [ ] **Dismissal Flow:**
  - Modal with mandatory reason input (min 5, max 500 chars).
- [ ] **Race Condition Resilience:**
  - Detect `409 Conflict` (if another officer acted concurrently), auto-refresh data, and present who verified/dismissed it.

### Day 6: Real-Time Alert Delivery Tracking & Resolution
- [ ] **Live Blast Progress Bar:**
  - Multi-state segmented progress bar showing Queued, Sending, Sent, Delivered, and Failed counts in real time.
- [ ] **Alerts Table View (`GET /incidents/:id/alerts`):**
  - Paginated table displaying recipient role, masked phone, language, SMS status, attempt count, and provider timestamp.
  - Status filters (All, Sent, Delivered, Failed).
- [ ] **Manual Retry Trigger:**
  - "Retry Failed Alerts" button for Security/Admin with confirmation modal.
- [ ] **Incident Resolution Flow (`POST /incidents/:id/resolve`):**
  - Resolution modal with optional "Send All-Clear alert to residents" toggle.

### Day 7: User Management, Flexible Registration & Zone Management
- [ ] **User Directory & Flexible Registration Modal (`/users`):**
  - User list with role badge, preferred language, coordinates/address status, and active toggle.
  - Filter by community zone, language, and role.
  - **Dual-Mode Registration Form (Security & Admin):**
    - **Credential Dispatch:** Option to auto-generate password and dispatch onboarding email containing username/email, initial password, and portal website link (`${FRONTEND_URL}/login`).
    - **Notification Defaults:** Emergency alerts toggle set to **ENABLED by default** (`alertsEnabled: true`).
    - **Mode 1 (Zone & Address Based):** Select Home Community Zone, enter House / Compound Number, Street / Quarter / Landmark description (no smartphone GPS required).
    - **Mode 2 (GPS & Map Enhanced):** One-tap device GPS capture button, interactive Leaflet map pin, or zone center shortcut.
  - Soft-deactivate / reactivate toggle.
- [ ] **Bulk CSV User Import:**
  - File drag-and-drop CSV uploader supporting both GPS coordinates and Zone + House Number / Area records with default alert opt-in.
  - Row-by-row validation parser previewing valid vs invalid rows before import.
  - All-or-nothing rollback option with downloadable error log.
- [ ] **Zone Management (`/zones`):**
  - Zone list with map markers, center coordinates, radius, and active incident counters.
  - Create / edit zone modal.
- [ ] **Audit Trail Viewer (`/audit` - Admin Only):**
  - Chronological append-only timeline of security events (logins, incident reports, verifications, dismissals, retries).
  - Detailed diff inspector showing `before` and `after` JSON snapshots.

### Day 8: Accessibility, Responsive Polish & End-to-End Demo Verification
- [ ] **Accessibility (WCAG AA):**
  - Keyboard focus trapping on all modals.
  - Aria-live regions for status updates and alert dispatches.
  - Contrast check for all severity and status color badges.
- [ ] **Mobile Viewport Optimization:**
  - Responsive audit down to 360px viewport.
  - Touch-friendly tap targets (minimum 44x44px).
- [ ] **Offline & Disconnection Grace:**
  - Offline banner notification and automatic retry when network resumes.
- [ ] **End-to-End Demo Script Walkthrough:**
  - Officer login → report incident (`INC-000001`) → second officer login → verify preview check → fanout confirmation → delivery tracking.
