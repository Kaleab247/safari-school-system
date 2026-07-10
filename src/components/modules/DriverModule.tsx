import React, { useState } from 'react';
import {
  Truck, Navigation, MapPin, CheckCircle, AlertCircle,
  Clock, Calendar, Users, Phone, Fuel, Wrench,
  Route, StopCircle, Car, Map, User, Eye,
  Clipboard, FileText, Plus, X, Edit, Trash2
} from 'lucide-react';

interface DriverModuleProps {
  userName: string;
  routes: any[];
  checklists: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function DriverModule({
  userName,
  routes = [],
  checklists = [],
  showNotification
}: DriverModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  // Find routes assigned to this driver
  const assignedRoutes = routes.filter((r: any) =>
    r.driverName === userName || r.driverName?.includes(userName) || r.driverName?.toLowerCase() === userName.toLowerCase()
  );

  const handleCompleteTrip = (routeId: string) => {
    showNotification('Trip completed successfully!', 'success');
  };

  const handleSubmitChecklist = () => {
    setModalType('checklist');
    setModalData({ brakes: true, tires: true, fuel: 100, emergencyKit: true });
    setShowModal(true);
  };

  const handleSaveChecklist = () => {
    showNotification('Vehicle checklist submitted successfully!', 'success');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Driver Dashboard</h2>
            <p className="text-blue-200 mt-1">Welcome back, {userName}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Assigned Routes</p>
                <p className="font-bold">{assignedRoutes.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Students</p>
                <p className="font-bold">{assignedRoutes.reduce((sum: number, r: any) => sum + (r.assignedStudents || 0), 0)}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Checklists</p>
                <p className="font-bold">{checklists.filter((c: any) => c.driverName === userName || c.driverName?.toLowerCase() === userName.toLowerCase()).length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Status</p>
                <p className="font-bold text-green-300">Active</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmitChecklist}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Clipboard className="h-4 w-4" /> Submit Checklist
          </button>
        </div>
      </div>

      {assignedRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No routes assigned to you yet.</p>
          <p className="text-sm text-slate-400 mt-1">Please contact the transport administrator.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {['Overview', 'Routes', 'Checklist', 'GPS', 'History'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Routes */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              {assignedRoutes.map((route: any) => (
                <div key={route.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{route.routeName}</h3>
                      <p className="text-sm text-slate-500">Vehicle: {route.vehicleNo}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'InTransit' ? 'bg-green-100 text-green-700 animate-pulse' :
                      route.status === 'Idle' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {route.status || 'Idle'}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-sm text-slate-500">Status</p>
                        <p className={`font-bold ${route.status === 'InTransit' ? 'text-green-600' : 'text-slate-900'}`}>
                          {route.status || 'Idle'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-sm text-slate-500">Current Stop</p>
                        <p className="font-bold text-slate-900">{route.currentStop || 'Not started'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-sm text-slate-500">Students</p>
                        <p className="font-bold text-slate-900">{route.assignedStudents || 0}/{route.capacity || 40}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-sm text-slate-500">Stops</p>
                        <p className="font-bold text-slate-900">{route.stops?.length || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-500 mb-2">Route Stops:</p>
                      <div className="flex flex-wrap gap-2">
                        {route.stops?.map((stop: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm ${
                              stop === route.currentStop
                                ? 'bg-green-100 text-green-700 font-semibold border-2 border-green-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCompleteTrip(route.id)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4" /> Complete Trip
                      </button>
                      <button
                        onClick={() => showNotification('GPS tracking opened!', 'info')}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Navigation className="h-4 w-4" /> View GPS
                      </button>
                      <button
                        onClick={() => showNotification('Emergency contact list opened!', 'info')}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="h-4 w-4" /> Emergency Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Vehicle Safety Checklist</h3>
              <p className="text-sm text-slate-500 mb-4">Complete this checklist before starting your route.</p>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveChecklist(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="brakes"
                      checked={modalData.brakes}
                      onChange={(e) => setModalData({ ...modalData, brakes: e.target.checked })}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <label htmlFor="brakes" className="text-sm font-medium text-slate-700">Brakes Check</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="tires"
                      checked={modalData.tires}
                      onChange={(e) => setModalData({ ...modalData, tires: e.target.checked })}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <label htmlFor="tires" className="text-sm font-medium text-slate-700">Tires Check</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="emergencyKit"
                      checked={modalData.emergencyKit}
                      onChange={(e) => setModalData({ ...modalData, emergencyKit: e.target.checked })}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <label htmlFor="emergencyKit" className="text-sm font-medium text-slate-700">Emergency Kit Present</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="engineLights"
                      checked={modalData.engineLights}
                      onChange={(e) => setModalData({ ...modalData, engineLights: e.target.checked })}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <label htmlFor="engineLights" className="text-sm font-medium text-slate-700">Engine Lights OK</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Fuel Level (%)</label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={modalData.fuel || 100}
                      onChange={(e) => setModalData({ ...modalData, fuel: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="font-bold text-lg text-blue-600 w-12 text-center">{modalData.fuel || 100}%</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Submit Checklist
                </button>
              </form>

              {/* Previous Checklists */}
              <div className="mt-6 border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Previous Checklists</h4>
                <div className="space-y-2">
                  {checklists.filter((c: any) => c.driverName === userName || c.driverName?.toLowerCase() === userName.toLowerCase()).slice(0, 5).map((checklist: any) => (
                    <div key={checklist.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{checklist.date}</p>
                        <p className="text-xs text-slate-500">Vehicle: {checklist.vehicleNo}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Submitted</span>
                    </div>
                  ))}
                  {checklists.filter((c: any) => c.driverName === userName).length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No previous checklists found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}