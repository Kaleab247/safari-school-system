import React, { useState } from 'react';
import {
  Building, Users, GraduationCap, BookOpen, Calendar, Clock,
  DollarSign, Plus, Search, Filter, Edit, Trash2, X,
  Check, AlertCircle, UserPlus, Mail, Phone, MapPin,
  BarChart3, TrendingUp, TrendingDown, Percent, FileText,
  Settings, UserCog, Shield, Database, RefreshCw
} from 'lucide-react';

interface SchoolAdminModuleProps {
  userName: string;
  students: any[];
  teachers: any[];
  grades: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function SchoolAdminModule({
  userName,
  students = [],
  teachers = [],
  grades = [],
  transactions = [],
  showNotification
}: SchoolAdminModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const totalIncome = transactions.filter((t: any) => t.type === 'Income').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t: any) => t.type === 'Expense').reduce((sum: number, t: any) => sum + t.amount, 0);

  const handleAddStudent = () => {
    setModalType('addStudent');
    setModalData({ name: '', email: '', grade: 'Grade 11', parentName: '', parentEmail: '' });
    setShowModal(true);
  };

  const handleAddTeacher = () => {
    setModalType('addTeacher');
    setModalData({ name: '', email: '', department: 'Mathematics', subjects: [] });
    setShowModal(true);
  };

  const handleSaveStudent = () => {
    showNotification(`Student ${modalData.name} added successfully!`, 'success');
    setShowModal(false);
  };

  const handleSaveTeacher = () => {
    showNotification(`Teacher ${modalData.name} added successfully!`, 'success');
    setShowModal(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      showNotification(`Student ${name} deleted successfully!`, 'success');
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      showNotification(`Teacher ${name} deleted successfully!`, 'success');
    }
  };

  const handleViewClasses = () => {
    setActiveTab('classes');
    showNotification('Loading classes...', 'info');
  };

  const handleViewFinance = () => {
    setActiveTab('finance');
    showNotification('Loading finance data...', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">School Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Welcome back, {userName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddStudent}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Add Student
          </button>
          <button
            onClick={handleAddTeacher}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Add Teacher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Students</p>
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{students.length}</p>
        </div>
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Teachers</p>
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{teachers.length}</p>
        </div>
        <div
          onClick={handleViewFinance}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Revenue</p>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${totalIncome.toLocaleString()}</p>
        </div>
        <div
          onClick={handleViewClasses}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Classes</p>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">8</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Students', 'Teachers', 'Classes', 'Finance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Students List */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Student Directory
            </h3>
            <button
              onClick={handleAddStudent}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Student
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Admission</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">GPA</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No students found. Click "Add Student" to get started.
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">{student.admissionNo || 'N/A'}</td>
                      <td className="px-4 py-3">{student.grade || 'N/A'}</td>
                      <td className="px-4 py-3">{student.parentName || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold">{student.gpa || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teachers List */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> Teachers Directory
            </h3>
            <button
              onClick={handleAddTeacher}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Teacher
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Performance</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No teachers found. Click "Add Teacher" to get started.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{teacher.name}</td>
                      <td className="px-4 py-3">{teacher.email}</td>
                      <td className="px-4 py-3">{teacher.department || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{teacher.performanceScore || 0}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          teacher.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {teacher.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && modalType === 'addStudent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Student</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveStudent(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade</label>
                <select
                  value={modalData.grade}
                  onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Parent Name</label>
                <input
                  type="text"
                  value={modalData.parentName}
                  onChange={(e) => setModalData({ ...modalData, parentName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Parent Email</label>
                <input
                  type="email"
                  value={modalData.parentEmail}
                  onChange={(e) => setModalData({ ...modalData, parentEmail: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Add Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showModal && modalType === 'addTeacher' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Teacher</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTeacher(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <select
                  value={modalData.department}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Languages">Languages</option>
                  <option value="Arts">Arts</option>
                  <option value="Physical Education">Physical Education</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Add Teacher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}