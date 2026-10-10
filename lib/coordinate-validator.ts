export interface CoordinateValidationResult {
  isValid: boolean;
  isWithinNigeria: boolean;
  isPossiblySwapped: boolean;
  isNullIsland: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

export const NIGERIA_BOUNDS = {
  minLat: 4.0,
  maxLat: 14.0,
  minLng: 2.5,
  maxLng: 15.0,
};

/**
 * Validates coordinate pair for sanity, bounds, Null Island (0,0), and out-of-Nigeria warning.
 */
export function validateCoordinatesClient(
  latitude?: number | null,
  longitude?: number | null
): CoordinateValidationResult {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return {
      isValid: false,
      isWithinNigeria: false,
      isPossiblySwapped: false,
      isNullIsland: false,
      errorMessage: "Both latitude and longitude are required numeric values.",
    };
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      isWithinNigeria: false,
      isPossiblySwapped: false,
      isNullIsland: false,
      errorMessage: `Latitude ${lat} is out of valid bounds [-90, 90].`,
    };
  }

  if (lng < -180 || lng > 180) {
    return {
      isValid: false,
      isWithinNigeria: false,
      isPossiblySwapped: false,
      isNullIsland: false,
      errorMessage: `Longitude ${lng} is out of valid bounds [-180, 180].`,
    };
  }

  // Null Island check
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) {
    return {
      isValid: false,
      isWithinNigeria: false,
      isPossiblySwapped: false,
      isNullIsland: true,
      errorMessage: "Coordinates (0,0) [Null Island] are not allowed for alert dispatch.",
    };
  }

  const isWithinNigeria =
    lat >= NIGERIA_BOUNDS.minLat &&
    lat <= NIGERIA_BOUNDS.maxLat &&
    lng >= NIGERIA_BOUNDS.minLng &&
    lng <= NIGERIA_BOUNDS.maxLng;

  // Swapped coordinates detection: e.g. lng was passed as lat, lat as lng
  const isPossiblySwapped =
    lng >= NIGERIA_BOUNDS.minLat &&
    lng <= NIGERIA_BOUNDS.maxLat &&
    lat >= NIGERIA_BOUNDS.minLng &&
    lat <= NIGERIA_BOUNDS.maxLng &&
    !isWithinNigeria;

  let warningMessage: string | undefined;
  if (!isWithinNigeria) {
    if (isPossiblySwapped) {
      warningMessage = `Coordinates (${lat}, ${lng}) appear to be inverted (Latitude and Longitude may be swapped).`;
    } else {
      warningMessage = `Coordinates (${lat}, ${lng}) lie outside the standard Nigerian geographic boundary.`;
    }
  }

  return {
    isValid: true,
    isWithinNigeria,
    isPossiblySwapped,
    isNullIsland: false,
    warningMessage,
  };
}
