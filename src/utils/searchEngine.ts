import { BusRoute, BusStop, DirectJourneyOption, Place, StopPoint, TransferJourneyOption } from '../types';

// Haversine formula for distance between two points in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Normalize text for English, Bangla, and Banglish comparisons
export function normalizeQuery(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[,\-_.\/]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Find closest matching bus stop from a string query
export function matchStopByQuery(query: string, allStops: BusStop[]): BusStop | null {
  const clean = normalizeQuery(query);
  if (!clean) return null;

  // Direct exact match on ID
  const directId = allStops.find(s => s.stop_id.toLowerCase() === clean);
  if (directId) return directId;

  // Priority 1: Check aliases and Bengali names
  for (const stop of allStops) {
    if (normalizeQuery(stop.stop_name) === clean || normalizeQuery(stop.stop_name_bn) === clean) {
      return stop;
    }
    for (const alias of stop.aliases) {
      if (normalizeQuery(alias) === clean) {
        return stop;
      }
    }
  }

  // Priority 2: Substring matching in aliases
  for (const stop of allStops) {
    if (
      normalizeQuery(stop.stop_name).includes(clean) ||
      normalizeQuery(stop.stop_name_bn).includes(clean)
    ) {
      return stop;
    }
    for (const alias of stop.aliases) {
      const normAlias = normalizeQuery(alias);
      if (normAlias.includes(clean) || clean.includes(normAlias)) {
        return stop;
      }
    }
  }

  return null;
}

// Find nearest bus stop to arbitrary coordinates
export function findNearestStop(
  lat: number,
  lng: number,
  allStops: BusStop[],
  maxRadiusKm = 5
): { stop: BusStop; distanceKm: number } | null {
  let nearest: BusStop | null = null;
  let minDistance = Infinity;

  for (const stop of allStops) {
    const dist = calculateDistanceKm(lat, lng, stop.latitude, stop.longitude);
    if (dist < minDistance && dist <= maxRadiusKm) {
      minDistance = dist;
      nearest = stop;
    }
  }

  if (nearest) {
    return { stop: nearest, distanceKm: minDistance };
  }
  return null;
}

// Find all stops within radius of coordinates
export function findStopsNearLocation(
  lat: number,
  lng: number,
  allStops: BusStop[],
  radiusKm = 2
): { stop: BusStop; distanceKm: number }[] {
  const results: { stop: BusStop; distanceKm: number }[] = [];

  for (const stop of allStops) {
    const dist = calculateDistanceKm(lat, lng, stop.latitude, stop.longitude);
    if (dist <= radiusKm) {
      results.push({ stop, distanceKm: dist });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

// Find places near a location filtered by radius and category
export function findPlacesNearLocation(
  lat: number,
  lng: number,
  allPlaces: Place[],
  radiusKm = 5,
  categoryFilter?: string
): { place: Place; distanceKm: number }[] {
  const list: { place: Place; distanceKm: number }[] = [];

  for (const place of allPlaces) {
    if (categoryFilter && categoryFilter !== 'all' && place.category !== categoryFilter) {
      continue;
    }
    const dist = calculateDistanceKm(lat, lng, place.latitude, place.longitude);
    if (dist <= radiusKm) {
      list.push({ place, distanceKm: dist });
    }
  }

  return list.sort((a, b) => a.distanceKm - b.distanceKm);
}

// The core algorithm: "Which Bus Goes From Here to There?"
export function searchBusRoutes(
  fromQuery: string,
  toQuery: string,
  allRoutes: BusRoute[],
  allStops: BusStop[],
  userCoords?: { lat: number; lng: number }
): {
  fromStop: BusStop | null;
  toStop: BusStop | null;
  directOptions: DirectJourneyOption[];
  transferOptions: TransferJourneyOption[];
} {
  const matchedFrom = matchStopByQuery(fromQuery, allStops);
  const matchedTo = matchStopByQuery(toQuery, allStops);

  if (!matchedFrom || !matchedTo) {
    return {
      fromStop: matchedFrom,
      toStop: matchedTo,
      directOptions: [],
      transferOptions: []
    };
  }

  const directOptions: DirectJourneyOption[] = [];
  const transferOptions: TransferJourneyOption[] = [];

  // Helper to match StopPoint inside route by stop_id or close name/coords
  const findStopInRoute = (route: BusRoute, stop: BusStop): StopPoint | undefined => {
    return route.all_stops.find(s => 
      s.stop_id === stop.stop_id ||
      s.name.toLowerCase().includes(stop.stop_name.toLowerCase()) ||
      calculateDistanceKm(s.lat, s.lng, stop.latitude, stop.longitude) < 0.6
    );
  };

  // 1. DIRECT ROUTES SEARCH
  for (const route of allRoutes) {
    const sFrom = findStopInRoute(route, matchedFrom);
    const sTo = findStopInRoute(route, matchedTo);

    if (sFrom && sTo && sFrom.stop_id !== sTo.stop_id) {
      // Check order
      const fromIndex = route.all_stops.findIndex(s => s.stop_id === sFrom.stop_id);
      const toIndex = route.all_stops.findIndex(s => s.stop_id === sTo.stop_id);

      // If both ways or from comes before to
      if (fromIndex !== -1 && toIndex !== -1) {
        const startIndex = Math.min(fromIndex, toIndex);
        const endIndex = Math.max(fromIndex, toIndex);
        const intermediate = route.all_stops.slice(startIndex, endIndex + 1);

        let walkMeters = undefined;
        if (userCoords) {
          const dKm = calculateDistanceKm(userCoords.lat, userCoords.lng, matchedFrom.latitude, matchedFrom.longitude);
          walkMeters = Math.round(dKm * 1000);
        }

        directOptions.push({
          type: 'direct',
          bus: route,
          fromStop: sFrom,
          toStop: sTo,
          stopsCount: intermediate.length,
          intermediateStops: intermediate,
          walkToStartMeters: walkMeters
        });
      }
    }
  }

  // 2. TRANSFER ROUTES SEARCH (1 transfer)
  // Only search transfers if direct is <= 2 or to give rich comprehensive options
  const directBusIds = new Set(directOptions.map(d => d.bus.bus_id));

  for (const firstBus of allRoutes) {
    const firstFrom = findStopInRoute(firstBus, matchedFrom);
    if (!firstFrom) continue;

    for (const potentialTransferStop of firstBus.all_stops) {
      if (potentialTransferStop.stop_id === firstFrom.stop_id) continue;

      // Find second bus that connects potentialTransferStop to matchedTo
      for (const secondBus of allRoutes) {
        if (secondBus.bus_id === firstBus.bus_id) continue;
        if (directBusIds.has(secondBus.bus_id) && directBusIds.has(firstBus.bus_id)) continue;

        const secondTransfer = secondBus.all_stops.find(s => 
          s.stop_id === potentialTransferStop.stop_id ||
          calculateDistanceKm(s.lat, s.lng, potentialTransferStop.lat, potentialTransferStop.lng) < 0.5
        );
        const secondTo = findStopInRoute(secondBus, matchedTo);

        if (secondTransfer && secondTo && secondTransfer.stop_id !== secondTo.stop_id) {
          // Avoid duplicate transfer recommendations
          const duplicate = transferOptions.some(t => 
            t.firstBus.bus_id === firstBus.bus_id &&
            t.secondBus.bus_id === secondBus.bus_id &&
            t.transferPointName === potentialTransferStop.name
          );

          if (!duplicate) {
            transferOptions.push({
              type: 'transfer',
              firstBus,
              firstFromStop: firstFrom,
              firstTransferStop: potentialTransferStop,
              firstIntermediateStops: [firstFrom, potentialTransferStop],
              secondBus,
              secondTransferStop: secondTransfer,
              secondToStop: secondTo,
              secondIntermediateStops: [secondTransfer, secondTo],
              transferPointName: potentialTransferStop.name,
              transferLat: potentialTransferStop.lat,
              transferLng: potentialTransferStop.lng
            });
          }
        }
      }
    }
  }

  return {
    fromStop: matchedFrom,
    toStop: matchedTo,
    directOptions,
    transferOptions: transferOptions.slice(0, 5) // top 5 transfers
  };
}

// Smart global search query parser
export interface ParsedSearchIntent {
  type: 'bus_number' | 'from_to' | 'near_place' | 'general';
  busNumber?: string;
  from?: string;
  to?: string;
  placeName?: string;
  category?: string;
}

export function parseSearchIntent(input: string): ParsedSearchIntent {
  const text = normalizeQuery(input);
  if (!text) return { type: 'general' };

  // 1. Bus Number Search ("10", "route 10", "১০", "bus 6")
  const busNumberMatch = text.match(/^(?:route|bus|নং|নম্বর)?\s*([0-9]+|[০-৯]+|[a-z]+-[0-9]+)\b/i);
  if (busNumberMatch && (text.length <= 12 || text.startsWith('route ') || text.startsWith('bus '))) {
    return {
      type: 'bus_number',
      busNumber: busNumberMatch[1]
    };
  }

  // 2. From ... To pattern ("gec to cuet", "gec theke cuet", "gec theke agrabad")
  const toSplit = text.split(/\s+(?:to|theke|theika|hote|thekhe|->|→)\s+/i);
  if (toSplit.length === 2 && toSplit[0].trim() && toSplit[1].trim()) {
    return {
      type: 'from_to',
      from: toSplit[0].trim(),
      to: toSplit[1].trim()
    };
  }

  // 3. Near pattern ("hospital near gec", "জিইসির কাছে হাসপাতাল", "hotel near chittagong")
  if (text.includes('near') || text.includes('kache') || text.includes('কাছে')) {
    let category = 'all';
    if (text.includes('hospital') || text.includes('হাসপাতাল') || text.includes('ডাক্তার')) category = 'hospital';
    else if (text.includes('police') || text.includes('থানা') || text.includes('পুলিশ')) category = 'police';
    else if (text.includes('fire') || text.includes('ফায়ার')) category = 'fire';
    else if (text.includes('restaurant') || text.includes('খাবার') || text.includes('হোটেল') || text.includes('food')) category = 'restaurant';
    else if (text.includes('tourist') || text.includes('ঘোরার')) category = 'tourist';

    const placePart = text
      .replace(/(hospital|police|fire|restaurant|tourist|hotel|near|kache|er|কাছে|হাসপাতাল|থানা|খাবার)/gi, '')
      .trim();

    return {
      type: 'near_place',
      placeName: placePart,
      category
    };
  }

  return { type: 'general' };
}
