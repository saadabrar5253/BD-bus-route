import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Filter, 
  Navigation,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/searchEngine';

interface BankAtmSectionProps {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  lang: 'en' | 'bn';
}

const BANK_HOTLINES = [
  { bank: 'Dutch-Bangla Bank (DBBL)', phone: '16216', desc: 'Fast Track, NexusPay, ATM' },
  { bank: 'BRAC Bank', phone: '16221', desc: 'Astha, 24/7 ATM, Branches' },
  { bank: 'Islami Bank (IBBL)', phone: '16259', desc: 'CellFin, ATM, Remittance' },
  { bank: 'City Bank', phone: '16234', desc: 'Citytouch, Amex, ATM' },
  { bank: 'Eastern Bank (EBL)', phone: '16230', desc: 'Skybanking, ATM, Cards' },
  { bank: 'Sonali Bank', phone: '16639', desc: 'Govt Treasury, National ATM' },
];

export const BankAtmSection: React.FC<BankAtmSectionProps> = ({
  places,
  userLocation,
  onRequestLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | '24_7_atm' | 'deposit' | 'branch'>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Reference location (either GPS location or selected hub)
  const [referenceHub, setReferenceHub] = useState<{ name: string; lat: number; lng: number }>({
    name: 'GEC Circle',
    lat: 22.3592,
    lng: 91.8219,
  });

  const effectiveLocation = userLocation || { lat: referenceHub.lat, lng: referenceHub.lng };
  const effectiveLocationName = userLocation ? 'Your Current Location' : referenceHub.name;

  // Filter banks and ATMs
  const bankPlaces = useMemo(() => {
    return places.filter(p => p.category === 'bank');
  }, [places]);

  const filteredBanks = useMemo(() => {
    return bankPlaces
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
        // Distance filter
        if (distanceKm > radiusKm) return false;

        // Subcategory filter
        if (activeFilter === '24_7_atm' && !place.open_24h) return false;
        if (activeFilter === 'deposit' && !place.subcategory.toLowerCase().includes('crm') && !place.description?.toLowerCase().includes('deposit')) return false;
        if (activeFilter === 'branch' && !place.subcategory.toLowerCase().includes('branch')) return false;

        // Network filter
        if (selectedNetwork !== 'All') {
          if (!place.name.toLowerCase().includes(selectedNetwork.toLowerCase())) return false;
        }

        // Search query
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
  }, [bankPlaces, effectiveLocation, radiusKm, activeFilter, selectedNetwork, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-800/60 border border-cyan-500/30 text-cyan-200 text-xs font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>Verified 24/7 ATM Booths & Bank Branches</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {lang === 'en' ? 'Banks & 24/7 ATMs Near You' : 'ব্যাংক ও ২৪/৭ এটিএম বুথ'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Find nearest cash withdrawal ATM booths, cash deposit machines (CRM), and bank branches near bus routes and transit hubs.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRequestLocation}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'GPS Location Active' : 'Use My GPS Location'}</span>
            </button>
            <span className="text-[11px] text-cyan-300 text-center">
              📍 Relative to: <strong>{effectiveLocationName}</strong>
            </span>
          </div>
        </div>

        {/* Major Transit Hub Switcher if GPS not active */}
        {!userLocation && (
          <div className="mt-5 pt-4 border-t border-cyan-800/60">
            <span className="text-xs font-bold text-cyan-300 block mb-2">
              Select reference transit node:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'GEC Circle', lat: 22.3592, lng: 91.8219 },
                { name: 'Chawkbazar', lat: 22.3567, lng: 91.8385 },
                { name: 'Agrabad C/A', lat: 22.3245, lng: 91.8118 },
                { name: 'Bahaddarhat', lat: 22.3734, lng: 91.8492 },
                { name: 'Muradpur', lat: 22.3688, lng: 91.8389 },
                { name: 'Patenga Beach', lat: 22.2355, lng: 91.7925 },
              ].map(hub => (
                <button
                  key={hub.name}
                  onClick={() => setReferenceHub(hub)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    referenceHub.name === hub.name
                      ? 'bg-cyan-400 text-slate-950 shadow-xs'
                      : 'bg-cyan-950/80 text-cyan-200 hover:bg-cyan-800/50 border border-cyan-700/50'
                  }`}
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BANK HELPLINES TICKER */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-cyan-700" />
          <span>Official 24/7 Bank Helplines (Call Instantly for Card Block / Inquiry)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BANK_HOTLINES.map((h, i) => (
            <a
              key={i}
              href={`tel:${h.phone}`}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 transition-colors text-center block group"
            >
              <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-cyan-900">{h.bank}</div>
              <div className="text-sm font-black text-cyan-700 mt-0.5">📞 {h.phone}</div>
              <div className="text-[10px] text-slate-400 truncate">{h.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search ATM by bank name (DBBL, BRAC, Islami Bank) or location (GEC, Agrabad)...' : 'ব্যাংক বা এলাকা লিখে এটিএম বুথ খুঁজুন...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters and Radius */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Subtype filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Banks & ATMs' },
              { id: '24_7_atm', label: '⚡ 24/7 ATM Booths' },
              { id: 'deposit', label: '📥 Cash Deposit (CRM)' },
              { id: 'branch', label: '🏛️ Bank Branches' },
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

          {/* Radius selector */}
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
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dist < 1 ? '500m' : `${dist}km`}
              </button>
            ))}
          </div>
        </div>

        {/* Network quick filter tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1">
          <span className="text-slate-400 font-bold">Network:</span>
          {['All', 'Dutch-Bangla', 'BRAC Bank', 'Islami Bank', 'City Bank', 'Eastern Bank', 'Sonali Bank'].map(net => (
            <button
              key={net}
              onClick={() => setSelectedNetwork(net)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedNetwork === net
                  ? 'bg-cyan-100 text-cyan-900 font-bold border border-cyan-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Available Banks & ATMs ({filteredBanks.length} Found)
          </h2>
          <span className="text-xs text-slate-400">Sorted nearest first from {effectiveLocationName}</span>
        </div>

        {filteredBanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map(({ place, distanceKm }) => (
              <div
                key={place.place_id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Status & Distance Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {place.subcategory}
                    </span>
                    <span className="text-xs font-black text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-700" />
                      <span>{formatDistance(distanceKm)}</span>
                    </span>
                  </div>

                  {/* Title & Bengali Title */}
                  <h3 className="font-black text-base text-slate-900 leading-snug">
                    {place.name}
                  </h3>
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

                  {/* 24/7 Hours info */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={place.open_24h ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-600'}>
                      {place.open_24h && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {place.opening_hours}
                    </span>
                  </div>

                  {/* Feature Pills */}
                  <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                      💵 Cash Withdrawal
                    </span>
                    {place.description?.includes('CRM') && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        📥 Cash Deposit
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      💳 NPSB / VISA / MC
                    </span>
                  </div>

                  {/* Description */}
                  {place.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                {/* Footer with Helpline call & Navigation */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Direct Helpline"
                    >
                      <Phone className="w-3 h-3 text-cyan-700" />
                      <span>{place.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Guarded Booth</span>
                  )}

                  <a
                    href={place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
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
              No verified Bank or ATM booth found within {radiusKm < 1 ? `${Math.round(radiusKm * 1000)}m` : `${radiusKm}km`} matching your criteria.
            </p>
            <p className="text-xs text-slate-400">
              Try setting radius to 5km or 10km, or resetting the network filter.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
