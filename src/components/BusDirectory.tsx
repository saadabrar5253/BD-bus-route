import React, { useState, useMemo } from 'react';
import { 
  Bus, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Map, 
  Filter, 
  Navigation,
  FileText
} from 'lucide-react';
import { BusRoute } from '../types';

interface BusDirectoryProps {
  allRoutes: BusRoute[];
  onSelectRoute: (route: BusRoute) => void;
  lang: 'en' | 'bn';
}

const REGION_FILTERS = [
  'All',
  'Chattogram',
  'Dhaka',
  'Inter-district',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

export const BusDirectory: React.FC<BusDirectoryProps> = ({
  allRoutes,
  onSelectRoute,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'Active' | 'Verified'>('all');

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((route) => {
      // Region filter
      if (selectedRegion !== 'All') {
        if (selectedRegion === 'Inter-district') {
          if (route.classification !== 'intercity' && route.city !== 'Inter-district') return false;
        } else if (!route.city.toLowerCase().includes(selectedRegion.toLowerCase()) && !route.division.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (serviceFilter === 'Verified' && route.verification_status !== 'Verified') return false;
      if (serviceFilter === 'Active' && route.service_status !== 'Active') return false;

      // Search query filter (matches route number, name, starts, ends, major stops)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = route.route_number.toLowerCase().includes(q);
        const matchesName = route.bus_name.toLowerCase().includes(q) || (route.bus_name_bn && route.bus_name_bn.toLowerCase().includes(q));
        const matchesStartEnd = route.start_point.toLowerCase().includes(q) || route.end_point.toLowerCase().includes(q);
        const matchesStops = route.major_stops.some(s => s.toLowerCase().includes(q));
        const matchesOperator = route.operator.toLowerCase().includes(q);

        if (!matchesNumber && !matchesName && !matchesStartEnd && !matchesStops && !matchesOperator) {
          return false;
        }
      }

      return true;
    });
  }, [allRoutes, selectedRegion, serviceFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Bus className="w-3.5 h-3.5" />
              <span>National Bus Route Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'en' ? 'All Bus Routes in Bangladesh' : 'বাংলাদেশের সব বাস রুট ডিরেক্টরি'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search by route number, bus name, starting terminal, or any intermediate stop.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            {allRoutes.length} Total Verified Routes Registered
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search by bus number (e.g. 10, 6, CUET-1), name, or stop (GEC, Patenga)...' : 'বাস নম্বর (১০, ৬, চুয়েট), নাম অথবা স্টপ লিখে খুঁজুন...'}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Region & Division Pills (Specification #5) */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Division / Area:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {REGION_FILTERS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRegion === region
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routes Grid Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Matching Routes ({filteredRoutes.length})
          </h2>
          <span className="text-xs text-slate-400">Click any card to inspect stops & map</span>
        </div>

        {filteredRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.bus_id}
                onClick={() => onSelectRoute(route)}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        {route.route_number}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Route #{route.route_number}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {route.city}
                        </span>
                      </div>
                    </div>

                    {route.verification_status === 'Verified' ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Route Title & Bengali */}
                  <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {route.bus_name}
                  </h3>
                  {route.bus_name_bn && (
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {route.bus_name_bn}
                    </div>
                  )}

                  {/* Start -> End Journey Bar */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between text-slate-800 font-bold">
                      <span className="truncate max-w-[45%] text-emerald-800">{route.start_point}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="truncate max-w-[45%] text-red-700 text-right">{route.end_point}</span>
                    </div>
                  </div>

                  {/* Major Stops preview */}
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Key Stops:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {route.major_stops.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {s}
                        </span>
                      ))}
                      {route.major_stops.length > 4 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          +{route.major_stops.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>View Full Map & Stops</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No bus routes found matching "{searchQuery}" in {selectedRegion}.
            </p>
            <p className="text-xs text-slate-400">
              Try searching for general terms like "10", "6", "GEC", "Agrabad", or "CUET".
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
