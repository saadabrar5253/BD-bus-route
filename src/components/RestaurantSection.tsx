import React, { useState, useMemo } from 'react';
import { 
  Utensils, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  Star, 
  Filter, 
  Navigation,
  Flame,
  Coffee,
  Heart
} from 'lucide-react';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/searchEngine';

interface RestaurantSectionProps {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  lang: 'en' | 'bn';
}

const FOOD_TIPS = [
  { name: 'Mezbani Gosht', place: 'Chawkbazar & GEC', desc: 'Chittagonian spicy ceremonial beef curry' },
  { name: 'Handi Biryani', place: 'GEC Circle', desc: 'Claypot fragrant slow-cooked rice & mutton' },
  { name: 'Crab & Street Fry', place: 'Patenga Sea Beach', desc: 'Fresh seafood snacks at sunset promenade' },
  { name: 'Cafe & Continental', place: 'GEC & Prabartak', desc: 'Pasta, gourmet coffee & bakery treats' },
];

export const RestaurantSection: React.FC<RestaurantSectionProps> = ({
  places,
  userLocation,
  onRequestLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mezbani' | 'biryani' | 'cafe' | 'budget'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  const [referenceHub, setReferenceHub] = useState<{ name: string; lat: number; lng: number }>({
    name: 'GEC Circle',
    lat: 22.3592,
    lng: 91.8219,
  });

  const effectiveLocation = userLocation || { lat: referenceHub.lat, lng: referenceHub.lng };
  const effectiveLocationName = userLocation ? 'Your Current Location' : referenceHub.name;

  const restaurantPlaces = useMemo(() => {
    return places.filter(p => p.category === 'restaurant');
  }, [places]);

  const filteredRestaurants = useMemo(() => {
    return restaurantPlaces
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
        const name = place.name.toLowerCase();

        if (activeFilter === 'mezbani' && !sub.includes('mezban') && !desc.includes('mezban') && !name.includes('mezban')) return false;
        if (activeFilter === 'biryani' && !sub.includes('biryani') && !desc.includes('biryani') && !sub.includes('bengali') && !sub.includes('indian')) return false;
        if (activeFilter === 'cafe' && !sub.includes('cafe') && !sub.includes('fast food')) return false;
        if (activeFilter === 'budget' && place.price_level && !place.price_level.includes('Budget') && !place.price_level.startsWith('৳ ')) return false;

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
  }, [restaurantPlaces, effectiveLocation, radiusKm, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-900 via-slate-900 to-orange-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/60 border border-amber-500/30 text-amber-200 text-xs font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Authentic Chittagonian Food & Popular Restaurants</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {lang === 'en' ? 'Restaurants & Dining Near You' : 'রেস্টুরেন্ট ও খাবার'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl leading-relaxed">
              Find authentic Mezbani beef, Handi Biryani, continental cafes, family dining spots, and local snacks near bus stops.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRequestLocation}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'GPS Location Active' : 'Use My Live GPS Location'}</span>
            </button>
            <span className="text-[11px] text-amber-300 text-center">
              📍 Relative to: <strong>{effectiveLocationName}</strong>
            </span>
          </div>
        </div>

        {/* Major Transit Hub Switcher */}
        {!userLocation && (
          <div className="mt-5 pt-4 border-t border-amber-800/60">
            <span className="text-xs font-bold text-amber-300 block mb-2">
              Select reference transit node:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'GEC Circle', lat: 22.3592, lng: 91.8219 },
                { name: 'Chawkbazar', lat: 22.3567, lng: 91.8385 },
                { name: 'Agrabad C/A', lat: 22.3245, lng: 91.8118 },
                { name: 'Bahaddarhat', lat: 22.3734, lng: 91.8492 },
                { name: 'New Market', lat: 22.3361, lng: 91.8329 },
                { name: 'Patenga Beach', lat: 22.2355, lng: 91.7925 },
              ].map(hub => (
                <button
                  key={hub.name}
                  onClick={() => setReferenceHub(hub)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    referenceHub.name === hub.name
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-amber-950/80 text-amber-200 hover:bg-amber-800/50 border border-amber-700/50'
                  }`}
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHITTAGONG FOOD HIGHLIGHTS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>Must-Try Local Specialties Along Major Routes</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FOOD_TIPS.map((tip, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <strong className="block text-slate-800">{tip.name}</strong>
              <span className="text-[11px] text-amber-700 font-semibold">{tip.place}</span>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{tip.desc}</p>
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
            placeholder={lang === 'en' ? 'Search restaurant name (Handi, Mezban, Cafe Milano) or cuisine...' : 'রেস্টুরেন্টের নাম বা খাবারের ধরন লিখে খুঁজুন...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Food' },
              { id: 'mezbani', label: '🥩 Authentic Mezbani (মেজবানি)' },
              { id: 'biryani', label: '🍛 Biryani & Bengali' },
              { id: 'cafe', label: '☕ Cafes & Fast Food' },
              { id: 'budget', label: '৳ Budget Friendly' },
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
            {[0.5, 1, 2, 5, 10].map(dist => (
              <button
                key={dist}
                onClick={() => setRadiusKm(dist)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  radiusKm === dist
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dist < 1 ? '500m' : `${dist}km`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Available Restaurants & Eateries ({filteredRestaurants.length} Found)
          </h2>
          <span className="text-xs text-slate-400">Sorted nearest first from {effectiveLocationName}</span>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map(({ place, distanceKm }) => (
              <div
                key={place.place_id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {place.subcategory}
                    </span>
                    <span className="text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-700" />
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
                    <span>{place.opening_hours || '11:00 AM - 11:00 PM'}</span>
                  </div>

                  {place.rating && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{place.rating} / 5.0</span>
                      {place.price_level && <span className="text-slate-400 font-normal">• {place.price_level}</span>}
                    </div>
                  )}

                  {place.description && (
                    <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Direct call"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                      <span>Call Restaurant</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Walk-in Dining</span>
                  )}

                  <a
                    href={place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No restaurant found within {radiusKm < 1 ? `${Math.round(radiusKm * 1000)}m` : `${radiusKm}km`} matching your criteria.
            </p>
            <p className="text-xs text-slate-400">
              Try setting radius to 5km or 10km above.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
