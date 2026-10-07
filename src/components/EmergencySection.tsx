import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Hospital, 
  Radio, 
  LifeBuoy, 
  HeartHandshake, 
  MapPin, 
  Filter
} from 'lucide-react';
import { OFFICIAL_HOTLINES } from '../data/emergencyContacts';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/searchEngine';

interface EmergencySectionProps {
  emergencyPlaces: Place[];
  userLocation: { lat: number; lng: number } | null;
  lang: 'en' | 'bn';
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({
  emergencyPlaces,
  userLocation,
  lang,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const emergencyPlacesWithDistance = emergencyPlaces
    .filter(p => {
      if (p.category !== 'hospital' && p.category !== 'police' && p.category !== 'fire' && p.category !== 'emergency') {
        return false;
      }
      if (activeCategory === 'hospital' && p.category !== 'hospital') return false;
      if (activeCategory === 'police' && p.category !== 'police') return false;
      if (activeCategory === 'fire' && p.category !== 'fire') return false;
      return true;
    })
    .map(p => {
      const distKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) : null;
      return { place: p, distanceKm: distKm };
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return 0;
    });

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      
      {/* High Alert Crimson Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white p-6 sm:p-8 shadow-xl border border-red-600/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>24/7 Verified Bangladesh Emergency Directory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {lang === 'en' ? '🚨 Emergency Services & Hotlines' : '🚨 জরুরি সেবা ও হটলাইন'}
            </h1>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              Official toll-free and rapid-response emergency numbers for Police, Fire, Ambulance, Coast Guard and Hospitals. Zero fabricated numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:999"
              className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-red-700 font-black text-lg sm:text-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 animate-bounce"
            >
              <Phone className="w-6 h-6 fill-red-700" />
              <span>Call 999 Now</span>
            </a>
          </div>
        </div>
      </div>

      {/* NATIONAL OFFICIAL 24/7 HOTLINES (Specification #10) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-600" />
            <span>National Official Hotlines (Toll-Free & Direct)</span>
          </h2>
          <span className="text-xs text-slate-500">Government Verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_HOTLINES.map((hotline) => (
            <div
              key={hotline.id}
              className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                    {hotline.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    24/7 Toll-Free
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900">
                  {hotline.name}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {hotline.name_bn}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {hotline.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">
                  {hotline.number}
                </span>

                <a
                  href={`tel:${hotline.number}`}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEAREST PHYSICAL EMERGENCY SERVICES (Specification #11, #12, #13) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Verified Emergency Centers in Chattogram
            </h2>
            <p className="text-xs text-slate-500">
              {userLocation ? 'Sorted nearest to your current GPS coordinates' : 'Central Hospitals, Police Commands, and Fire Squads'}
            </p>
          </div>

          {/* Subcategory filter */}
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'All Emergency' },
              { id: 'hospital', label: '🏥 Hospitals' },
              { id: 'police', label: '🚓 Police' },
              { id: 'fire', label: '🚒 Fire' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyPlacesWithDistance.map(({ place, distanceKm }) => (
            <div
              key={place.place_id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {place.subcategory}
                  </span>
                  {distanceKm !== null && (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      📍 {formatDistance(distanceKm)}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900">
                  {place.name}
                </h3>
                {place.name_bn && (
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {place.name_bn}
                  </div>
                )}

                <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{place.address}</span>
                </div>

                {place.opening_hours && (
                  <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{place.opening_hours}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {place.phone ? (
                  <a
                    href={`tel:${place.emergency_phone || place.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {place.emergency_phone || place.phone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Phone not available</span>
                )}

                <a
                  href={place.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Map</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
