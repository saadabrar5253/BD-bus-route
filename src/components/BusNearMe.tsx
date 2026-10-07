import React, { useState, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Bus, 
  ArrowRight, 
  ExternalLink, 
  Footprints, 
  ShieldCheck, 
  Filter, 
  AlertCircle 
} from 'lucide-react';
import { BusRoute, BusStop } from '../types';
import { calculateDistanceKm, findStopsNearLocation, formatDistance } from '../utils/searchEngine';

interface BusNearMeProps {
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  isLocating: boolean;
  locationError: string | null;
  allStops: BusStop[];
  allRoutes: BusRoute[];
  onSelectStopPage: (stop: BusStop) => void;
  onSelectRoute: (route: BusRoute) => void;
  onSetManualLocation: (lat: number, lng: number, name: string) => void;
  lang: 'en' | 'bn';
}

export const BusNearMe: React.FC<BusNearMeProps> = ({
  userLocation,
  onRequestLocation,
  isLocating,
  locationError,
  allStops,
  allRoutes,
  onSelectStopPage,
  onSelectRoute,
  onSetManualLocation,
  lang,
}) => {
  const [radiusKm, setRadiusKm] = useState<number>(2); // default 2km

  const nearbyStopsWithDistance = useMemo(() => {
    if (!userLocation) return [];
    return findStopsNearLocation(userLocation.lat, userLocation.lng, allStops, radiusKm);
  }, [userLocation, allStops, radiusKm]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Location Permission & Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>GPS Proximity Transit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'en' ? 'Buses Near Me' : 'আমার কাছের বাস ও স্টপ'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find nearest verified bus stops, buses serving them, and walking distances.
            </p>
          </div>

          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto active:scale-98"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : userLocation ? 'Refresh My Location' : 'Use My Current Location'}</span>
          </button>
        </div>

        {/* Privacy Note (Specification #34) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700">Privacy Guarantee: </strong>
            We only read your device GPS to calculate walking distance to nearby bus stops. We never save, track, or share your coordinates.
          </div>
        </div>

        {/* Location Error Warning if denied */}
        {locationError && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Location Access Notice:</strong> {locationError}
              <div className="mt-1">You can also select a common hub below:</div>
            </div>
          </div>
        )}

        {/* Manual Hub Switchers if GPS not active or fallback needed */}
        {!userLocation && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              Or explore around major transit nodes:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'GEC Circle', lat: 22.3592, lng: 91.8219 },
                { name: 'Chawkbazar', lat: 22.3567, lng: 91.8385 },
                { name: 'Agrabad', lat: 22.3245, lng: 91.8118 },
                { name: 'Bahaddarhat', lat: 22.3734, lng: 91.8492 },
                { name: 'New Market', lat: 22.3361, lng: 91.8329 },
                { name: 'Patenga Beach', lat: 22.2355, lng: 91.7925 },
              ].map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => onSetManualLocation(hub.lat, hub.lng, hub.name)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-xs font-semibold transition-colors"
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FILTER & RESULTS */}
      {userLocation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Nearest Bus Stops ({nearbyStopsWithDistance.length} Found)
              </h2>
              <span className="text-xs text-slate-500">Sorted nearest first</span>
            </div>

            {/* Radius Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400">Radius:</span>
              {[0.5, 1, 2, 5].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setRadiusKm(dist)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    radiusKm === dist
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dist < 1 ? '500 m' : `${dist} km`}
                </button>
              ))}
            </div>
          </div>

          {nearbyStopsWithDistance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyStopsWithDistance.map(({ stop, distanceKm }) => {
                const walkingMinutes = Math.round((distanceKm / 4.5) * 60); // average walking speed 4.5 km/h
                const servedRoutesList = allRoutes.filter(r =>
                  r.all_stops.some(s => s.stop_id === stop.stop_id || s.name.toLowerCase().includes(stop.stop_name.toLowerCase()))
                );

                return (
                  <div
                    key={stop.stop_id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Distance & Walking Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5" />
                          <span>{formatDistance(distanceKm)} (~{walkingMinutes} min walk)</span>
                        </span>

                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {stop.thana}
                        </span>
                      </div>

                      {/* Stop Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {stop.stop_name}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {stop.stop_name_bn}
                      </div>

                      {/* Buses Serving This Stop */}
                      <div className="mt-4">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Buses Passing Here:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {servedRoutesList.map((r) => (
                            <button
                              key={r.bus_id}
                              onClick={() => onSelectRoute(r)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                              title={`View Route ${r.route_number}`}
                            >
                              <Bus className="w-3 h-3" />
                              <span>Bus #{r.route_number}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectStopPage(stop)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                      >
                        Stop Page & Places
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${stop.latitude},${stop.longitude}&travelmode=walking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Walk Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                No verified bus stops found within {radiusKm < 1 ? `${Math.round(radiusKm * 1000)}m` : `${radiusKm}km`} of your position.
              </p>
              <p className="text-xs text-slate-400">
                Try selecting a larger radius of 5 km above, or click one of the major city transit hubs.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
