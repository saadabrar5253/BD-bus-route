import React, { useState } from 'react';
import { 
  Bus, 
  ArrowRight, 
  MapPin, 
  ExternalLink, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CornerDownRight, 
  Map, 
  Info,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { BusRoute, BusStop, DirectJourneyOption, Place, TransferJourneyOption } from '../types';
import { formatDistance } from '../utils/searchEngine';
import { InteractiveMap } from './InteractiveMap';
import { NearbyPlacesDashboard } from './NearbyPlacesDashboard';

interface RouteSearchResultsProps {
  fromStop: BusStop;
  toStop: BusStop;
  directOptions: DirectJourneyOption[];
  transferOptions: TransferJourneyOption[];
  allPlaces: Place[];
  onSelectRouteModal: (route: BusRoute) => void;
  onOpenReportModal: (targetId: string, targetName: string, targetType: 'bus' | 'stop') => void;
  onSelectStopPage: (stop: BusStop) => void;
  lang: 'en' | 'bn';
}

export const RouteSearchResults: React.FC<RouteSearchResultsProps> = ({
  fromStop,
  toStop,
  directOptions,
  transferOptions,
  allPlaces,
  onSelectRouteModal,
  onOpenReportModal,
  onSelectStopPage,
  lang,
}) => {
  const [selectedRouteForMap, setSelectedRouteForMap] = useState<BusRoute | null>(
    directOptions.length > 0 ? directOptions[0].bus : (transferOptions.length > 0 ? transferOptions[0].firstBus : null)
  );
  const [showFullMap, setShowFullMap] = useState(false);
  const [expandedDirectIdx, setExpandedDirectIdx] = useState<number | null>(0);
  const [expandedTransferIdx, setExpandedTransferIdx] = useState<number | null>(null);

  const googleMapsTransitUrl = `https://www.google.com/maps/dir/?api=1&origin=${fromStop.latitude},${fromStop.longitude}&destination=${toStop.latitude},${toStop.longitude}&travelmode=transit`;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
              <span>{lang === 'en' ? 'Journey Results' : 'যাত্রার ফলাফল'}</span>
              <span>•</span>
              <span className="text-slate-500">{directOptions.length} Direct, {transferOptions.length} Transfer</span>
            </div>
            <div className="flex items-center gap-2 text-lg sm:text-2xl font-black text-slate-900">
              <span className="text-emerald-700">{fromStop.stop_name}</span>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-red-600">{toStop.stop_name}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {fromStop.thana} → {toStop.thana} • Chittagong Transit Network
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullMap(!showFullMap)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Map className="w-4 h-4 text-emerald-700" />
              <span>{showFullMap ? 'Hide Route Map' : 'View Route Map'}</span>
            </button>

            <a
              href={googleMapsTransitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* Embedded Interactive Map when toggled or selected */}
        {showFullMap && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Route Preview: {selectedRouteForMap?.bus_name || 'Select a bus below'}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                🟢 {fromStop.stop_name} ➔ 🔴 {toStop.stop_name}
              </span>
            </div>
            <div className="h-72 sm:h-96 w-full">
              <InteractiveMap
                selectedRoute={selectedRouteForMap}
                stops={[fromStop, toStop]}
                center={[fromStop.latitude, fromStop.longitude]}
                zoom={13}
              />
            </div>
          </div>
        )}
      </div>

      {/* CORE ROUTING OPTIONS */}
      <div className="space-y-6">

        {/* OPTION 1: DIRECT BUSES */}
        {directOptions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>{lang === 'en' ? 'Direct Buses (No Transfer Needed)' : 'সরাসরি বাস (বদলানো লাগবে না)'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {directOptions.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400">Best & Fastest</span>
            </div>

            <div className="grid gap-4">
              {directOptions.map((opt, idx) => {
                const isExpanded = expandedDirectIdx === idx;
                const bus = opt.bus;

                return (
                  <div 
                    key={bus.bus_id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Top Bus Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        <div className="flex items-start sm:items-center gap-3">
                          {/* Route Number Badge */}
                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl shadow-md shadow-emerald-700/20 shrink-0">
                            {bus.route_number}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-black text-slate-900">
                                {bus.bus_name}
                              </h3>
                              {bus.verification_status === 'Verified' ? (
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
                              Operator: {bus.operator} • {bus.operating_area}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setSelectedRouteForMap(bus);
                              setShowFullMap(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                          >
                            <Map className="w-3.5 h-3.5 text-emerald-700" />
                            Map
                          </button>

                          <button
                            onClick={() => onSelectRouteModal(bus)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            Route Details
                          </button>
                        </div>
                      </div>

                      {/* CLEAR BOARDING & ALIGHTING INSTRUCTIONS (Specification #3 & #9) */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                          <div>
                            <span className="font-bold text-emerald-900">Get on here (Boarding): </span>
                            <span className="font-semibold text-slate-800">{opt.fromStop.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                          <div>
                            <span className="font-bold text-red-900">Get off here (Alight): </span>
                            <span className="font-semibold text-slate-800">{opt.toStop.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Stops Chain */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{opt.intermediateStops.length} stops on this direct route</span>
                        <button
                          onClick={() => setExpandedDirectIdx(isExpanded ? null : idx)}
                          className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <><span>Hide Stops</span><ChevronUp className="w-4 h-4" /></>
                          ) : (
                            <><span>Show Stops</span><ChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Stop-by-Stop Route:
                          </div>
                          <div className="relative pl-6 space-y-2 text-xs font-medium text-slate-700 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {opt.intermediateStops.map((stop, sIdx) => {
                              const isFirst = sIdx === 0;
                              const isLast = sIdx === opt.intermediateStops.length - 1;
                              return (
                                <div key={stop.stop_id + sIdx} className="relative flex items-center gap-2">
                                  <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 border-white ${
                                    isFirst ? 'bg-emerald-600 ring-2 ring-emerald-200' : isLast ? 'bg-red-600 ring-2 ring-red-200' : 'bg-blue-500'
                                  }`} />
                                  <span className={`font-semibold ${isFirst ? 'text-emerald-800 font-bold' : isLast ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                                    {stop.name}
                                  </span>
                                  {isFirst && <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800">Board Here</span>}
                                  {isLast && <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-red-100 text-red-800">Get Off</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Source & Verified status footer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>Source: {bus.source}</span>
                        <button
                          onClick={() => onOpenReportModal(bus.bus_id, bus.bus_name, 'bus')}
                          className="text-slate-500 hover:text-slate-800 underline"
                        >
                          Report Incorrect Route
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-200 text-amber-900 text-xs sm:text-sm">
            <strong>No direct bus route found between {fromStop.stop_name} and {toStop.stop_name}.</strong>
            <p className="mt-1 text-amber-800">
              Please check the alternative 1-transfer buses below or Google Maps transit options.
            </p>
          </div>
        )}

        {/* OPTION 2: ALTERNATIVE BUSES WITH TRANSFER POINT (Specification #3) */}
        {transferOptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>{lang === 'en' ? 'Alternative Buses (1 Transfer Required)' : 'বিকল্প বাস (১টি বদল প্রয়োজন)'}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  {transferOptions.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400">Via Transfer Point</span>
            </div>

            <div className="grid gap-4">
              {transferOptions.map((tOpt, tIdx) => {
                const isExpanded = expandedTransferIdx === tIdx;

                return (
                  <div
                    key={tIdx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Transfer at: {tOpt.transferPointName}</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            Bus #{tOpt.firstBus.route_number} ({tOpt.firstBus.bus_name})
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-xs">
                            Bus #{tOpt.secondBus.route_number} ({tOpt.secondBus.bus_name})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRouteForMap(tOpt.firstBus);
                            setShowFullMap(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                        >
                          <Map className="w-3.5 h-3.5 text-blue-700" />
                          Map
                        </button>
                      </div>
                    </div>

                    {/* Step by Step Journey Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
                      
                      {/* Step 1: First Bus */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          1
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            Board <span className="text-emerald-800">{tOpt.firstBus.bus_name}</span> at <span className="underline">{tOpt.firstFromStop.name}</span>
                          </div>
                          <div className="text-slate-500">Travel to transfer point: {tOpt.transferPointName}</div>
                        </div>
                      </div>

                      {/* Step 2: Transfer Point */}
                      <div className="flex items-start gap-2.5 pl-0.5">
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                          ⇄
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 w-full">
                          <strong className="block">Transfer at {tOpt.transferPointName}</strong>
                          <span>Get off Bus #{tOpt.firstBus.route_number} and board Bus #{tOpt.secondBus.route_number} at the same junction.</span>
                        </div>
                      </div>

                      {/* Step 3: Second Bus */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          2
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            Board <span className="text-blue-800">{tOpt.secondBus.bus_name}</span> at <span className="underline">{tOpt.transferPointName}</span>
                          </div>
                          <div className="text-slate-500">Alight at final destination: <strong className="text-red-700">{tOpt.secondToStop.name}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* SPECIFICATION #36: STEP 5 — "EVERYTHING NEAR THIS ROUTE & DESTINATION" */}
      <div className="pt-6 border-t border-slate-200">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {lang === 'en' ? 'Destination & Local Facilities' : 'গন্তব্য ও চারপাশের সেবা'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Around {toStop.stop_name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Hospitals, Emergency Police/Fire, Mezbani restaurants, hotels, tourist attractions and ATMs near {toStop.stop_name}.
          </p>
        </div>

        {/* Embedded Nearby Places Dashboard */}
        <NearbyPlacesDashboard
          referenceName={toStop.stop_name}
          referenceLat={toStop.latitude}
          referenceLng={toStop.longitude}
          allPlaces={allPlaces}
          lang={lang}
        />
      </div>

    </div>
  );
};
