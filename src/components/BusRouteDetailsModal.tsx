import React, { useState } from 'react';
import { 
  X, 
  Bus, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Flag,
  Share2
} from 'lucide-react';
import { BusRoute, Place } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { NearbyPlacesDashboard } from './NearbyPlacesDashboard';

interface BusRouteDetailsModalProps {
  route: BusRoute | null;
  onClose: () => void;
  onOpenReportModal: (targetId: string, targetName: string, targetType: 'bus' | 'stop') => void;
  allPlaces: Place[];
  lang: 'en' | 'bn';
}

export const BusRouteDetailsModal: React.FC<BusRouteDetailsModalProps> = ({
  route,
  onClose,
  onOpenReportModal,
  allPlaces,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'route' | 'nearby'>('route');

  if (!route) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${route.bus_name} - Bangladesh Bus Route`,
        text: `Check route details for ${route.bus_name}: ${route.start_point} to ${route.end_point}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Modal Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-md">
              {route.route_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {route.bus_name}
                </h2>
                {route.verification_status === 'Verified' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Needs Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {route.start_point} ↔ {route.end_point}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Share Route"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subtabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('route')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'route'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🗺️ Full Route & Stops
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'nearby'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏥 Everything Along This Route
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'route' ? (
            <>
              {/* Route Specification Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Operator</span>
                  <strong className="text-slate-800 font-bold">{route.operator}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Direction</span>
                  <strong className="text-slate-800 font-bold">{route.direction}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Classification</span>
                  <strong className="text-slate-800 font-bold capitalize">{route.classification} Transit</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Service Status</span>
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    {route.service_status}
                  </span>
                </div>
              </div>

              {/* Interactive Route Map */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Interactive Route Map (Leaflet)
                </h4>
                <div className="h-72 w-full rounded-2xl overflow-hidden shadow-inner">
                  <InteractiveMap
                    selectedRoute={route}
                    center={route.route_geometry[0] || [22.3592, 91.8219]}
                    zoom={12}
                  />
                </div>
              </div>

              {/* SPECIFICATION #2 & #4: STRUCTURED STOP-BY-STOP ROUTE DISPLAY */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Complete Stop Sequence ({route.all_stops.length} Stops)</span>
                  </h4>
                  <span className="text-xs text-slate-400">Click any stop for Google Maps</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  {route.all_stops.map((stop, index) => {
                    const isStart = index === 0;
                    const isEnd = index === route.all_stops.length - 1;

                    return (
                      <div key={stop.stop_id + index} className="relative flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                            isStart 
                              ? 'bg-emerald-600 ring-2 ring-emerald-200' 
                              : isEnd 
                              ? 'bg-red-600 ring-2 ring-red-200' 
                              : 'bg-blue-600'
                          }`}>
                            {isStart ? '🟢' : isEnd ? '🔴' : index + 1}
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {stop.name}
                              {isStart && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-extrabold uppercase">Starting Point</span>}
                              {isEnd && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-sm bg-red-100 text-red-800 font-extrabold uppercase">Destination</span>}
                            </div>
                            {stop.name_bn && (
                              <div className="text-slate-500 text-[11px]">{stop.name_bn}</div>
                            )}
                          </div>
                        </div>

                        <a
                          href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Nav</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Verification & Source Card (Specification #23) */}
              <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Source: {route.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Verified: {route.last_verified}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenReportModal(route.bus_id, route.bus_name, 'bus')}
                  className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Incorrect Route</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Displaying hospitals, emergency stations, restaurants and attractions near the start and key junctions of this route.
              </p>
              <NearbyPlacesDashboard
                referenceName={route.start_point}
                referenceLat={route.all_stops[0].lat}
                referenceLng={route.all_stops[0].lng}
                allPlaces={allPlaces}
                lang={lang}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
