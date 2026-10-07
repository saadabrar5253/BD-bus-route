import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowRightLeft, 
  Bus, 
  Navigation, 
  PhoneCall, 
  Hospital, 
  Utensils, 
  Hotel, 
  Compass, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { BusStop } from '../types';

interface HomeSearchProps {
  allStops: BusStop[];
  onSearch: (from: string, to: string) => void;
  onQuickCategory: (category: string) => void;
  onSelectStopPage: (stop: BusStop) => void;
  onOmniSearch: (term: string) => void;
  onRequestUserLocation: () => void;
  userLocationName?: string;
  isLocating?: boolean;
  lang: 'en' | 'bn';
}

const POPULAR_EXAMPLES = [
  { from: 'GEC Circle', to: 'CUET', label: 'GEC → CUET', badge: 'Direct' },
  { from: 'Chawkbazar', to: 'Agrabad', label: 'Chawkbazar → Agrabad', badge: 'Direct' },
  { from: 'New Market', to: 'GEC Circle', label: 'New Market → GEC', badge: 'Route 10 / 1 / 3' },
  { from: 'Bahaddarhat', to: 'Patenga Sea Beach', label: 'Bahaddarhat → Patenga', badge: 'Route 10' },
  { from: 'Bahaddarhat', to: "Cox's Bazar", label: 'Chittagong → Cox’s Bazar', badge: 'Highway' },
];

export const HomeSearch: React.FC<HomeSearchProps> = ({
  allStops,
  onSearch,
  onQuickCategory,
  onOmniSearch,
  onRequestUserLocation,
  userLocationName,
  isLocating,
  lang,
}) => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [omniInput, setOmniInput] = useState('');

  const [fromSuggestions, setFromSuggestions] = useState<BusStop[]>([]);
  const [toSuggestions, setToSuggestions] = useState<BusStop[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Sync userLocationName if updated
  useEffect(() => {
    if (userLocationName && !fromQuery) {
      setFromQuery(userLocationName);
    }
  }, [userLocationName]);

  // Click outside listener for autocomplete dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFromChange = (val: string) => {
    setFromQuery(val);
    if (!val.trim()) {
      setFromSuggestions([]);
      setShowFromDropdown(false);
      return;
    }
    const clean = val.toLowerCase().trim();
    const filtered = allStops.filter(s =>
      s.stop_name.toLowerCase().includes(clean) ||
      s.stop_name_bn.toLowerCase().includes(clean) ||
      s.aliases.some(a => a.toLowerCase().includes(clean))
    ).slice(0, 6);
    setFromSuggestions(filtered);
    setShowFromDropdown(true);
  };

  const handleToChange = (val: string) => {
    setToQuery(val);
    if (!val.trim()) {
      setToSuggestions([]);
      setShowToDropdown(false);
      return;
    }
    const clean = val.toLowerCase().trim();
    const filtered = allStops.filter(s =>
      s.stop_name.toLowerCase().includes(clean) ||
      s.stop_name_bn.toLowerCase().includes(clean) ||
      s.aliases.some(a => a.toLowerCase().includes(clean))
    ).slice(0, 6);
    setToSuggestions(filtered);
    setShowToDropdown(true);
  };

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  const handleFindBus = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fromQuery.trim() || !toQuery.trim()) {
      return;
    }
    onSearch(fromQuery.trim(), toQuery.trim());
  };

  const handleOmniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (omniInput.trim()) {
      onOmniSearch(omniInput.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Card with Bus Route Search */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
        
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {lang === 'en' ? 'Verified Bangladesh Transit System' : 'যাচাইকৃত বাংলাদেশ বাস রুট সিস্টেম'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            {lang === 'en' ? 'Which Bus Goes There?' : 'কোন বাস যাবে?'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base font-normal max-w-xl mx-auto">
            {lang === 'en'
              ? 'Find bus numbers, starting points, ending points, and all major stops instantly.'
              : 'বাসের নম্বর, শুরুর পয়েন্ট, গন্তব্য এবং সব প্রধান স্টপ সহজে খুঁজে নিন।'}
          </p>
        </div>

        {/* PRIMARY BUS SEARCH INTERFACE */}
        <div className="relative z-10 max-w-2xl mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-800 border border-slate-100">
          <form onSubmit={handleFindBus} className="space-y-3">
            
            {/* FROM INPUT */}
            <div ref={fromRef} className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {lang === 'en' ? 'FROM' : 'শুরু'}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {lang === 'en' ? 'Where are you now?' : 'আপনি এখন কোথায়?'}
                </span>
              </label>
              
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-5 h-5 text-emerald-700" />
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => handleFromChange(e.target.value)}
                  onFocus={() => fromQuery && setShowFromDropdown(true)}
                  placeholder={lang === 'en' ? 'e.g. GEC Circle, Chawkbazar, Bahaddarhat...' : 'যেমন: জিইসি মোড়, চকবাজার, বহদ্দারহাট...'}
                  className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                
                {/* Use My Location GPS button */}
                <button
                  type="button"
                  onClick={onRequestUserLocation}
                  disabled={isLocating}
                  className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Detect GPS Location"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
                </button>
              </div>

              {/* FROM AUTOCOMPLETE DROPDOWN */}
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                  {fromSuggestions.map((stop) => (
                    <div
                      key={stop.stop_id}
                      onClick={() => {
                        setFromQuery(stop.stop_name);
                        setShowFromDropdown(false);
                      }}
                      className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-left transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800">{stop.stop_name}</div>
                        <div className="text-xs text-slate-500">{stop.stop_name_bn} • {stop.thana}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium">
                        {stop.served_routes.length} buses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center -my-2 relative z-20">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 border border-slate-200 shadow-xs transition-transform active:rotate-180"
                title="Swap From and To"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* TO INPUT */}
            <div ref={toRef} className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  {lang === 'en' ? 'TO' : 'গন্তব্য'}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {lang === 'en' ? 'Where do you want to go?' : 'কোথায় যেতে চান?'}
                </span>
              </label>

              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-5 h-5 text-red-600" />
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => handleToChange(e.target.value)}
                  onFocus={() => toQuery && setShowToDropdown(true)}
                  placeholder={lang === 'en' ? 'e.g. CUET, Agrabad, Patenga Sea Beach...' : 'যেমন: চুয়েট, আগ্রাবাদ, পতেঙ্গা সমুদ্র সৈকত...'}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              {/* TO AUTOCOMPLETE DROPDOWN */}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                  {toSuggestions.map((stop) => (
                    <div
                      key={stop.stop_id}
                      onClick={() => {
                        setToQuery(stop.stop_name);
                        setShowToDropdown(false);
                      }}
                      className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-left transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800">{stop.stop_name}</div>
                        <div className="text-xs text-slate-500">{stop.stop_name_bn} • {stop.thana}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium">
                        {stop.served_routes.length} buses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LARGE FIND BUS BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!fromQuery.trim() || !toQuery.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-800/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Search className="w-5 h-5" />
                <span>{lang === 'en' ? '🔎 Find Bus' : '🔎 বাস খুঁজুন'}</span>
              </button>
            </div>
          </form>

          {/* Quick Examples Badges */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Popular Bus Queries:' : 'জনপ্রিয় বাস সার্চ:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_EXAMPLES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFromQuery(item.from);
                    setToQuery(item.to);
                    onSearch(item.from, item.to);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200/60"
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] px-1 rounded-sm bg-white text-slate-500 border border-slate-200">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Omnibox Multilingual Smart Search */}
        <div className="relative z-10 max-w-2xl mx-auto mt-6">
          <form onSubmit={handleOmniSubmit} className="relative flex items-center">
            <Sparkles className="absolute left-3.5 w-4 h-4 text-emerald-300" />
            <input
              type="text"
              value={omniInput}
              onChange={(e) => setOmniInput(e.target.value)}
              placeholder={lang === 'en' ? 'Or search "Route 10", "GEC bus", "Hospital near GEC", "জিইসি"...' : 'অথবা সার্চ করুন "Route 10", "GEC bus", "জিইসির কাছে হাসপাতাল"...'}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 placeholder:text-emerald-300/60 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (Specification #30) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{lang === 'en' ? 'Quick Actions' : 'দ্রুত সেবা সমূহ'}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {lang === 'en' ? 'Verified Transit & Local Services' : 'যাচাইকৃত লোকাল সার্ভিস'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* 1. Find Bus */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🚌
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-emerald-800">
                {lang === 'en' ? 'Find Bus' : 'বাস খুঁজুন'}
              </div>
              <div className="text-[11px] text-slate-500">Route & Direct Bus</div>
            </div>
          </button>

          {/* 2. Bus Routes */}
          <button
            onClick={() => onQuickCategory('routes')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🗺️
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-blue-800">
                {lang === 'en' ? 'Bus Routes' : 'বাস রুট সমূহ'}
              </div>
              <div className="text-[11px] text-slate-500">All Verified Buses</div>
            </div>
          </button>

          {/* 3. Bus Near Me */}
          <button
            onClick={() => onQuickCategory('near-me')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📍
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-800">
                {lang === 'en' ? 'Bus Near Me' : 'কাছের বাস'}
              </div>
              <div className="text-[11px] text-slate-500">GPS Stops & Walk</div>
            </div>
          </button>

          {/* 4. EMERGENCY */}
          <button
            onClick={() => onQuickCategory('emergency')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50/80 border border-red-200 shadow-xs hover:shadow-md hover:border-red-400 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform animate-pulse">
              🚨
            </div>
            <div>
              <div className="font-bold text-sm text-red-900 group-hover:text-red-700">
                {lang === 'en' ? 'Emergency' : 'জরুরি নম্বর'}
              </div>
              <div className="text-[11px] text-red-700 font-semibold">999, Fire, Hospital</div>
            </div>
          </button>

          {/* 5. Hospitals */}
          <button
            onClick={() => onQuickCategory('hospital')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏥
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-rose-800">
                {lang === 'en' ? 'Hospitals' : 'হাসপাতাল'}
              </div>
              <div className="text-[11px] text-slate-500">Govt & Private 24/7</div>
            </div>
          </button>

          {/* 6. Restaurants */}
          <button
            onClick={() => onQuickCategory('restaurant')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-amber-800">
                {lang === 'en' ? 'Restaurants' : 'রেস্টুরেন্ট'}
              </div>
              <div className="text-[11px] text-slate-500">Mezbani & Local Food</div>
            </div>
          </button>

          {/* 7. Residential Hotels (Updated from Hotels) */}
          <button
            onClick={() => onQuickCategory('residential-hotels')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏨
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-purple-800">
                {lang === 'en' ? 'Residential Hotels' : 'আবাসিক হোটেল'}
              </div>
              <div className="text-[11px] text-slate-500">AC/Non-AC & Guest Houses</div>
            </div>
          </button>

          {/* 8. Tourist Spots */}
          <button
            onClick={() => onQuickCategory('tourist')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏞️
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-emerald-800">
                {lang === 'en' ? 'Tourist Spots' : 'দর্শনীয় স্থান'}
              </div>
              <div className="text-[11px] text-slate-500">Patenga, Foy’s Lake...</div>
            </div>
          </button>

          {/* 9. Banks & ATMs */}
          <button
            onClick={() => onQuickCategory('banks')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 shadow-xs hover:shadow-md hover:border-cyan-400 text-left transition-all group sm:col-span-2 lg:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-xs">
              🏦
            </div>
            <div>
              <div className="font-bold text-sm text-cyan-950 group-hover:text-cyan-800">
                {lang === 'en' ? 'Banks & ATMs' : 'ব্যাংক ও এটিএম'}
              </div>
              <div className="text-[11px] text-cyan-700 font-medium">24/7 Cash & Fast Track</div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
