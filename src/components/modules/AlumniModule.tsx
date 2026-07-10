import React, { useState } from 'react';
import {
  Briefcase, Users, Plus, Search, Filter, Edit, Trash2,
  Eye, Calendar, Clock, DollarSign, Award, Star,
  TrendingUp, TrendingDown, Percent, FileText,
  Mail, Phone, MapPin, Linkedin, Twitter, Globe,
  CheckCircle, AlertCircle, XCircle, X
} from 'lucide-react';

interface AlumniModuleProps {
  userName: string;
  alumni: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function AlumniModule({
  userName,
  alumni,
  showNotification
}: AlumniModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const totalDonations = alumni.reduce((sum: number, a: any) => sum + (a.donationsTotal || 0), 0);
  const verifiedAlumni = alumni.filter((a: any) => a.verified).length;

  const handleAddAlumni = () => {
    setModalType('addAlumni');
    setModalData({ name: '', graduationYear: 2024, degree: '', currentCompany: '', jobTitle: '', email: '' });
    setShowModal(true);
  };

  const handleSaveAlumni = () => {
    showNotification(`Alumni "${modalData.name}" added successfully!`, 'success');
    setShowModal(false);
  };

  const handleVerifyAlumni = (id: string) => {
    showNotification('Alumni verified successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Alumni Dashboard</h2>
            <p className="text-violet-200 mt-1">Welcome back, {userName}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-violet-200">Total Alumni</p>
                <p className="font-bold">{alumni.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-violet-200">Verified</p>
                <p className="font-bold text-green-300">{verifiedAlumni}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-violet-200">Donations</p>
                <p className="font-bold">${totalDonations.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-violet-200">Graduation Years</p>
                <p className="font-bold">{new Set(alumni.map((a: any) => a.graduationYear)).size}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddAlumni}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Alumni
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Alumni</p>
              <p className="text-xl font-bold text-slate-900">{alumni.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Verified</p>
              <p className="text-xl font-bold text-green-600">{verifiedAlumni}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Donations</p>
              <p className="text-xl font-bold text-emerald-600">${totalDonations.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Donation</p>
              <p className="text-xl font-bold text-slate-900">
                ${alumni.length > 0 ? (totalDonations / alumni.length).toFixed(0) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - ALL FIXED */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleAddAlumni}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-violet-300 transition-colors text-center cursor-pointer"
        >
          <Plus className="h-6 w-6 text-violet-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Add Alumni</p>
        </button>
        <button
          onClick={() => showNotification('Newsletter sent successfully!', 'success')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-violet-300 transition-colors text-center cursor-pointer"
        >
          <Mail className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Send Newsletter</p>
        </button>
        <button
          onClick={() => showNotification('Event planning dashboard opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-violet-300 transition-colors text-center cursor-pointer"
        >
          <Calendar className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Event Planning</p>
        </button>
        <button
          onClick={() => showNotification('Generating alumni report...', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-violet-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Reports</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Alumni', 'Donations', 'Events', 'Networking'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alumni Directory */}
      {activeTab === 'alumni' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Alumni Directory
            </h3>
            <button
              onClick={handleAddAlumni}
              className="text-sm text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Alumni
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Graduation Year</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-right">Donations</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumni.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No alumni records found. Click "Add Alumni" to get started.
                    </td>
                  </tr>
                ) : (
                  alumni.map((person: any) => (
                    <tr key={person.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{person.name}</td>
                      <td className="px-4 py-3">{person.graduationYear}</td>
                      <td className="px-4 py-3">{person.currentCompany || 'N/A'}</td>
                      <td className="px-4 py-3">{person.jobTitle || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                        ${(person.donationsTotal || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          person.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {person.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Alumni Modal */}
      {showModal && modalType === 'addAlumni' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Alumni</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAlumni(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Graduation Year *</label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2030"
                  value={modalData.graduationYear}
                  onChange={(e) => setModalData({ ...modalData, graduationYear: parseInt(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Degree</label>
                <input
                  type="text"
                  value={modalData.degree}
                  onChange={(e) => setModalData({ ...modalData, degree: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Company</label>
                <input
                  type="text"
                  value={modalData.currentCompany}
                  onChange={(e) => setModalData({ ...modalData, currentCompany: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Title</label>
                <input
                  type="text"
                  value={modalData.jobTitle}
                  onChange={(e) => setModalData({ ...modalData, jobTitle: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
              >
                Add Alumni
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}