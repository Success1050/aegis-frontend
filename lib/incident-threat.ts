import { IncidentType, IncidentSeverity } from "@/types";

export interface ThreatPresentation {
  headline: string;
  categoryTag: string;
  directive: string;
  tone: "critical" | "high" | "medium" | "low";
  iconName: "bandit" | "terrorist" | "kidnap" | "intrusion" | "fire" | "flood" | "storm" | "security";
}

/**
 * Maps an incident type and severity to direct, high-urgency community safety wording.
 * Designed for immediate clarity during life-or-death situations and emergency weather events.
 */
export function getThreatPresentation(
  type?: string | null,
  severity?: IncidentSeverity | null
): ThreatPresentation {
  const normalizedType = (type || "").toUpperCase();

  switch (normalizedType) {
    case "BANDIT_ATTACK":
      return {
        headline: "ARMED BANDIT ATTACK IN PROGRESS",
        categoryTag: "BANDIT RAID",
        directive:
          "STAY INDOORS IMMEDIATELY. Barricade entry points, extinguish exterior lights, keep absolute silence, and do not venture towards perimeter roads.",
        tone: "critical",
        iconName: "bandit",
      };

    case "TERRORIST_INCURSION":
      return {
        headline: "CONFIRMED TERRORIST INFILTRATION",
        categoryTag: "TERRORIST INCURSION",
        directive:
          "CRITICAL DANGER: Hostile armed group active in the sector. Take immediate reinforced shelter. Keep mobile phones on silent. Await clearance from security forces.",
        tone: "critical",
        iconName: "terrorist",
      };

    case "KIDNAPPING_THREAT":
      return {
        headline: "ACTIVE KIDNAPPING & ABDUCTION THREAT",
        categoryTag: "KIDNAPPING ALERT",
        directive:
          "IMMEDIATE ADVISORY: Suspected armed abductors reported in the vicinity. Gather family members indoors, avoid all travel along access routes, and secure perimeter gates.",
        tone: "critical",
        iconName: "kidnap",
      };

    case "POSSIBLE_INTRUSION":
      return {
        headline: "ARMED PERIMETER INTRUSION DETECTED",
        categoryTag: "SECURITY BREACH",
        directive:
          "Community perimeter compromised. Security patrol units are actively engaging. Secure your compound and report suspicious movement immediately.",
        tone: severity === "CRITICAL" ? "critical" : "high",
        iconName: "intrusion",
      };

    case "SUSPICIOUS_VEHICLE":
      return {
        headline: "SUSPICIOUS / UNIDENTIFIED ARMED VEHICLE",
        categoryTag: "HOSTILE CONVOY",
        directive:
          "Unmarked or suspicious vehicle spotted surveilling access corridors. Avoid confrontation and keep clear of main road junctions.",
        tone: "high",
        iconName: "security",
      };

    case "SUSPICIOUS_PERSON":
      return {
        headline: "HOSTILE SURVEILLANCE / SUSPICIOUS ARMED INDIVIDUAL",
        categoryTag: "HOSTILE SIGHTING",
        directive:
          "Unidentified suspicious individuals sighted near neighborhood boundary. Stay alert, lock compounds, and monitor community watch channels.",
        tone: "medium",
        iconName: "security",
      };

    case "FIRE":
    case "FIRE_OUTBREAK":
      return {
        headline: "URGENT FIRE OUTBREAK & EVACUATION WARNING",
        categoryTag: "FIRE HAZARD",
        directive:
          "Active fire spreading in the area. Evacuate immediately away from smoke path towards the nearest designated muster point. Leave access roads clear for fire teams.",
        tone: "high",
        iconName: "fire",
      };

    case "FLOOD_WARNING":
      return {
        headline: "FLASH FLOOD & DAM DISCHARGE EMERGENCY",
        categoryTag: "FLOOD HAZARD",
        directive:
          "RAPID FLOODING IMMINENT: Move immediately to designated high-ground zones. Turn off main electricity breakers if safe. Do not walk or drive through flowing water.",
        tone: "critical",
        iconName: "flood",
      };

    case "SEVERE_WEATHER":
      return {
        headline: "EXTREME STORM & HIGH WIND HAZARD WARNING",
        categoryTag: "WEATHER HAZARD",
        directive:
          "Destructive wind and lightning expected. Seek shelter in an interior room away from glass windows, unanchored roofs, and overhead powerlines.",
        tone: "medium",
        iconName: "storm",
      };

    case "OTHER":
    default:
      if (severity === "CRITICAL") {
        return {
          headline: "CRITICAL COMMUNITY SECURITY EMERGENCY",
          categoryTag: "SECURITY EMERGENCY",
          directive:
            "A high-priority security threat has been verified by dispatch officers. Seek safe shelter and await further broadcast instructions.",
          tone: "critical",
          iconName: "security",
        };
      }
      return {
        headline: "VERIFIED COMMUNITY SAFETY NOTICE",
        categoryTag: "SAFETY ADVISORY",
        directive:
          "Security personnel have verified an ongoing incident. Exercise heightened situational awareness in your neighborhood.",
        tone: "high",
        iconName: "security",
      };
  }
}
