import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Hospital, 
  Utensils, 
  Hotel, 
  Compass, 
  ShoppingBag, 
  Landmark, 
  Phone, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Filter
} from 'lucide-react';
import { Place } from '../types';
import { findPlacesNearLocation, formatDistance } from '../utils/searchEngine';

interface NearbyPlacesDashboardProps {
  referenceName: string;
  referenceLat: number;
  referenceLng: number;
  allPlaces: Place[];
  defaultCategory?: string;
  lang: 'en' | 'bn';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'emergency', label: '🚨 Emergency', icon: ShieldAlert, color: 'text-red-600' },
  { id: 'hospital', label: '🏥 Health & Hospital', icon: Hospital, color: 'text-rose-600' },
  { id: 'police', label: '🚓 Police', icon: ShieldCheck, color: 'text-blue-700' },
  { id: 'fire', label: '🚒 Fire Station', icon: Flame, color: 'text-orange-600' },
  { id: 'restaurant', label: '🍽 Restaurants', icon: Utensils, color: 'text-amber-600' },
  { id: 'hotel', label: '🏨 Hotels & Stay', icon: Hotel, color: 'text-purple-600' },
  { id: 'tourist', label: '🏞 Tourist Spots', icon: Compass, color: 'text-emerald-700' },
  { id: 'market', label: '🛍 Shopping & Markets', icon: ShoppingBag, color: 'text-teal-700' },
  { id: 'bank', label: '🏦 Banks & ATMs', icon: Landmark, color: 'text-cyan-700' },
];

export const NearbyPlacesDashboard: React.FC<NearbyPlacesDashboardProps> = ({
  referenceName,
  referenceLat,
  referenceLng,
  allPlaces,
  defaultCategory = 'all',
  lang,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(defaultCategory);
  const [radiusKm, setRadiusKm] = useState<number>(5); // default 5km radius
  const [govFilter, setGovFilter] = useState<'all' | 'govt' | 'private'>('all');

  // Compute nearby places sorted by nearest distance
  const nearbyItems = useMemo(() => {
    let catFilter = selectedTab === 'all' ? undefined : selectedTab;
    // Group emergency categories
    if (selectedTab === 'emergency') {
      // Return hospital, police, and fire
      const items = findPlacesNearLocation(referenceLat, referenceLng, allPlaces, radiusKm);
      return items.filter(
        i => i.place.category === 'hospital' || i.place.category === 'police' || i.place.category === 'fire'
      );
    }

    let items = findPlacesNearLocation(referenceLat, referenceLng, allPlaces, radiusKm, catFilter);

    if (selectedTab === 'hospital' && govFilter !== 'all') {
      items = items.filter(i => (govFilter === 'govt' ? i.place.is_government : !i.place.is_government));
    }

    return items;
  }, [referenceLat, referenceLng, allPlaces, selectedTab, radiusKm, govFilter]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      
      {/* Top Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Everything Around {referenceName}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real distance sorted nearest first • No fake coordinates
          </p>
        </div>

        {/* Distance Radius Filter Buttons (Specification #18) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Radius:
          </span>
          {[0.5, 1, 2, 5, 10].map((dist) => (
            <button
              key={dist}
              onClick={() => setRadiusKm(dist)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                radiusKm === dist
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dist < 1 ? '500 m' : `${dist} km`}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs Scrollable on Mobile */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color || ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hospital Sub-filter (Govt vs Private) */}
      {selectedTab === 'hospital' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="text-slate-400">Filter type:</span>
          {(['all', 'govt', 'private'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setGovFilter(type)}
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                govFilter === type ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {type === 'all' ? 'All Hospitals' : type === 'govt' ? 'Government Only' : 'Private Only'}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      {nearbyItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyItems.map(({ place, distanceKm }) => {
            const isEmergencyCategory = 
              place.category === 'hospital' || 
              place.category === 'police' || 
              place.category === 'fire' || 
              place.category === 'ambulance';

            return (
              <div
                key={place.place_id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isEmergencyCategory 
                    ? 'border-red-200 bg-red-50/20 hover:border-red-400' 
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                } shadow-xs hover:shadow-md`}
              >
                <div>
                  {/* Category & Distance Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {place.subcategory}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      📍 {formatDistance(distanceKm)}
                    </span>
                  </div>

                  {/* Place Name & Bengali Name */}
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {place.name}
                  </h4>
                  {place.name_bn && (
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {place.name_bn}
                    </div>
                  )}

                  {/* Address */}
                  <div className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </div>

                  {/* Hours & Ratings */}
                  <div className="mt-2.5 space-y-1 text-xs">
                    {place.opening_hours && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={place.open_24h ? 'text-emerald-700 font-bold' : ''}>
                          {place.opening_hours}
                        </span>
                      </div>
                    )}

                    {place.rating && (
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{place.rating} / 5.0</span>
                        {place.price_level && <span className="text-slate-400">• {place.price_level}</span>}
                      </div>
                    )}

                    {place.entry_fee && (
                      <div className="text-[11px] text-slate-600">
                        Entry Fee: <strong>{place.entry_fee}</strong>
                      </div>
                    )}
                  </div>

                  {/* Description if available */}
                  {place.description && (
                    <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions: Call and Navigate */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {place.phone ? (
                    <a
                      href={`tel:${place.emergency_phone || place.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Direct phone call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call: {place.emergency_phone || place.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Phone not verified
                    </span>
                  )}

                  <a
                    href={place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-600">
            No verified places found within {radiusKm < 1 ? `${Math.round(radiusKm * 1000)}m` : `${radiusKm}km`} of {referenceName}.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try expanding the radius filter above to 5 km or 10 km.
          </p>
        </div>
      )}

    </div>
  );
};
