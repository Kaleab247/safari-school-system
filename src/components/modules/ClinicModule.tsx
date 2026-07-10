import React, { useState } from 'react';
import {
  Heart, Stethoscope, Plus, Search, Filter, Edit, Trash2,
  Eye, Calendar, Clock, Users, CheckCircle, XCircle,
  AlertCircle, FileText, Phone, Mail, MapPin, Activity,
  Thermometer, Droplet, Pill, Syringe, Bandage
} from 'lucide-react';

interface ClinicModuleProps {
  userName: string;
  clinicVisits: any[];
  students: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ClinicModule({
  userName,
  clinicVisits,
  students,
  showNotification
}: ClinicModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const handleAddVisit = () => {
    setModalType('addVisit');
    setModalData({ studentId: '', complaint: '', treatment: '', medication: '' });
    setShowModal(true);
  };

  const handleSaveVisit = () => {
    showNotification('Visit recorded successfully!', 'success');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Clinic Dashboard</h2>
            <p className="text-red-200 mt-1">Student Health & Medical Records</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-red-200">Total Visits</p>
                <p className="font-bold">{clinicVisits.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-red-200">Students Seen</p>
                <p className="font-bold">{new Set(clinicVisits.map((v: any) => v.studentId)).size}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-red-200">Today's Visits</p>
                <p className="font-bold">{clinicVisits.filter((v: any) => v.date === new Date().toLocaleDateString()).length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-red-200">Total Students</p>
                <p className="font-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddVisit}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Record Visit
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Visits</p>
              <p className="text-xl font-bold text-slate-900">{clinicVisits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Dismissed</p>
              <p className="text-xl font-bold text-green-600">{clinicVisits.filter((v: any) => v.status === 'Dismissed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Resting</p>
              <p className="text-xl font-bold text-yellow-600">{clinicVisits.filter((v: any) => v.status === 'Resting').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Referred</p>
              <p className="text-xl font-bold text-red-600">{clinicVisits.filter((v: any) => v.status === 'ReferredToHospital').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Visits', 'Students', 'Reports', 'Medications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-red-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Visits */}
      {activeTab === 'visits' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Recent Visits
            </h3>
            <button
              onClick={handleAddVisit}
              className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Record
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Complaint</th>
                  <th className="px-4 py-2 text-left">Treatment</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinicVisits.slice(0, 20).map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{visit.studentName}</td>
                    <td className="px-4 py-3 text-slate-500">{visit.date}</td>
                    <td className="px-4 py-3">{visit.complaint}</td>
                    <td className="px-4 py-3">{visit.treatment}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        visit.status === 'Dismissed' ? 'bg-green-100 text-green-700' :
                        visit.status === 'Resting' ? 'bg-yellow-100 text-yellow-700' :
                        visit.status === 'SentHome' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Visit Modal */}
      {showModal && modalType === 'addVisit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Record Clinic Visit</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveVisit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select
                  required
                  value={modalData.studentId}
                  onChange={(e) => setModalData({ ...modalData, studentId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select Student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Complaint *</label>
                <input
                  type="text"
                  required
                  value={modalData.complaint}
                  onChange={(e) => setModalData({ ...modalData, complaint: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Treatment *</label>
                <textarea
                  required
                  rows={3}
                  value={modalData.treatment}
                  onChange={(e) => setModalData({ ...modalData, treatment: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Medication Given</label>
                <input
                  type="text"
                  value={modalData.medication}
                  onChange={(e) => setModalData({ ...modalData, medication: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Record Visit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}