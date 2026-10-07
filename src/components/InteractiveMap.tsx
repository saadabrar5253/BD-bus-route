import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusRoute, BusStop, Place } from '../types';

interface InteractiveMapProps {
  routes?: BusRoute[];
  selectedRoute?: BusRoute | null;
  stops?: BusStop[];
  selectedStop?: BusStop | null;
  places?: Place[];
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
  activeLayers?: {
    routes: boolean;
    stops: boolean;
    hospitals: boolean;
    police: boolean;
    fire: boolean;
    restaurants: boolean;
    hotels: boolean;
    tourist: boolean;
    banks: boolean;
  };
  onSelectStop?: (stop: BusStop) => void;
  onSelectPlace?: (place: Place) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedRoute,
  stops = [],
  selectedStop,
  places = [],
  userLocation,
  center = [22.3569, 91.8282], // Default Chattogram center
  zoom = 13,
  activeLayers = {
    routes: true,
    stops: true,
    hospitals: true,
    police: true,
    fire: true,
    restaurants: true,
    hotels: true,
    tourist: true,
    banks: true,
  },
  onSelectStop,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // OpenStreetMap Tiles (Fast, high-contrast, free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map contents when selections or layers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render User Location if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #006a4e; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(`
          <div style="padding: 4px; font-family: system-ui;">
            <strong style="color: #006a4e; font-size: 13px;">📍 You Are Here</strong>
            <div style="font-size: 11px; color: #64748b;">GPS Location Verified</div>
          </div>
        `);
      layerGroup.addLayer(userMarker);
    }

    // 2. Render Selected Bus Route Polyline & Sequence
    if (selectedRoute && activeLayers.routes) {
      const polyline = L.polyline(selectedRoute.route_geometry, {
        color: '#006a4e',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layerGroup.addLayer(polyline);

      // Add Stop Markers along selected route
      selectedRoute.all_stops.forEach((stop, index) => {
        const isStart = index === 0;
        const isEnd = index === selectedRoute.all_stops.length - 1;

        let badgeBg = '#2563eb'; // intermediate blue
        let badgeText = `${index + 1}`;
        let badgeIcon = '🔵';

        if (isStart) {
          badgeBg = '#16a34a'; // green
          badgeIcon = '🟢';
          badgeText = 'Start';
        } else if (isEnd) {
          badgeBg = '#dc2626'; // red
          badgeIcon = '🔴';
          badgeText = 'End';
        }

        const stopIcon = L.divIcon({
          className: 'route-stop-marker',
          html: `
            <div style="
              display: flex; align-items: center; justify-content: center;
              background-color: ${badgeBg}; color: white;
              font-weight: 700; font-size: 11px;
              width: ${isStart || isEnd ? '26px' : '20px'};
              height: ${isStart || isEnd ? '26px' : '20px'};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              ${isStart ? 'A' : isEnd ? 'B' : index + 1}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`
            <div style="min-width: 170px; font-family: system-ui; padding: 2px;">
              <div style="font-size: 11px; font-weight: 600; color: ${badgeBg}; text-transform: uppercase;">${badgeIcon} Stop #${index + 1} ${isStart ? '(Starting Point)' : isEnd ? '(Final Destination)' : ''}</div>
              <strong style="font-size: 14px; color: #0f172a; display: block; margin-top: 2px;">${stop.name}</strong>
              ${stop.name_bn ? `<span style="font-size: 12px; color: #475569;">${stop.name_bn}</span>` : ''}
              <div style="margin-top: 6px; font-size: 11px; color: #334155;">Bus: <strong>${selectedRoute.bus_name}</strong></div>
              <div style="margin-top: 8px;">
                <a href="https://maps.google.com/?q=${stop.lat},${stop.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 11px; font-weight: 600; color: #006a4e; text-decoration: none; border: 1px solid #006a4e; padding: 3px 8px; border-radius: 4px;">
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          `);
        layerGroup.addLayer(marker);
      });

      // Fit bounds to polyline
      try {
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      } catch (e) {
        // ignore bounds fit error
      }
    }

    // 3. Render Bus Stops (if layer enabled and no route dominates)
    if (activeLayers.stops && (!selectedRoute || stops.length < 30)) {
      stops.forEach((stop) => {
        // Skip if already rendered in selected route
        if (selectedRoute && selectedRoute.all_stops.some(s => s.stop_id === stop.stop_id)) return;

        const isHighlighted = selectedStop?.stop_id === stop.stop_id;
        const stopDiv = L.divIcon({
          className: 'bus-stop-icon',
          html: `
            <div style="
              width: ${isHighlighted ? '24px' : '18px'};
              height: ${isHighlighted ? '24px' : '18px'};
              background: ${isHighlighted ? '#006a4e' : '#334155'};
              color: white; border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.25);
              display: flex; align-items: center; justify-content: center;
              font-size: 9px;
            ">🚏</div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: stopDiv })
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 180px; padding: 2px;">
              <span style="font-size: 10px; font-weight: 700; color: #006a4e; text-transform: uppercase;">🚏 Bus Stop</span>
              <strong style="font-size: 14px; display: block; color: #0f172a; margin-top: 2px;">${stop.stop_name}</strong>
              <div style="font-size: 12px; color: #475569;">${stop.stop_name_bn}</div>
              <div style="margin-top: 6px; font-size: 11px; color: #334155;">
                Served buses: <strong>${stop.served_routes.join(', ') || 'Various'}</strong>
              </div>
              <div style="margin-top: 8px; display: flex; gap: 6px;">
                <a href="https://maps.google.com/?q=${stop.latitude},${stop.longitude}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 600; color: #006a4e; text-decoration: none; border: 1px solid #006a4e; padding: 3px 8px; border-radius: 4px;">
                  Google Maps ↗
                </a>
              </div>
            </div>
          `);

        stopMarker.on('click', () => {
          if (onSelectStop) onSelectStop(stop);
        });

        layerGroup.addLayer(stopMarker);
      });
    }

    // 4. Render Places (Hospitals, Police, Fire, Restaurants, etc.)
    places.forEach((place) => {
      let iconEmoji = '📍';
      let iconColor = '#475569';
      let shouldShow = false;

      if (place.category === 'hospital' && activeLayers.hospitals) {
        iconEmoji = '🏥';
        iconColor = '#dc2626';
        shouldShow = true;
      } else if (place.category === 'police' && activeLayers.police) {
        iconEmoji = '🚓';
        iconColor = '#1e3a8a';
        shouldShow = true;
      } else if (place.category === 'fire' && activeLayers.fire) {
        iconEmoji = '🚒';
        iconColor = '#ea580c';
        shouldShow = true;
      } else if (place.category === 'restaurant' && activeLayers.restaurants) {
        iconEmoji = '🍽';
        iconColor = '#d97706';
        shouldShow = true;
      } else if (place.category === 'hotel' && activeLayers.hotels) {
        iconEmoji = '🏨';
        iconColor = '#7c3aed';
        shouldShow = true;
      } else if (place.category === 'tourist' && activeLayers.tourist) {
        iconEmoji = '🏞';
        iconColor = '#059669';
        shouldShow = true;
      } else if (place.category === 'bank' && activeLayers.banks) {
        iconEmoji = '🏦';
        iconColor = '#0891b2';
        shouldShow = true;
      }

      if (!shouldShow) return;

      const placeIcon = L.divIcon({
        className: 'place-marker-icon',
        html: `
          <div style="
            width: 26px; height: 26px;
            background: white;
            border-radius: 50%;
            border: 2px solid ${iconColor};
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            font-size: 13px;
          ">${iconEmoji}</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const placeMarker = L.marker([place.latitude, place.longitude], { icon: placeIcon })
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 190px; padding: 2px;">
            <div style="font-size: 10px; font-weight: 700; color: ${iconColor}; text-transform: uppercase;">
              ${iconEmoji} ${place.subcategory}
            </div>
            <strong style="font-size: 13px; display: block; color: #0f172a; margin-top: 2px;">${place.name}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${place.address}</div>
            ${place.phone ? `
              <div style="margin-top: 4px; font-size: 12px; font-weight: 600; color: #006a4e;">
                📞 <a href="tel:${place.phone}" style="color: inherit; text-decoration: underline;">${place.phone}</a>
              </div>
            ` : ''}
            <div style="margin-top: 8px;">
              <a href="${place.google_maps_url || `https://maps.google.com/?q=${place.latitude},${place.longitude}`}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 600; color: #006a4e; text-decoration: none; border: 1px solid #006a4e; padding: 3px 8px; border-radius: 4px; display: inline-block;">
                Google Maps Navigation ↗
              </a>
            </div>
          </div>
        `);

      placeMarker.on('click', () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      layerGroup.addLayer(placeMarker);
    });

  }, [selectedRoute, stops, selectedStop, places, userLocation, activeLayers]);

  // Center on selected stop if updated
  useEffect(() => {
    if (selectedStop && mapInstanceRef.current && !selectedRoute) {
      mapInstanceRef.current.setView([selectedStop.latitude, selectedStop.longitude], 15, { animate: true });
    }
  }, [selectedStop, selectedRoute]);

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-0" />
      
      {/* Quick Map Legend indicator */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm flex items-center gap-2">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Start</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Stop</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Destination</span>
      </div>
    </div>
  );
};
