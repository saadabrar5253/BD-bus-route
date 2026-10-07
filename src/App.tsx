/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { HomeSearch } from './components/HomeSearch';
import { RouteSearchResults } from './components/RouteSearchResults';
import { BusRouteDetailsModal } from './components/BusRouteDetailsModal';
import { BusStopView } from './components/BusStopView';
import { BusNearMe } from './components/BusNearMe';
import { BusDirectory } from './components/BusDirectory';
import { EmergencySection } from './components/EmergencySection';
import { NearbyPlacesDashboard } from './components/NearbyPlacesDashboard';
import { BankAtmSection } from './components/BankAtmSection';
import { HospitalSection } from './components/HospitalSection';
import { RestaurantSection } from './components/RestaurantSection';
import { ResidentialHotelSection } from './components/ResidentialHotelSection';
import { TouristSpotSection } from './components/TouristSpotSection';
import { ReportModal } from './components/ReportModal';
import { AdminPanel } from './components/AdminPanel';
import { HowToPublishModal } from './components/HowToPublishModal';

import { INITIAL_BUS_ROUTES } from './data/busRoutes';
import { INITIAL_BUS_STOPS } from './data/busStops';
import { INITIAL_PLACES } from './data/places';
import { BusRoute, BusStop, DirectJourneyOption, Place, TransferJourneyOption, UserReport } from './types';
import { searchBusRoutes, matchStopByQuery, parseSearchIntent, findNearestStop } from './utils/searchEngine';

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('search');

  // Core Data States (with persistent localStorage overrides if customized)
  const [routes, setRoutes] = useState<BusRoute[]>(() => {
    const saved = localStorage.getItem('bd_bus_routes_v1');
    return saved ? JSON.parse(saved) : INITIAL_BUS_ROUTES;
  });

  const [stops, setStops] = useState<BusStop[]>(() => {
    const saved = localStorage.getItem('bd_bus_stops_v1');
    return saved ? JSON.parse(saved) : INITIAL_BUS_STOPS;
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('bd_places_v1');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [reports, setReports] = useState<UserReport[]>(() => {
    const saved = localStorage.getItem('bd_reports_v1');
    return saved ? JSON.parse(saved) : [
      {
        id: 'sample-report-1',
        report_type: 'wrong_stop',
        target_id: 'stop-gec',
        target_name: 'GEC Circle',
        target_type: 'stop',
        details: 'Added local tempo stop next to Sanmar Ocean City.',
        reporter_name: 'Imran Hossain',
        created_at: '2026-09-20',
        status: 'Pending Review'
      }
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('bd_bus_routes_v1', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('bd_reports_v1', JSON.stringify(reports));
  }, [reports]);

  // Search Results State
  const [searchFromStop, setSearchFromStop] = useState<BusStop | null>(null);
  const [searchToStop, setSearchToStop] = useState<BusStop | null>(null);
  const [directOptions, setDirectOptions] = useState<DirectJourneyOption[]>([]);
  const [transferOptions, setTransferOptions] = useState<TransferJourneyOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected Stop View State
  const [selectedStopForView, setSelectedStopForView] = useState<BusStop | null>(stops[0]);

  // Selected Bus Route Modal State
  const [modalRoute, setModalRoute] = useState<BusRoute | null>(null);

  // Report Modal State
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetId: string;
    targetName: string;
    targetType: 'bus' | 'stop' | 'place';
  }>({
    isOpen: false,
    targetId: '',
    targetName: '',
    targetType: 'bus'
  });

  // How to publish modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Geolocation state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request browser location
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);

        // Find nearest stop to coordinates
        const nearest = findNearestStop(coords.lat, coords.lng, stops);
        if (nearest) {
          setUserLocationName(nearest.stop.stop_name);
        } else {
          setUserLocationName('Current Location');
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. You can select a known transit hub instead.');
        } else {
          setLocationError('Unable to retrieve location accurately. Please search manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Perform "Which Bus Goes There?" Search
  const handleSearchFromTo = (fromText: string, toText: string) => {
    const results = searchBusRoutes(fromText, toText, routes, stops, userCoords || undefined);
    
    setSearchFromStop(results.fromStop);
    setSearchToStop(results.toStop);
    setDirectOptions(results.directOptions);
    setTransferOptions(results.transferOptions);
    setHasSearched(true);
    setActiveTab('search');

    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Handle Smart Omnibox Search
  const handleOmniSearch = (query: string) => {
    const parsed = parseSearchIntent(query);

    if (parsed.type === 'from_to' && parsed.from && parsed.to) {
      handleSearchFromTo(parsed.from, parsed.to);
      return;
    }

    if (parsed.type === 'bus_number' && parsed.busNumber) {
      const num = parsed.busNumber.toLowerCase();
      const matchedRoute = routes.find(r => r.route_number.toLowerCase() === num || r.bus_id.toLowerCase().includes(num));
      if (matchedRoute) {
        setModalRoute(matchedRoute);
      } else {
        setActiveTab('routes');
      }
      return;
    }

    const qLower = query.toLowerCase();

    if (qLower.includes('bank') || qLower.includes('atm') || query.includes('ব্যাংক') || query.includes('টাকা') || query.includes('বুথ')) {
      setActiveTab('banks');
      return;
    }

    if (qLower.includes('hospital') || qLower.includes('doctor') || query.includes('হাসপাতাল') || query.includes('ডাক্তার') || query.includes('চিকিৎসা')) {
      setActiveTab('hospitals');
      return;
    }

    if (qLower.includes('restaurant') || qLower.includes('food') || qLower.includes('mezban') || query.includes('খাবার') || query.includes('রেস্টুরেন্ট') || query.includes('মেজবানি')) {
      setActiveTab('restaurants');
      return;
    }

    if (qLower.includes('hotel') || qLower.includes('residential') || query.includes('আবাসিক') || query.includes('হোটেল') || query.includes('থাকার')) {
      setActiveTab('residential-hotels');
      return;
    }

    if (qLower.includes('tourist') || qLower.includes('beach') || qLower.includes('lake') || query.includes('দর্শনীয়') || query.includes('পর্যটন') || query.includes('সৈকত')) {
      setActiveTab('tourist-spots');
      return;
    }

    // Try matching single stop
    const matchedStop = matchStopByQuery(query, stops);
    if (matchedStop) {
      setSelectedStopForView(matchedStop);
      setActiveTab('stop');
      return;
    }

    // Default to routes tab
    setActiveTab('routes');
  };

  // Quick category actions
  const handleQuickCategory = (cat: string) => {
    if (cat === 'routes') {
      setActiveTab('routes');
    } else if (cat === 'near-me') {
      if (!userCoords) handleRequestLocation();
      setActiveTab('near-me');
    } else if (cat === 'emergency') {
      setActiveTab('emergency');
    } else if (cat === 'hospital') {
      setActiveTab('hospitals');
    } else if (cat === 'restaurant') {
      setActiveTab('restaurants');
    } else if (cat === 'residential-hotels' || cat === 'hotel') {
      setActiveTab('residential-hotels');
    } else if (cat === 'tourist') {
      setActiveTab('tourist-spots');
    } else if (cat === 'banks') {
      setActiveTab('banks');
    } else {
      setActiveTab('search');
    }
  };

  // Open report modal helper
  const handleOpenReportModal = (targetId: string, targetName: string, targetType: 'bus' | 'stop' | 'place') => {
    setReportModalData({
      isOpen: true,
      targetId,
      targetName,
      targetType
    });
  };

  const handleAddReport = (reportData: Omit<UserReport, 'id' | 'created_at' | 'status'>) => {
    const newReport: UserReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      status: 'Pending Review'
    };
    setReports(prev => [newReport, ...prev]);
  };

  // Admin route actions
  const handleAdminAddRoute = (newRoute: BusRoute) => {
    setRoutes(prev => [newRoute, ...prev]);
  };

  const handleAdminUpdateRouteStatus = (routeId: string, status: 'Verified' | 'Needs Verification') => {
    setRoutes(prev => prev.map(r => r.bus_id === routeId ? { ...r, verification_status: status } : r));
  };

  const handleAdminToggleRouteActive = (routeId: string) => {
    setRoutes(prev => prev.map(r => r.bus_id === routeId ? { ...r, service_status: r.service_status === 'Active' ? 'Suspended' : 'Active' } : r));
  };

  const handleAdminResolveReport = (reportId: string, resolution: 'Verified & Fixed' | 'Dismissed') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: resolution } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12 flex flex-col font-sans">
      
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPublishGuide={() => setIsPublishModalOpen(true)}
        onOpenEmergency={() => setActiveTab('emergency')}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* TAB 1: SEARCH / HOME PAGE (Main Flow) */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            <HomeSearch
              allStops={stops}
              onSearch={handleSearchFromTo}
              onQuickCategory={handleQuickCategory}
              onSelectStopPage={(stop) => {
                setSelectedStopForView(stop);
                setActiveTab('stop');
              }}
              onOmniSearch={handleOmniSearch}
              onRequestUserLocation={handleRequestLocation}
              userLocationName={userLocationName}
              isLocating={isLocating}
              lang={lang}
            />

            {/* ROUTE SEARCH RESULTS */}
            {hasSearched && searchFromStop && searchToStop && (
              <RouteSearchResults
                fromStop={searchFromStop}
                toStop={searchToStop}
                directOptions={directOptions}
                transferOptions={transferOptions}
                allPlaces={places}
                onSelectRouteModal={(route) => setModalRoute(route)}
                onOpenReportModal={handleOpenReportModal}
                onSelectStopPage={(stop) => {
                  setSelectedStopForView(stop);
                  setActiveTab('stop');
                }}
                lang={lang}
              />
            )}

            {/* Initial Highlights if search has not occurred yet */}
            {!hasSearched && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Top Transit Hub: GEC Circle
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Explore emergency, hospitals, Mezbani dining, and tourist spots around Chattogram's central node.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStopForView(stops[0]);
                      setActiveTab('stop');
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    View Stop Page ➔
                  </button>
                </div>

                <NearbyPlacesDashboard
                  referenceName="GEC Circle"
                  referenceLat={22.3592}
                  referenceLng={91.8219}
                  allPlaces={places}
                  lang={lang}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL BUS ROUTES DIRECTORY */}
        {activeTab === 'routes' && (
          <BusDirectory
            allRoutes={routes}
            onSelectRoute={(route) => setModalRoute(route)}
            lang={lang}
          />
        )}

        {/* TAB 3: BUS NEAR ME */}
        {activeTab === 'near-me' && (
          <BusNearMe
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            isLocating={isLocating}
            locationError={locationError}
            allStops={stops}
            allRoutes={routes}
            onSelectStopPage={(stop) => {
              setSelectedStopForView(stop);
              setActiveTab('stop');
            }}
            onSelectRoute={(route) => setModalRoute(route)}
            onSetManualLocation={(lat, lng, name) => {
              setUserCoords({ lat, lng });
              setUserLocationName(name);
            }}
            lang={lang}
          />
        )}

        {/* TAB 4: BUS STOP PAGE */}
        {activeTab === 'stop' && selectedStopForView && (
          <BusStopView
            stop={selectedStopForView}
            allRoutes={routes}
            allStops={stops}
            allPlaces={places}
            onSelectRoute={(route) => setModalRoute(route)}
            onSetAsFrom={(stopName) => {
              setActiveTab('search');
              handleSearchFromTo(stopName, 'Patenga Sea Beach');
            }}
            onSetAsTo={(stopName) => {
              setActiveTab('search');
              handleSearchFromTo('GEC Circle', stopName);
            }}
            onOpenReportModal={handleOpenReportModal}
            lang={lang}
          />
        )}

        {/* TAB 5: EMERGENCY HOTLINES & CENTERS */}
        {activeTab === 'emergency' && (
          <EmergencySection
            emergencyPlaces={places}
            userLocation={userCoords}
            lang={lang}
          />
        )}

        {/* TAB 6: HOSPITALS */}
        {activeTab === 'hospitals' && (
          <HospitalSection
            places={places}
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            lang={lang}
          />
        )}

        {/* TAB 7: RESTAURANTS */}
        {activeTab === 'restaurants' && (
          <RestaurantSection
            places={places}
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            lang={lang}
          />
        )}

        {/* TAB 8: RESIDENTIAL HOTELS */}
        {activeTab === 'residential-hotels' && (
          <ResidentialHotelSection
            places={places}
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            lang={lang}
          />
        )}

        {/* TAB 9: TOURIST SPOTS */}
        {activeTab === 'tourist-spots' && (
          <TouristSpotSection
            places={places}
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            lang={lang}
          />
        )}

        {/* TAB 10: BANKS & ATMS */}
        {activeTab === 'banks' && (
          <BankAtmSection
            places={places}
            userLocation={userCoords}
            onRequestLocation={handleRequestLocation}
            lang={lang}
          />
        )}

        {/* TAB 8: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminPanel
            routes={routes}
            stops={stops}
            places={places}
            reports={reports}
            onAddRoute={handleAdminAddRoute}
            onUpdateRouteStatus={handleAdminUpdateRouteStatus}
            onToggleRouteActive={handleAdminToggleRouteActive}
            onResolveReport={handleAdminResolveReport}
            lang={lang}
          />
        )}

      </main>

      {/* MODALS */}

      {/* 1. Bus Route Details Modal */}
      <BusRouteDetailsModal
        route={modalRoute}
        onClose={() => setModalRoute(null)}
        onOpenReportModal={handleOpenReportModal}
        allPlaces={places}
        lang={lang}
      />

      {/* 2. User Report Modal */}
      <ReportModal
        targetId={reportModalData.targetId}
        targetName={reportModalData.targetName}
        targetType={reportModalData.targetType}
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
        onSubmitReport={handleAddReport}
      />

      {/* 3. How to Publish Freely Modal */}
      <HowToPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-bold text-slate-800">
            🇧🇩 Bangladesh Bus Route • “Find Your Bus. Know Your Route. Go Anywhere.”
          </div>
          <div>
            Data sourced from CMP Traffic Division, BRTA Gazette & Civil Surgeon Directorate.
          </div>
          <div className="flex justify-center gap-4 text-emerald-800 font-semibold pt-1">
            <button onClick={() => setIsPublishModalOpen(true)} className="hover:underline">
              How to Publish Freely (Netlify Guide)
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('emergency')} className="text-red-700 hover:underline">
              24/7 Emergency (999)
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('admin')} className="text-slate-600 hover:underline">
              Admin & Verification
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
