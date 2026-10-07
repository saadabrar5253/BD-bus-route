import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Bus, 
  MapPin, 
  ShieldAlert, 
  Database,
  ArrowRight
} from 'lucide-react';
import { BusRoute, BusStop, Place, UserReport } from '../types';

interface AdminPanelProps {
  routes: BusRoute[];
  stops: BusStop[];
  places: Place[];
  reports: UserReport[];
  onAddRoute: (route: BusRoute) => void;
  onUpdateRouteStatus: (routeId: string, status: 'Verified' | 'Needs Verification') => void;
  onToggleRouteActive: (routeId: string) => void;
  onResolveReport: (reportId: string, resolution: 'Verified & Fixed' | 'Dismissed') => void;
  lang: 'en' | 'bn';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  routes,
  stops,
  places,
  reports,
  onAddRoute,
  onUpdateRouteStatus,
  onToggleRouteActive,
  onResolveReport,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'reports' | 'stops' | 'places'>('routes');
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // New route form state
  const [newRouteNumber, setNewRouteNumber] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newOperator, setNewOperator] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newSource, setNewSource] = useState('BRTA Gazette & CMP Traffic Division');

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteNumber || !newRouteName || !newStart || !newEnd) return;

    const newRoute: BusRoute = {
      bus_id: `route-${Date.now()}`,
      route_number: newRouteNumber.trim(),
      bus_name: newRouteName.trim(),
      operator: newOperator.trim() || 'Chattogram Metropolitan Transport Association',
      city: 'Chattogram',
      division: 'Chattogram',
      start_point: newStart.trim(),
      end_point: newEnd.trim(),
      direction: 'Both Ways',
      major_stops: [newStart.trim(), newEnd.trim()],
      all_stops: [
        { stop_id: `stop-${Date.now()}-1`, name: newStart.trim(), lat: 22.3592, lng: 91.8219, order: 1, is_major: true },
        { stop_id: `stop-${Date.now()}-2`, name: newEnd.trim(), lat: 22.3245, lng: 91.8118, order: 2, is_major: true }
      ],
      route_geometry: [
        [22.3592, 91.8219],
        [22.3245, 91.8118]
      ],
      classification: 'city',
      operating_area: 'Chattogram Metro',
      service_status: 'Active',
      last_verified: new Date().toISOString().split('T')[0],
      source: newSource.trim(),
      verification_status: 'Verified'
    };

    onAddRoute(newRoute);
    setShowAddRouteModal(false);
    setNewRouteNumber('');
    setNewRouteName('');
    setNewOperator('');
    setNewStart('');
    setNewEnd('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Transit Verification & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Data Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review community reports, update verification status, audit sources, and manage routes.
          </p>
        </div>

        <button
          onClick={() => setShowAddRouteModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus Route</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'routes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚌 Bus Routes ({routes.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🚩 User Reports</span>
          {reports.filter(r => r.status === 'Pending Review').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('stops')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'stops' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚏 Bus Stops ({stops.length})
        </button>

        <button
          onClick={() => setActiveTab('places')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'places' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏥 Places & Facilities ({places.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. ROUTES MANAGEMENT */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black">
                <tr>
                  <th className="p-3">Route #</th>
                  <th className="p-3">Name & Operator</th>
                  <th className="p-3">Start ➔ End</th>
                  <th className="p-3">Source & Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((route) => (
                  <tr key={route.bus_id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-black text-slate-900">
                      <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                        {route.route_number}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{route.bus_name}</div>
                      <div className="text-[11px] text-slate-400">{route.operator}</div>
                    </td>
                    <td className="p-3 font-medium">
                      {route.start_point} ➔ {route.end_point}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      <div>{route.source}</div>
                      <div className="text-slate-400">{route.last_verified}</div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          onUpdateRouteStatus(
                            route.bus_id,
                            route.verification_status === 'Verified' ? 'Needs Verification' : 'Verified'
                          )
                        }
                        className={`px-2 py-0.5 rounded-sm font-bold text-[10px] cursor-pointer ${
                          route.verification_status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title="Click to toggle verification status"
                      >
                        {route.verification_status === 'Verified' ? '✅ Verified' : '⚠️ Needs Verify'}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onToggleRouteActive(route.bus_id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          route.service_status === 'Active'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {route.service_status === 'Active' ? 'Mark Inactive' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. USER REPORTS REVIEW QUEUE (Specification #24 & #25) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Community Submissions & Incorrect Info Reports ({reports.length})
            </h2>
            <span className="text-xs text-slate-500">Admin review workflow</span>
          </div>

          {reports.length > 0 ? (
            <div className="grid gap-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm bg-red-100 text-red-800 text-[10px] font-black uppercase">
                        {report.report_type.replace('_', ' ')}
                      </span>
                      <strong className="text-sm text-slate-900">{report.target_name}</strong>
                      <span className="text-xs text-slate-400 font-medium">({report.created_at})</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{report.details}"
                    </p>

                    {report.reporter_name && (
                      <div className="text-[11px] text-slate-400">
                        Submitted by: {report.reporter_name} {report.reporter_contact ? `(${report.reporter_contact})` : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {report.status === 'Pending Review' ? (
                      <>
                        <button
                          onClick={() => onResolveReport(report.id, 'Verified & Fixed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                        >
                          Verify & Fix
                        </button>
                        <button
                          onClick={() => onResolveReport(report.id, 'Dismissed')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No pending reports in review queue.
            </div>
          )}
        </div>
      )}

      {/* 3. BUS STOPS */}
      {activeTab === 'stops' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-500">Registered Transit Hubs & Bus Stops</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stops.map(s => (
              <div key={s.stop_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{s.stop_name}</div>
                <div className="text-slate-500">{s.stop_name_bn} • {s.thana}</div>
                <div className="text-[11px] text-emerald-800 font-medium mt-1">
                  Routes: {s.served_routes.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PLACES */}
      {activeTab === 'places' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-500">Hospitals, Police, Fire, Dining & Tourism</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {places.map(p => (
              <div key={p.place_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{p.subcategory}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-bold">Verified</span>
                </div>
                <div className="font-bold text-slate-900">{p.name}</div>
                <div className="text-slate-500">{p.address}</div>
                {p.phone && <div className="text-red-700 font-bold mt-1">📞 {p.phone}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD ROUTE MODAL */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add New Bus Route</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Route Number *</label>
                <input
                  type="text"
                  required
                  value={newRouteNumber}
                  onChange={e => setNewRouteNumber(e.target.value)}
                  placeholder="e.g. 10, 6, CUET-1..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={e => setNewRouteName(e.target.value)}
                  placeholder="e.g. Route 10 (Kalurghat - Patenga)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operator Name</label>
                <input
                  type="text"
                  value={newOperator}
                  onChange={e => setNewOperator(e.target.value)}
                  placeholder="e.g. Chattogram Metropolitan Bus Malik Samity"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Point *</label>
                  <input
                    type="text"
                    required
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    placeholder="e.g. Kalurghat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ending Point *</label>
                  <input
                    type="text"
                    required
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    placeholder="e.g. Patenga Sea Beach"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Source</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={e => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
