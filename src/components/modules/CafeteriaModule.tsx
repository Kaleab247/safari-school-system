import React, { useState } from 'react';
import {
  Utensils, Plus, Search, Filter, Edit, Trash2,
  Eye, Calendar, Clock, Users, CheckCircle, XCircle,
  AlertCircle, FileText, X, DollarSign, Award
} from 'lucide-react';

interface CafeteriaModuleProps {
  userName: string;
  cafeteriaMenus: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CafeteriaModule({
  userName,
  cafeteriaMenus = [],
  showNotification
}: CafeteriaModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const handleAddMenu = () => {
    setModalType('addMenu');
    setModalData({ day: 'Monday', mealType: 'Lunch', itemName: '', price: 0, calories: 0 });
    setShowModal(true);
  };

  const handleSaveMenu = () => {
    showNotification(`Menu item "${modalData.itemName}" added successfully!`, 'success');
    setShowModal(false);
  };

  const totalItems = cafeteriaMenus.length;
  const availableItems = cafeteriaMenus.filter((m: any) => m.isAvailable !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Cafeteria Dashboard</h2>
            <p className="text-orange-200 mt-1">Welcome back, {userName}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-orange-200">Total Menu Items</p>
                <p className="font-bold">{totalItems}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-orange-200">Available</p>
                <p className="font-bold text-green-300">{availableItems}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-orange-200">Categories</p>
                <p className="font-bold">{new Set(cafeteriaMenus.map((m: any) => m.mealType)).size}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddMenu}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Utensils className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Items</p>
              <p className="text-xl font-bold text-slate-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Available</p>
              <p className="text-xl font-bold text-green-600">{availableItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Days Active</p>
              <p className="text-xl font-bold text-slate-900">{new Set(cafeteriaMenus.map((m: any) => m.day)).size}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Price</p>
              <p className="text-xl font-bold text-slate-900">
                ${cafeteriaMenus.length > 0
                  ? (cafeteriaMenus.reduce((sum: number, m: any) => sum + (m.price || 0), 0) / cafeteriaMenus.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleAddMenu}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 transition-colors text-center cursor-pointer"
        >
          <Plus className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Add Menu Item</p>
        </button>
        <button
          onClick={() => showNotification('Menu published successfully!', 'success')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 transition-colors text-center cursor-pointer"
        >
          <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Publish Menu</p>
        </button>
        <button
          onClick={() => showNotification('Inventory report generated!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Inventory Report</p>
        </button>
        <button
          onClick={() => showNotification('Weekly menu preview opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 transition-colors text-center cursor-pointer"
        >
          <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Weekly Menu</p>
        </button>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Menu Items
          </h3>
          <button
            onClick={handleAddMenu}
            className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Meal Type</th>
                <th className="px-4 py-2 text-center">Price</th>
                <th className="px-4 py-2 text-center">Calories</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cafeteriaMenus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No menu items found. Click "Add Menu Item" to get started.
                  </td>
                </tr>
              ) : (
                cafeteriaMenus.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.itemName}</td>
                    <td className="px-4 py-3">{item.day}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{item.mealType}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">${(item.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">{item.calories || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Menu Modal */}
      {showModal && modalType === 'addMenu' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Menu Item</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveMenu(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Item Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.itemName}
                  onChange={(e) => setModalData({ ...modalData, itemName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Grilled Chicken"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Day *</label>
                <select
                  required
                  value={modalData.day}
                  onChange={(e) => setModalData({ ...modalData, day: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Meal Type *</label>
                <select
                  required
                  value={modalData.mealType}
                  onChange={(e) => setModalData({ ...modalData, mealType: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snack">Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={modalData.price}
                  onChange={(e) => setModalData({ ...modalData, price: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Calories</label>
                <input
                  type="number"
                  min="0"
                  value={modalData.calories}
                  onChange={(e) => setModalData({ ...modalData, calories: parseInt(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="0"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
              >
                Add Menu Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}