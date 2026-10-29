import { VenueItem, VenueType } from '../types';
import { verifiedVenuesRegistry } from '../data/verifiedVenues';

export interface VenueSearchParams {
  city?: string;
  locality?: string;
  venueType?: VenueType | 'all';
  guestCount?: number;
  maxBudget?: number;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both' | 'all';
  cateringPolicy?: 'in_house_only' | 'external_allowed' | 'both' | 'all';
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recommended' | 'capacity' | 'price_low_high' | 'name';
}

/**
 * Normalizes a text string for fuzzy address/name deduplication
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[,\.\-\/\\#]/g, ' ')
    .replace(/\b(rd|road|street|st|lane|marg|layout|cross|x roads)\b/g, '')
    .replace(/\b(function hall|banquet hall|convention center|convention centre|banquets|hall|hotel)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates distance in meters between two geographical coordinates (Haversine formula)
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate token overlap similarity score (0.0 to 1.0)
 */
export function calculateTokenSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(normalizeString(s1).split(' ').filter(t => t.length > 2));
  const tokens2 = new Set(normalizeString(s2).split(' ').filter(t => t.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) common++;
  });

  const union = new Set([...tokens1, ...tokens2]);
  return common / union.size;
}

/**
 * Deduplicates venues according to strict multi-criteria reliability:
 * 1. Stable place ID match
 * 2. High name & address similarity
 * 3. Proximity under 50m with similar name
 * Merges compatible fields without discarding attribution.
 */
export function deduplicateVenues(venues: VenueItem[]): VenueItem[] {
  const result: VenueItem[] = [];

  for (const candidate of venues) {
    let existingIndex = -1;

    for (let i = 0; i < result.length; i++) {
      const existing = result[i];

      // 1. Direct ID match
      if (existing.id === candidate.id) {
        existingIndex = i;
        break;
      }

      // 2. City must match
      if (existing.city.toLowerCase() !== candidate.city.toLowerCase()) {
        continue;
      }

      // 3. Name similarity check
      const nameSim = calculateTokenSimilarity(existing.name, candidate.name);

      // Check coordinates proximity if both have lat/lng
      if (existing.lat && existing.lng && candidate.lat && candidate.lng) {
        const distance = calculateDistanceMeters(existing.lat, existing.lng, candidate.lat, candidate.lng);
        if (distance < 60 && nameSim > 0.6) {
          existingIndex = i;
          break;
        }
      }

      // Check normalized address and high name similarity
      const addrSim = calculateTokenSimilarity(existing.fullAddress, candidate.fullAddress);
      if (nameSim >= 0.8 && (addrSim > 0.4 || existing.locality.toLowerCase() === candidate.locality.toLowerCase())) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex >= 0) {
      // Merge compatible data
      const existing = result[existingIndex];
      result[existingIndex] = {
        ...existing,
        website: existing.website || candidate.website,
        phone: existing.phone || candidate.phone,
        imageUrl: existing.imageUrl || candidate.imageUrl,
        capacityMin: existing.capacityMin || candidate.capacityMin,
        capacityMax: existing.capacityMax || candidate.capacityMax,
        rentalPrice: existing.rentalPrice ?? candidate.rentalPrice,
        pricePerPerson: existing.pricePerPerson ?? candidate.pricePerPerson,
        amenities: Array.from(new Set([...existing.amenities, ...candidate.amenities])),
        sourceName: `${existing.sourceName} & ${candidate.sourceName}`,
        lastVerifiedDate: existing.lastVerifiedDate > candidate.lastVerifiedDate ? existing.lastVerifiedDate : candidate.lastVerifiedDate,
      };
    } else {
      result.push({ ...candidate });
    }
  }

  return result;
}

/**
 * Filter, sort, and paginate venues based on verified real-world criteria
 */
export function searchAndFilterVenues(
  allVenues: VenueItem[],
  params: VenueSearchParams
): {
  venues: VenueItem[];
  total: number;
  page: number;
  totalPages: number;
  citiesAvailable: string[];
  localitiesAvailable: string[];
} {
  const {
    city = 'Hyderabad',
    locality,
    venueType = 'all',
    guestCount,
    maxBudget,
    indoorOutdoor = 'all',
    cateringPolicy = 'all',
    searchQuery = '',
    page = 1,
    limit = 9,
    sortBy = 'recommended',
  } = params;

  // Deduplicate source pool first
  const deduped = deduplicateVenues(allVenues);

  // Available metadata
  const citiesAvailable = Array.from(new Set(deduped.map(v => v.city))).sort();
  const cityFiltered = deduped.filter(v => v.city.toLowerCase() === city.toLowerCase().trim());
  const localitiesAvailable = Array.from(new Set(cityFiltered.map(v => v.locality))).filter(Boolean).sort();

  // Filter pipeline
  let filtered = cityFiltered.filter(v => {
    // Locality
    if (locality && locality !== 'all' && locality.trim() !== '') {
      if (!v.locality.toLowerCase().includes(locality.toLowerCase().trim())) {
        return false;
      }
    }

    // Venue Type
    if (venueType && venueType !== 'all') {
      if (v.category !== venueType) {
        return false;
      }
    }

    // Guest Count capacity check
    if (guestCount && guestCount > 0) {
      if (v.capacityMax && guestCount > v.capacityMax) {
        return false;
      }
      if (v.capacityMin && guestCount < v.capacityMin * 0.7) {
        // Allow slight tolerance
        return false;
      }
    }

    // Budget check
    if (maxBudget && maxBudget > 0) {
      if (v.rentalPrice && v.rentalPrice > maxBudget) {
        return false;
      }
    }

    // Indoor / Outdoor
    if (indoorOutdoor && indoorOutdoor !== 'all') {
      if (v.indoorOutdoor !== 'both' && v.indoorOutdoor !== indoorOutdoor) {
        return false;
      }
    }

    // Catering policy
    if (cateringPolicy && cateringPolicy !== 'all') {
      if (v.cateringPolicy !== 'both' && v.cateringPolicy !== cateringPolicy) {
        return false;
      }
    }

    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = v.name.toLowerCase().includes(q);
      const matchLoc = v.locality.toLowerCase().includes(q);
      const matchAddr = v.fullAddress.toLowerCase().includes(q);
      const matchAmenity = v.amenities.some(a => a.toLowerCase().includes(q));
      if (!matchName && !matchLoc && !matchAddr && !matchAmenity) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'capacity') {
      return (b.capacityMax || 0) - (a.capacityMax || 0);
    }
    if (sortBy === 'price_low_high') {
      const priceA = a.rentalPrice || (a.pricePerPerson ? a.pricePerPerson * 100 : 9999999);
      const priceB = b.rentalPrice || (b.pricePerPerson ? b.pricePerPerson * 100 : 9999999);
      return priceA - priceB;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Recommended default: verified first, then published pricing, then capacity
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    if (a.isPricePublished !== b.isPricePublished) return a.isPricePublished ? -1 : 1;
    return (b.capacityMax || 0) - (a.capacityMax || 0);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    venues: paginated,
    total,
    page: currentPage,
    totalPages,
    citiesAvailable,
    localitiesAvailable,
  };
}
