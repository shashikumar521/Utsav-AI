import React, { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../../context/EventContext';
import { VenueItem, VenueType } from '../../types';
import { searchAndFilterVenues } from '../../utils/venueDiscovery';
import { verifiedVenuesRegistry } from '../../data/verifiedVenues';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface VenueDiscoveryViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToBudget?: () => void;
}

const CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Ahmedabad',
  'Jaipur',
  'Chennai',
  'Pune',
];

const LOCALITIES_MAP: Record<string, string[]> = {
  Hyderabad: ['Gachibowli', 'Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Hitec City', 'Secunderabad', 'Raidurg', 'Shamshabad'],
  Bengaluru: ['Sadashivnagar', 'Indiranagar', 'Koramangala', 'Whitefield', 'Old Airport Road', 'Jayanagar'],
  Mumbai: ['Bandra West', 'Juhu', 'Vile Parle East', 'Worli', 'Andheri West'],
  Delhi: ['Vasant Kunj', 'South Extension', 'Chanakyapuri', 'Connaught Place'],
  Ahmedabad: ['Bodakdev', 'SG Highway', 'Sindhu Bhavan', 'Satellite'],
};

export const VenueDiscoveryView: React.FC<VenueDiscoveryViewProps> = ({
  onShowToast,
  onNavigateToBudget,
}) => {
  const {
    activeEvent,
    connectVenueToEvent,
    savedVenues,
    saveVenue,
    removeSavedVenue,
    formatCurrency,
  } = useEvents();

  // Search & Filter State
  const defaultCity = activeEvent?.city?.includes('Hyderabad')
    ? 'Hyderabad'
    : activeEvent?.city?.includes('Bengaluru')
    ? 'Bengaluru'
    : activeEvent?.city?.includes('Mumbai')
    ? 'Mumbai'
    : activeEvent?.city?.includes('Delhi')
    ? 'Delhi'
    : activeEvent?.city?.includes('Ahmedabad')
    ? 'Ahmedabad'
    : 'Hyderabad';

  const [city, setCity] = useState<string>(defaultCity);
  const [locality, setLocality] = useState<string>('all');
  const [venueType, setVenueType] = useState<VenueType | 'all'>('all');
  const [guestCount, setGuestCount] = useState<number>(activeEvent?.guestCount || 100);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both' | 'all'>('all');
  const [cateringPolicy, setCateringPolicy] = useState<'in_house_only' | 'external_allowed' | 'both' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'capacity' | 'price_low_high' | 'name'>('recommended');
  const [page, setPage] = useState(1);

  // Live query state
  const [liveVenues, setLiveVenues] = useState<VenueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedVenueForDetails, setSelectedVenueForDetails] = useState<VenueItem | null>(null);
  const [venueToConnect, setVenueToConnect] = useState<VenueItem | null>(null);
  const [quoteVenue, setQuoteVenue] = useState<VenueItem | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [compareList, setCompareList] = useState<VenueItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Fetch live venues from backend pipeline (Overpass OSM + Verified Registry)
  useEffect(() => {
    let isCancelled = false;

    async function fetchVenues() {
      setIsLoading(true);
      setApiError(null);
      try {
        const queryParams = new URLSearchParams({
          city,
          locality: locality !== 'all' ? locality : '',
          venueType,
          guestCount: guestCount > 0 ? guestCount.toString() : '',
          maxBudget: maxBudget > 0 ? maxBudget.toString() : '',
          indoorOutdoor,
          cateringPolicy,
          searchQuery,
          page: page.toString(),
          limit: '12',
          sortBy,
        });

        const res = await fetch(`/api/venues/search?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!isCancelled && data.venues) {
          setLiveVenues(data.venues);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Backend search API error, relying on local verified catalog:', err?.message);
          // Fallback to client-side search engine over verified registry
          const localResult = searchAndFilterVenues(verifiedVenuesRegistry, {
            city,
            locality: locality !== 'all' ? locality : '',
            venueType,
            guestCount,
            maxBudget,
            indoorOutdoor,
            cateringPolicy,
            searchQuery,
            page,
            limit: 12,
            sortBy,
          });
          setLiveVenues(localResult.venues);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchVenues();

    return () => {
      isCancelled = true;
    };
  }, [city, locality, venueType, guestCount, maxBudget, indoorOutdoor, cateringPolicy, searchQuery, page, sortBy]);

  // Handle city change: reset locality
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setLocality('all');
    setPage(1);
  };

  // Connect Venue to Budget action
  const handleConfirmConnectVenue = () => {
    if (!venueToConnect) return;
    connectVenueToEvent(venueToConnect);
    setVenueToConnect(null);
  };

  // Compare helpers
  const toggleCompare = (venue: VenueItem) => {
    if (compareList.some(v => v.id === venue.id)) {
      setCompareList(prev => prev.filter(v => v.id !== venue.id));
      onShowToast(`Removed ${venue.name} from comparison`, 'info');
    } else {
      if (compareList.length >= 3) {
        onShowToast('You can compare a maximum of 3 venues at a time', 'error');
        return;
      }
      setCompareList(prev => [...prev, venue]);
      onShowToast(`Added ${venue.name} to comparison (${compareList.length + 1}/3)`, 'success');
    }
  };

  const isVenueSaved = (venueId: string) => savedVenues.some(v => v.id === venueId);

  const toggleSave = (venue: VenueItem) => {
    if (isVenueSaved(venue.id)) {
      removeSavedVenue(venue.id);
    } else {
      saveVenue(venue);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* =========================================================================
           TOP DISCOVERY HEADER
      ========================================================================= */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] bg-[#F4EFE6] px-2 py-0.5 rounded">
                Live Venue Discovery
              </span>
              <span className="text-xs text-[#4C454A]">·</span>
              <span className="text-xs font-semibold text-[#392538]">{city} Venues</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538] mt-1">
              Real Event Venues in {city}
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Discover verified function halls, banquet halls, and convention centers with published tariffs and honest data.
            </p>
          </div>

          {/* Compare & Budget Shortcuts */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] text-[#392538] hover:bg-[#F4EFE6] border border-[#C5A46D] text-xs font-semibold transition shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-[#755a2a]">compare_arrows</span>
                <span>Compare ({compareList.length})</span>
              </button>
            )}

            {onNavigateToBudget && (
              <button
                onClick={onNavigateToBudget}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs"
              >
                <span className="material-symbols-outlined text-sm text-[#C5A46D]">payments</span>
                <span>View Event Budget</span>
              </button>
            )}
          </div>
        </div>

        {/* City Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E8E1D5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] mr-1">
            Selected City:
          </span>
          {CITIES.map(c => (
            <button
              key={c}
              onClick={() => handleCityChange(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                city.toLowerCase() === c.toLowerCase()
                  ? 'bg-[#392538] text-white shadow-2xs'
                  : 'bg-[#FAF7F0] text-[#4C454A] hover:bg-[#F4EFE6]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
           SEARCH & FILTERS PANEL
      ========================================================================= */}
      <div className="p-4 bg-white rounded-xl border border-[#E8E1D5] shadow-xs flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Locality Selector */}
          <div>
            <label className="block font-semibold text-[#4C454A] mb-1">Locality / Area</label>
            <select
              value={locality}
              onChange={e => {
                setLocality(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
            >
              <option value="all">All {city} Localities</option>
              {(LOCALITIES_MAP[city] || []).map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Type */}
          <div>
            <label className="block font-semibold text-[#4C454A] mb-1">Venue Type</label>
            <select
              value={venueType}
              onChange={e => {
                setVenueType(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
            >
              <option value="all">All Venue Types</option>
              <option value="function_hall">Function Hall</option>
              <option value="banquet_hall">Banquet Hall</option>
              <option value="convention_center">Convention Center</option>
              <option value="hotel">5-Star Hotel</option>
              <option value="outdoor">Open Lawn / Resort</option>
              <option value="restaurant">Restaurant / Private Dining</option>
            </select>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block font-semibold text-[#4C454A] mb-1">
              Guest Capacity: <span className="font-bold text-[#392538]">{guestCount} Guests</span>
            </label>
            <input
              type="range"
              min="30"
              max="2000"
              step="25"
              value={guestCount}
              onChange={e => setGuestCount(parseInt(e.target.value, 10))}
              className="w-full accent-[#392538] cursor-pointer"
            />
          </div>

          {/* Text Search */}
          <div>
            <label className="block font-semibold text-[#4C454A] mb-1">Search by Name / Keyword</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#755a2a]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. Madhapur, AC, Garden, Lawn..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] text-xs focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E1D5]/70 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Space &amp; Food:
            </span>

            {/* Indoor/Outdoor */}
            <select
              value={indoorOutdoor}
              onChange={e => setIndoorOutdoor(e.target.value as any)}
              className="px-2.5 py-1 rounded bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] text-[#392538]"
            >
              <option value="all">Indoor &amp; Outdoor</option>
              <option value="indoor">Indoor AC Hall Only</option>
              <option value="outdoor">Outdoor Lawn Only</option>
              <option value="both">Both Lawn + Hall</option>
            </select>

            {/* Catering Policy */}
            <select
              value={cateringPolicy}
              onChange={e => setCateringPolicy(e.target.value as any)}
              className="px-2.5 py-1 rounded bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] text-[#392538]"
            >
              <option value="all">Any Catering Policy</option>
              <option value="external_allowed">External Caterers Allowed</option>
              <option value="in_house_only">In-House Catering Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 rounded bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] text-[#392538]"
            >
              <option value="recommended">Recommended &amp; Verified</option>
              <option value="capacity">Largest Capacity</option>
              <option value="price_low_high">Lowest Published Tariff</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
           DATA SOURCE TRANSPARENCY NOTICE
      ========================================================================= */}
      <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5] flex items-center justify-between text-xs text-[#4C454A]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#755a2a]">verified</span>
          <span>
            Showing <strong>{liveVenues.length}</strong> unique venues in <strong>{city}</strong> verified against published rate cards and OpenStreetMap geographic data.
          </span>
        </div>
        <span className="text-[10px] text-[#755a2a] hidden sm:inline">
          Deduplicated &amp; Cleaned
        </span>
      </div>

      {/* =========================================================================
           VENUE CARDS GRID
      ========================================================================= */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E1D5] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#392538] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#4C454A]">Searching verified venues in {city}...</p>
        </div>
      ) : liveVenues.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#E8E1D5] flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-3xl text-[#755a2a]">location_off</span>
          <h3 className="font-serif text-base font-bold text-[#392538]">
            No venues match your current filters in {city}
          </h3>
          <p className="text-xs text-[#4C454A] max-w-md">
            Try choosing "All Localities", increasing the guest capacity tolerance, or searching for other venue types.
          </p>
          <button
            onClick={() => {
              setLocality('all');
              setVenueType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#392538] text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveVenues.map(venue => {
            const isSaved = isVenueSaved(venue.id);
            const isCompared = compareList.some(v => v.id === venue.id);

            return (
              <div
                key={venue.id}
                className="bg-white rounded-2xl border border-[#E8E1D5] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Venue Image & Category Pill */}
                  <div className="relative h-44 w-full bg-[#FAF7F0] overflow-hidden">
                    <img
                      src={venue.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white bg-[#392538]/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        {venue.categoryLabel || venue.category.replace('_', ' ')}
                      </span>
                      {venue.isVerified && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">check_circle</span>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Bookmark action */}
                    <button
                      onClick={() => toggleSave(venue)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition ${
                        isSaved ? 'bg-[#C5A46D] text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isSaved ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>

                    {/* Location Badge */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold truncate">
                        {venue.locality}, {venue.city}
                      </span>
                      <span className="text-[11px] bg-black/40 px-2 py-0.5 rounded">
                        {venue.capacityMax ? `Up to ${venue.capacityMax} Guests` : 'Capacity on request'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col gap-2.5">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#392538] leading-snug">
                        {venue.name}
                      </h3>
                      <p className="text-[11px] text-[#4C454A] mt-0.5 line-clamp-1" title={venue.fullAddress}>
                        {venue.fullAddress}
                      </p>
                    </div>

                    {/* Pricing Display */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#755a2a] block">
                          Published Pricing
                        </span>
                        {venue.isPricePublished && venue.rentalPrice ? (
                          <div className="text-sm font-bold text-[#392538]">
                            ₹{venue.rentalPrice.toLocaleString('en-IN')}{' '}
                            <span className="text-[11px] font-normal text-[#4C454A]">
                              / {venue.pricingUnit === 'per_day' ? 'day' : 'event'}
                            </span>
                          </div>
                        ) : venue.isPricePublished && venue.pricePerPerson ? (
                          <div className="text-sm font-bold text-[#392538]">
                            ₹{venue.pricePerPerson.toLocaleString('en-IN')}{' '}
                            <span className="text-[11px] font-normal text-[#4C454A]">/ plate</span>
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-[#755a2a]">
                            Price not listed
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            venue.priceVerification === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {venue.priceVerification === 'published' ? 'Official Tariff' : 'Estimated Tariff'}
                        </span>
                      </div>
                    </div>

                    {/* Amenities Snippet */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {venue.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="text-[10px] text-[#755a2a] px-1 py-0.5">
                          +{venue.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Source Attribution */}
                    <div className="text-[10px] text-[#755a2a] flex items-center justify-between pt-1 border-t border-[#E8E1D5]/60">
                      <span className="truncate">Source: {venue.sourceName}</span>
                      <span>{venue.lastVerifiedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 bg-[#FAF7F0]/60 border-t border-[#E8E1D5] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedVenueForDetails(venue)}
                    className="text-xs font-semibold text-[#392538] hover:underline"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleCompare(venue)}
                      className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
                        isCompared
                          ? 'bg-[#392538] text-white border-[#392538]'
                          : 'bg-white text-[#4C454A] border-[#E8E1D5] hover:bg-[#FAF7F0]'
                      }`}
                      title={isCompared ? 'Remove from compare' : 'Compare with another venue'}
                    >
                      <span className="material-symbols-outlined text-sm">compare_arrows</span>
                    </button>

                    <button
                      onClick={() => setVenueToConnect(venue)}
                      className="px-3 py-1.5 rounded-xl bg-[#392538] hover:bg-[#231123] text-white text-xs font-semibold transition shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs text-[#C5A46D]">add_circle</span>
                      <span>Add to Budget</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
           CONNECT VENUE TO BUDGET CONFIRMATION MODAL
      ========================================================================= */}
      {venueToConnect && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                Connect Venue to Budget
              </h3>
              <button
                onClick={() => setVenueToConnect(null)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4C454A]">
              <p>
                You are connecting <strong>{venueToConnect.name}</strong> to your active celebration:
              </p>

              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#392538]">Venue Location:</span>
                  <span>{venueToConnect.locality}, {venueToConnect.city}</span>
                </div>
                {venueToConnect.rentalPrice && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#392538]">Rental Tariff:</span>
                    <span className="font-bold text-[#392538]">
                      ₹{venueToConnect.rentalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {venueToConnect.pricePerPerson && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#392538]">Catering Estimate:</span>
                    <span className="font-bold text-[#392538]">
                      ₹{(venueToConnect.pricePerPerson * (activeEvent?.guestCount || 100)).toLocaleString('en-IN')}{' '}
                      ({activeEvent?.guestCount || 100} guests @ ₹{venueToConnect.pricePerPerson}/plate)
                    </span>
                  </div>
                )}
                <div className="text-[10px] text-[#755a2a] pt-1 border-t border-[#E8E1D5]/60">
                  Source: {venueToConnect.sourceName} ({venueToConnect.lastVerifiedDate})
                </div>
              </div>

              <p className="text-[11px] text-[#755a2a]">
                This will automatically add verified line items to your budget and update your active event's location without creating duplicates.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-[#E8E1D5]">
              <button
                onClick={() => setVenueToConnect(null)}
                className="px-4 py-2 rounded-xl bg-[#F4EFE6] text-[#392538] font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConnectVenue}
                className="px-4 py-2 rounded-xl bg-[#392538] text-white font-semibold text-xs hover:bg-[#231123]"
              >
                Confirm &amp; Update Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           VENUE DETAILS MODAL
      ========================================================================= */}
      {selectedVenueForDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
                  {selectedVenueForDetails.categoryLabel}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#392538]">
                  {selectedVenueForDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVenueForDetails(null)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#4C454A]">
              <div className="h-48 w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedVenueForDetails.imageUrl}
                  alt={selectedVenueForDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5]">
                <div>
                  <span className="text-[10px] font-bold text-[#755a2a] uppercase">Address</span>
                  <p className="font-semibold text-[#392538] mt-0.5">{selectedVenueForDetails.fullAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#755a2a] uppercase">Capacity</span>
                  <p className="font-semibold text-[#392538] mt-0.5">
                    {selectedVenueForDetails.capacityMin} – {selectedVenueForDetails.capacityMax} Guests
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#755a2a] uppercase">Tariff Status</span>
                  <p className="font-semibold text-[#392538] mt-0.5 capitalize">
                    {selectedVenueForDetails.priceVerification} ({selectedVenueForDetails.sourceName})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#755a2a] uppercase">Catering Policy</span>
                  <p className="font-semibold text-[#392538] mt-0.5 capitalize">
                    {selectedVenueForDetails.cateringPolicy.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {selectedVenueForDetails.description && (
                <div>
                  <h4 className="font-semibold text-[#392538] mb-1">About the Venue</h4>
                  <p className="leading-relaxed">{selectedVenueForDetails.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-[#392538] mb-1.5">Amenities &amp; Features</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVenueForDetails.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-[#E8E1D5] rounded-lg text-[11px]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Links & Phone */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E8E1D5]">
                {selectedVenueForDetails.phone && (
                  <a
                    href={`tel:${selectedVenueForDetails.phone}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#392538] hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>{selectedVenueForDetails.phone}</span>
                  </a>
                )}
                {selectedVenueForDetails.website && (
                  <a
                    href={selectedVenueForDetails.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#755a2a] hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>Official Website</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-[#E8E1D5]">
              <button
                onClick={() => setSelectedVenueForDetails(null)}
                className="px-4 py-2 rounded-xl bg-[#F4EFE6] text-[#392538] font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedVenueForDetails(null);
                  setVenueToConnect(selectedVenueForDetails);
                }}
                className="px-4 py-2 rounded-xl bg-[#392538] text-white font-semibold text-xs hover:bg-[#231123]"
              >
                Connect to Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           COMPARE VENUES MODAL
      ========================================================================= */}
      {isCompareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#392538]">
                  Compare Venues Side-by-Side
                </h3>
                <p className="text-xs text-[#4C454A]">
                  Evaluating {compareList.length} shortlisted event spaces in {city}
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs divide-y sm:divide-y-0 sm:divide-x divide-[#E8E1D5]">
              {compareList.map(venue => (
                <div key={venue.id} className="pt-3 sm:pt-0 sm:px-3 first:pl-0 last:pr-0 flex flex-col gap-3">
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-100">
                    <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#392538]">{venue.name}</h4>
                  <p className="text-[11px] text-[#4C454A]">{venue.locality}, {venue.city}</p>

                  <div className="space-y-2 p-3 bg-[#FAF7F0] rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-[#755a2a] uppercase">Capacity</span>
                      <p className="font-semibold text-[#392538]">
                        {venue.capacityMin} – {venue.capacityMax} Guests
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#755a2a] uppercase">Published Tariff</span>
                      <p className="font-semibold text-[#392538]">
                        {venue.rentalPrice ? `₹${venue.rentalPrice.toLocaleString('en-IN')} / day` : 'Price on quote'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#755a2a] uppercase">Catering Policy</span>
                      <p className="font-semibold text-[#392538] capitalize">
                        {venue.cateringPolicy.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCompareModalOpen(false);
                      setVenueToConnect(venue);
                    }}
                    className="w-full py-2 bg-[#392538] text-white rounded-xl font-semibold hover:bg-[#231123]"
                  >
                    Select for Budget
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
