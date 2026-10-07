import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Compass, 
  PhoneCall, 
  Flag,
  Share2
} from 'lucide-react';
import { BusRoute, BusStop, Place } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { NearbyPlacesDashboard } from './NearbyPlacesDashboard';

interface BusStopViewProps {
  stop: BusStop;
  allRoutes: BusRoute[];
  allStops: BusStop[];
  allPlaces: Place[];
  onSelectRoute: (route: BusRoute) => void;
  onSetAsFrom: (stopName: string) => void;
  onSetAsTo: (stopName: string) => void;
  onOpenReportModal: (targetId: string, targetName: string, targetType: 'bus' | 'stop') => void;
  lang: 'en' | 'bn';
}

export const BusStopView: React.FC<BusStopViewProps> = ({
  stop,
  allRoutes,
  allPlaces,
  onSelectRoute,
  onSetAsFrom,
  onSetAsTo,
  onOpenReportModal,
  lang,
}) => {
  // Find which routes pass through this stop
  const passingRoutes = allRoutes.filter(r =>
    r.all_stops.some(s => s.stop_id === stop.stop_id || s.name.toLowerCase().includes(stop.stop_name.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Stop Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                🚏 Bus Stop Hub
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Transit Node
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stop.stop_name}
            </h1>
            <div className="text-base text-slate-600 font-semibold mt-1">
              {stop.stop_name_bn} • {stop.thana}, {stop.district}
            </div>

            {stop.description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
                {stop.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Aliases:</span>
              {stop.aliases.map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Journey Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => onSetAsFrom(stop.stop_name)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Bus className="w-4 h-4" />
              <span>Find Bus From Here</span>
            </button>

            <button
              onClick={() => onSetAsTo(stop.stop_name)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span>Find Bus To Here</span>
            </button>

            <a
              href={`https://maps.google.com/?q=${stop.latitude},${stop.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>

        {/* Map of Stop */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner">
            <InteractiveMap
              stops={[stop]}
              selectedStop={stop}
              center={[stop.latitude, stop.longitude]}
              zoom={15}
            />
          </div>
        </div>
      </div>

      {/* BUSES SERVING THIS STOP (Specification #8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Buses Passing Through {stop.stop_name}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              {passingRoutes.length}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Tap to inspect route</span>
        </div>

        {passingRoutes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {passingRoutes.map((route) => (
              <div
                key={route.bus_id}
                onClick={() => onSelectRoute(route)}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-black text-base flex items-center justify-center group-hover:scale-105 transition-transform">
                      {route.route_number}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm group-hover:text-emerald-800">
                    {route.bus_name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {route.start_point} ↔ {route.end_point}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>View stops ({route.all_stops.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No active direct route recorded in current registry for this stop.
          </div>
        )}
      </div>

      {/* EVERYTHING NEARBY DASHBOARD (Specification #8, #11, #17) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Everything Around {stop.stop_name}
          </h2>
          <p className="text-xs text-slate-500">
            Emergency hotlines, CMCH hospitals, police stations, Mezban dining, and hotels near {stop.stop_name}.
          </p>
        </div>

        <NearbyPlacesDashboard
          referenceName={stop.stop_name}
          referenceLat={stop.latitude}
          referenceLng={stop.longitude}
          allPlaces={allPlaces}
          lang={lang}
        />
      </div>

      {/* Stop Report Footer */}
      <div className="text-right">
        <button
          onClick={() => onOpenReportModal(stop.stop_id, stop.stop_name, 'stop')}
          className="text-xs text-slate-400 hover:text-red-600 underline font-medium"
        >
          Report incorrect info about {stop.stop_name}
        </button>
      </div>

    </div>
  );
};
