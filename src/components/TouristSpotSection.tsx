import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  Star, 
  Filter, 
  Navigation,
  Waves,
  Mountain,
  Landmark,
  Ticket
} from 'lucide-react';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/searchEngine';

interface TouristSpotSectionProps {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  lang: 'en' | 'bn';
}

const TOURIST_HIGHLIGHTS = [
  { name: 'Patenga Sea Beach', type: 'Beach & Sunset', desc: 'Where the Karnaphuli river meets the Bay of Bengal' },
  { name: 'Foy\'s Lake & Concord', type: 'Lake & Hills', desc: 'Historic 1924 reservoir with boats & amusement park' },
  { name: 'Batali Hill (Jilapi Pahar)', type: 'City Viewpoint', desc: 'Highest peak in Chittagong with 360° bay views' },
  { name: 'Bayazid Bostami Shrine', type: 'Spiritual Heritage', desc: 'Sacred pond with rare black softshell turtles' },
];

export const TouristSpotSection: React.FC<TouristSpotSectionProps> = ({
  places,
  userLocation,
  onRequestLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'beach' | 'nature' | 'heritage'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(10); // Default 10km for tourist spots

  const [referenceHub, setReferenceHub] = useState<{ name: string; lat: number; lng: number }>({
    name: 'GEC Circle',
    lat: 22.3592,
    lng: 91.8219,
  });

  const effectiveLocation = userLocation || { lat: referenceHub.lat, lng: referenceHub.lng };
  const effectiveLocationName = userLocation ? 'Your Current Location' : referenceHub.name;

  const touristPlaces = useMemo(() => {
    return places.filter(p => p.category === 'tourist');
  }, [places]);

  const filteredSpots = useMemo(() => {
    return touristPlaces
      .map(place => {
        const dist = calculateDistanceKm(
          effectiveLocation.lat,
          effectiveLocation.lng,
          place.latitude,
          place.longitude
        );
        return { place, distanceKm: dist };
      })
      .filter(({ place, distanceKm }) => {
        if (distanceKm > radiusKm) return false;

        const sub = place.subcategory.toLowerCase();
        const desc = (place.description || '').toLowerCase();

        if (activeFilter === 'beach' && !sub.includes('beach') && !sub.includes('coastal') && !desc.includes('sea')) return false;
        if (activeFilter === 'nature' && !sub.includes('lake') && !sub.includes('hill') && !sub.includes('nature') && !sub.includes('park')) return false;
        if (activeFilter === 'heritage' && !sub.includes('heritage') && !sub.includes('shrine') && !sub.includes('colonial') && !sub.includes('museum')) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = place.name.toLowerCase().includes(q) || place.name_bn.toLowerCase().includes(q);
          const matchesAddress = place.address.toLowerCase().includes(q) || place.thana.toLowerCase().includes(q);
          const matchesDesc = place.description?.toLowerCase().includes(q);
          if (!matchesName && !matchesAddress && !matchesDesc) return false;
        }

        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [touristPlaces, effectiveLocation, radiusKm, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Verified Tourist Attractions, Beaches, Hills & Heritage</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {lang === 'en' ? 'Tourist Spots Near You' : 'দর্শনীয় স্থান ও পর্যটন'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Find iconic sights like Patenga Sea Beach, Foy's Lake, Batali Hill viewpoint, Bhatiary sunset points, and historical shrines reachable by bus.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRequestLocation}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'GPS Location Active' : 'Use My Live GPS Location'}</span>
            </button>
            <span className="text-[11px] text-emerald-300 text-center">
              📍 Relative to: <strong>{effectiveLocationName}</strong>
            </span>
          </div>
        </div>

        {/* Major Transit Hub Switcher */}
        {!userLocation && (
          <div className="mt-5 pt-4 border-t border-emerald-800/60">
            <span className="text-xs font-bold text-emerald-300 block mb-2">
              Select reference transit node:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'GEC Circle', lat: 22.3592, lng: 91.8219 },
                { name: 'Chawkbazar', lat: 22.3567, lng: 91.8385 },
                { name: 'Agrabad C/A', lat: 22.3245, lng: 91.8118 },
                { name: 'Bahaddarhat', lat: 22.3734, lng: 91.8492 },
                { name: 'Patenga Beach', lat: 22.2355, lng: 91.7925 },
                { name: 'Bhatiary Mor', lat: 22.4385, lng: 91.7458 },
              ].map(hub => (
                <button
                  key={hub.name}
                  onClick={() => setReferenceHub(hub)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    referenceHub.name === hub.name
                      ? 'bg-emerald-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-800/50 border border-emerald-700/50'
                  }`}
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TOURIST HIGHLIGHTS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-emerald-700" />
          <span>Major Chattogram Sights & Scenic Views</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TOURIST_HIGHLIGHTS.map((h, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <strong className="block text-slate-800">{h.name}</strong>
              <span className="text-[11px] text-emerald-700 font-semibold">{h.type}</span>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search tourist spots (Patenga, Foy\'s Lake, Batali Hill, Shrine)...' : 'দর্শনীয় স্থান বা পর্যটন এলাকার নাম লিখে খুঁজুন...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Tourist Spots' },
              { id: 'beach', label: '🏖️ Beaches & Sea' },
              { id: 'nature', label: '🌄 Hills, Lakes & Parks' },
              { id: 'heritage', label: '🕌 Heritage & Shrines' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Radius:
            </span>
            {[1, 2, 5, 10, 20].map(dist => (
              <button
                key={dist}
                onClick={() => setRadiusKm(dist)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  radiusKm === dist
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {`${dist}km`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Tourist Attractions ({filteredSpots.length} Found)
          </h2>
          <span className="text-xs text-slate-400">Sorted nearest first from {effectiveLocationName}</span>
        </div>

        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpots.map(({ place, distanceKm }) => (
              <div
                key={place.place_id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {place.subcategory}
                    </span>
                    <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      <span>{formatDistance(distanceKm)}</span>
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 leading-snug">
                    {place.name}
                  </h3>
                  {place.name_bn && (
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {place.name_bn}
                    </div>
                  )}

                  <div className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{place.opening_hours || 'Open Daily'}</span>
                  </div>

                  {place.entry_fee && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                      <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Entry: {place.entry_fee}</span>
                    </div>
                  )}

                  {place.rating && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{place.rating} / 5.0 Rating</span>
                    </div>
                  )}

                  {place.description && (
                    <p className="mt-2.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No tourist attraction found within {radiusKm}km matching your criteria.
            </p>
            <p className="text-xs text-slate-400">
              Try setting radius to 20km above to view Patenga Beach or Sitakunda hills.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
