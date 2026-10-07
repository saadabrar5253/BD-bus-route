import React, { useState, useMemo } from 'react';
import { 
  Hospital, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Filter, 
  Navigation,
  HeartPulse,
  Ambulance,
  Building2
} from 'lucide-react';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/searchEngine';

interface HospitalSectionProps {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  lang: 'en' | 'bn';
}

const HOSPITAL_HOTLINES = [
  { name: 'Shastho Batayan', phone: '16263', desc: 'National 24/7 Health Consultancy' },
  { name: 'National Ambulance', phone: '999', desc: 'Toll-free 24/7 Police, Fire, Ambulance' },
  { name: 'CMCH Emergency', phone: '02333355444', desc: 'Chittagong Medical College Trauma' },
  { name: 'General Hospital', phone: '02333350100', desc: 'Andarkilla Govt 250-Bed Hospital' },
  { name: 'Imperial Hospital', phone: '09612247247', desc: 'Advanced Cardiac & Emergency Care' },
  { name: 'Medical Centre GEC', phone: '01819318181', desc: 'GEC Circle 24/7 Trauma Emergency' },
];

export const HospitalSection: React.FC<HospitalSectionProps> = ({
  places,
  userLocation,
  onRequestLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'govt' | 'private' | 'emergency24'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Reference transit node
  const [referenceHub, setReferenceHub] = useState<{ name: string; lat: number; lng: number }>({
    name: 'GEC Circle',
    lat: 22.3592,
    lng: 91.8219,
  });

  const effectiveLocation = userLocation || { lat: referenceHub.lat, lng: referenceHub.lng };
  const effectiveLocationName = userLocation ? 'Your Current Location' : referenceHub.name;

  const hospitalPlaces = useMemo(() => {
    return places.filter(p => p.category === 'hospital');
  }, [places]);

  const filteredHospitals = useMemo(() => {
    return hospitalPlaces
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

        if (activeFilter === 'govt' && !place.is_government) return false;
        if (activeFilter === 'private' && place.is_government) return false;
        if (activeFilter === 'emergency24' && !place.open_24h) return false;

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
  }, [hospitalPlaces, effectiveLocation, radiusKm, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-800/60 border border-rose-500/30 text-rose-200 text-xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
              <span>Verified 24/7 Emergency Hospitals & Diagnostic Centers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {lang === 'en' ? 'Hospitals Near You' : 'হাসপাতাল ও জরুরি স্বাস্থ্যসেবা'}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/80 max-w-2xl leading-relaxed">
              Find government medical colleges, private multi-specialty hospitals, emergency triage desks, and trauma centers with direct hotline dialing.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRequestLocation}
              className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'GPS Location Active' : 'Use My Live GPS Location'}</span>
            </button>
            <span className="text-[11px] text-rose-300 text-center">
              📍 Relative to: <strong>{effectiveLocationName}</strong>
            </span>
          </div>
        </div>

        {/* Major Transit Hub Switcher */}
        {!userLocation && (
          <div className="mt-5 pt-4 border-t border-rose-800/60">
            <span className="text-xs font-bold text-rose-300 block mb-2">
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
                      ? 'bg-rose-400 text-slate-950 shadow-xs'
                      : 'bg-rose-950/80 text-rose-200 hover:bg-rose-800/50 border border-rose-700/50'
                  }`}
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HEALTH HOTLINES TICKER */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Ambulance className="w-3.5 h-3.5 text-rose-600" />
          <span>Emergency Health & Ambulance Hotlines</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {HOSPITAL_HOTLINES.map((h, i) => (
            <a
              key={i}
              href={`tel:${h.phone}`}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors text-center block group"
            >
              <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-rose-900">{h.name}</div>
              <div className="text-sm font-black text-rose-700 mt-0.5">📞 {h.phone}</div>
              <div className="text-[10px] text-slate-400 truncate">{h.desc}</div>
            </a>
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
            placeholder={lang === 'en' ? 'Search hospital name (CMCH, Medical Centre, Imperial) or area...' : 'হাসপাতালের নাম বা এলাকা লিখে খুঁজুন...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Hospitals' },
              { id: 'govt', label: '🏛️ Government (সরকারি)' },
              { id: 'private', label: '🏢 Private (বেসরকারি)' },
              { id: 'emergency24', label: '🚨 24/7 Emergency Desk' },
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
                    ? 'bg-rose-700 text-white shadow-xs'
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
            Available Hospitals & Trauma Centers ({filteredHospitals.length} Found)
          </h2>
          <span className="text-xs text-slate-400">Sorted nearest first from {effectiveLocationName}</span>
        </div>

        {filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map(({ place, distanceKm }) => (
              <div
                key={place.place_id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                      {place.subcategory}
                    </span>
                    <span className="text-xs font-black text-rose-900 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-700" />
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

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={place.open_24h ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-600'}>
                      {place.open_24h && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {place.opening_hours}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${place.is_government ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                      {place.is_government ? '🏛️ Govt Hospital' : '🏢 Private Care'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">
                      🚨 ICU / Trauma
                    </span>
                  </div>

                  {place.description && (
                    <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {place.emergency_phone || place.phone ? (
                    <a
                      href={`tel:${place.emergency_phone || place.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Direct Emergency Desk"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call: {place.emergency_phone || place.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Emergency Desk</span>
                  )}

                  <a
                    href={place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No hospital found within {radiusKm < 1 ? `${Math.round(radiusKm * 1000)}m` : `${radiusKm}km`} matching your criteria.
            </p>
            <p className="text-xs text-slate-400">
              Try expanding radius to 5km or 10km above.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
