import React, { useState } from 'react';
import {
  Bus, Truck, MapPin, Navigation, Plus, Search, Filter,
  Edit, Trash2, Eye, Calendar, Clock, Users, CheckCircle,
  AlertCircle, FileText, Phone, Mail, Fuel, Wrench,
  Route, StopCircle, User, Car, Map, X
} from 'lucide-react';

interface TransportModuleProps {
  userName: string;
  routes: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function TransportModule({
  userName,
  routes = [],
  showNotification
}: TransportModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const activeRoutes = routes.filter((r: any) => r.status === 'InTransit').length;
  const totalStudents = routes.reduce((sum: number, r: any) => sum + (r.assignedStudents || 0), 0);

  const handleAddRoute = () => {
    setModalType('addRoute');
    setModalData({ routeName: '', driverName: '', vehicleNo: '', stops: [], capacity: 40 });
    setShowModal(true);
  };

  const handleSaveRoute = () => {
    showNotification(`Route "${modalData.routeName}" created successfully!`, 'success');
    setShowModal(false);
  };

  const handleAddDriver = () => {
    showNotification('Driver added successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Transport Management</h2>
            <p className="text-cyan-200 mt-1">Vehicle & Route Management</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-cyan-200">Total Routes</p>
                <p className="font-bold">{routes.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-cyan-200">Active Routes</p>
                <p className="font-bold text-green-300">{activeRoutes}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-cyan-200">Students</p>
                <p className="font-bold">{totalStudents}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-cyan-200">Vehicles</p>
                <p className="font-bold">{new Set(routes.map((r: any) => r.vehicleNo)).size}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRoute}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Route
            </button>
            <button
              onClick={handleAddDriver}
              className="bg-cyan-500/30 hover:bg-cyan-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" /> Add Driver
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Route className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Routes</p>
              <p className="text-xl font-bold text-slate-900">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-xl font-bold text-green-600">{activeRoutes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <p className="text-xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Bus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Vehicles</p>
              <p className="text-xl font-bold text-slate-900">{new Set(routes.map((r: any) => r.vehicleNo)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleAddRoute}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 transition-colors text-center cursor-pointer"
        >
          <Plus className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Add Route</p>
        </button>
        <button
          onClick={() => showNotification('GPS tracking dashboard opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 transition-colors text-center cursor-pointer"
        >
          <Map className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">GPS Tracking</p>
        </button>
        <button
          onClick={() => showNotification('Fuel management dashboard opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 transition-colors text-center cursor-pointer"
        >
          <Fuel className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Fuel Management</p>
        </button>
        <button
          onClick={() => showNotification('Transport report generated!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Reports</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Routes', 'Vehicles', 'Drivers', 'GPS Tracking'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-cyan-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Routes */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Route className="h-4 w-4" /> All Routes
            </h3>
            <button
              onClick={handleAddRoute}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Route
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Vehicle</th>
                  <th className="px-4 py-2 text-center">Students</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Current Stop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No routes found. Click "Add Route" to get started.
                    </td>
                  </tr>
                ) : (
                  routes.map((route: any) => (
                    <tr key={route.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{route.routeName}</td>
                      <td className="px-4 py-3">{route.driverName}</td>
                      <td className="px-4 py-3">{route.vehicleNo}</td>
                      <td className="px-4 py-3 text-center">{route.assignedStudents || 0}/{route.capacity || 40}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          route.status === 'InTransit' ? 'bg-green-100 text-green-700 animate-pulse' :
                          route.status === 'Idle' ? 'bg-slate-100 text-slate-700' :
                          route.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {route.status || 'Idle'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{route.currentStop || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showModal && modalType === 'addRoute' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Route</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRoute(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Route Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.routeName}
                  onChange={(e) => setModalData({ ...modalData, routeName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.driverName}
                  onChange={(e) => setModalData({ ...modalData, driverName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  value={modalData.vehicleNo}
                  onChange={(e) => setModalData({ ...modalData, vehicleNo: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={modalData.capacity}
                  onChange={(e) => setModalData({ ...modalData, capacity: parseInt(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stops (comma separated)</label>
                <input
                  type="text"
                  value={modalData.stops?.join(', ')}
                  onChange={(e) => setModalData({ ...modalData, stops: e.target.value.split(',').map((s: string) => s.trim()) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Main Campus, Stop 1, Stop 2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                Add Route
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}