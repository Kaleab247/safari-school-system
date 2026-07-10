import React, { useState } from 'react';
import {
  Heart, Users, Plus, Search, Filter, Edit, Trash2,
  Eye, Calendar, Clock, CheckCircle, XCircle,
  AlertCircle, FileText, Phone, Mail, MapPin, Activity,
  X, UserCheck, Award, Star
} from 'lucide-react';

interface CounselorModuleProps {
  userName: string;
  counselingSessions: any[];
  students: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CounselorModule({
  userName,
  counselingSessions = [],
  students = [],
  showNotification
}: CounselorModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const handleAddSession = () => {
    setModalType('addSession');
    setModalData({ studentId: '', wellbeingScore: 5, counselorNotes: '', referralRequired: false });
    setShowModal(true);
  };

  const handleSaveSession = () => {
    showNotification('Counseling session recorded successfully!', 'success');
    setShowModal(false);
  };

  const totalSessions = counselingSessions.length;
  const completedSessions = counselingSessions.filter((s: any) => s.status === 'Completed').length;
  const followUpRequired = counselingSessions.filter((s: any) => s.status === 'FollowUpRequired').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Counselor Dashboard</h2>
            <p className="text-pink-200 mt-1">Student Wellness & Counseling</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-pink-200">Total Sessions</p>
                <p className="font-bold">{totalSessions}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-pink-200">Completed</p>
                <p className="font-bold text-green-300">{completedSessions}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-pink-200">Follow-Up</p>
                <p className="font-bold text-yellow-300">{followUpRequired}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-pink-200">Students</p>
                <p className="font-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddSession}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Record Session
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-xl">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Sessions</p>
              <p className="text-xl font-bold text-slate-900">{totalSessions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-xl font-bold text-green-600">{completedSessions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Follow-Up</p>
              <p className="text-xl font-bold text-yellow-600">{followUpRequired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Wellbeing</p>
              <p className="text-xl font-bold text-slate-900">
                {counselingSessions.length > 0
                  ? (counselingSessions.reduce((sum: number, s: any) => sum + (s.wellbeingScore || 0), 0) / counselingSessions.length).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleAddSession}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-pink-300 transition-colors text-center cursor-pointer"
        >
          <Plus className="h-6 w-6 text-pink-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Record Session</p>
        </button>
        <button
          onClick={() => showNotification('Wellness report generated!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-pink-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Wellness Report</p>
        </button>
        <button
          onClick={() => showNotification('Student check-in list opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-pink-300 transition-colors text-center cursor-pointer"
        >
          <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Student Check-In</p>
        </button>
        <button
          onClick={() => showNotification('Resources list opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-pink-300 transition-colors text-center cursor-pointer"
        >
          <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Resources</p>
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Recent Counseling Sessions
          </h3>
          <button
            onClick={handleAddSession}
            className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 cursor-pointer"
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
                <th className="px-4 py-2 text-left">Wellbeing Score</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Follow-Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {counselingSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No counseling sessions recorded yet.
                  </td>
                </tr>
              ) : (
                counselingSessions.slice(0, 20).map((session: any) => (
                  <tr key={session.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{session.studentName || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-500">{session.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        session.wellbeingScore >= 7 ? 'bg-green-100 text-green-700' :
                        session.wellbeingScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {session.wellbeingScore || 0}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'FollowUpRequired' ? 'bg-yellow-100 text-yellow-700' :
                        session.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {session.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {session.referralRequired ? (
                        <span className="text-yellow-600 text-xs font-semibold">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Session Modal */}
      {showModal && modalType === 'addSession' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Record Counseling Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSession(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select
                  required
                  value={modalData.studentId}
                  onChange={(e) => setModalData({ ...modalData, studentId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="">Select Student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Wellbeing Score (1-10) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={modalData.wellbeingScore}
                  onChange={(e) => setModalData({ ...modalData, wellbeingScore: parseInt(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Counselor Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={modalData.counselorNotes}
                  onChange={(e) => setModalData({ ...modalData, counselorNotes: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Session notes..."
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="referralRequired"
                  checked={modalData.referralRequired}
                  onChange={(e) => setModalData({ ...modalData, referralRequired: e.target.checked })}
                  className="h-4 w-4 accent-pink-600"
                />
                <label htmlFor="referralRequired" className="text-sm font-medium text-slate-700">
                  Referral Required
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors cursor-pointer"
              >
                Record Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}