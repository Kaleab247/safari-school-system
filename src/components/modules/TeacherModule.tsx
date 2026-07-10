// TeacherModule.tsx - Complete updated version with profile management

import React, { useState } from 'react';
import {
  Users, GraduationCap, BookOpen, Calendar, Clock, FileText,
  Plus, Edit, Trash2, Eye, Search, Filter, CheckCircle,
  XCircle, AlertTriangle, BarChart3, TrendingUp, TrendingDown,
  Percent, Award, Star, MessageSquare, Bell, Download, Printer, X,
  User, KeyRound, Save, Lock, Mail, Phone, UserCog, AlertCircle
} from 'lucide-react';

interface TeacherModuleProps {
  userName: string;
  students: any[];
  teachers: any[];
  grades: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
  onUpdateTeacher?: (teacher: any) => void;
}

export default function TeacherModule({
  userName,
  students = [],
  teachers = [],
  grades = [],
  showNotification,
  registeredUsers = [],
  setRegisteredUsers,
  onUpdateTeacher
}: TeacherModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});

  const teacher = teachers.find((t: any) => t.name === userName || t.email === userName);
  const myStudents = students; // In real app, filter by teacher's assigned students
  const myGrades = grades; // In real app, filter by teacher's grades

  // Profile management state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    department: teacher?.department || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleAddGrade = () => {
    setModalType('addGrade');
    setModalData({ studentId: '', subject: '', grade: '', score: '', assessmentType: 'Quiz' });
    setShowModal(true);
  };

  const handleSaveGrade = () => {
    showNotification(`Grade recorded for student!`, 'success');
    setShowModal(false);
  };

  const handleTakeAttendance = () => {
    setModalType('attendance');
    setShowModal(true);
  };

  const handleSaveAttendance = () => {
    showNotification('Attendance marked successfully!', 'success');
    setShowModal(false);
  };

  // Profile management handlers
  const handleOpenProfile = () => {
    setProfileData({
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      department: teacher?.department || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfileModal(true);
  };

  const handleUpdateProfile = () => {
    // Validate passwords if changing
    if (profileData.newPassword || profileData.confirmPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
      }
      if (profileData.newPassword.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
      }
      if (!profileData.currentPassword) {
        showNotification('Please enter your current password to change it!', 'error');
        return;
      }

      // Verify current password
      const user = registeredUsers.find((u: any) => u.email === teacher?.email);
      if (user && user.password !== profileData.currentPassword) {
        showNotification('Current password is incorrect!', 'error');
        return;
      }

      // Update password in registered users
      if (setRegisteredUsers && user) {
        setRegisteredUsers(registeredUsers.map((u: any) =>
          u.email === teacher?.email ? { ...u, password: profileData.newPassword } : u
        ));
      }
    }

    // Update teacher profile
    const updatedTeacher = {
      ...teacher,
      name: profileData.name,
      phone: profileData.phone,
      department: profileData.department
    };

    if (onUpdateTeacher) {
      onUpdateTeacher(updatedTeacher);
    }

    showNotification('Profile updated successfully!', 'success');
    setShowProfileModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
            <p className="text-emerald-200 mt-1">Welcome back, {teacher?.name || userName}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Students</p>
                <p className="font-bold">{myStudents.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Subjects</p>
                <p className="font-bold">{teacher?.subjects?.length || 3}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Performance</p>
                <p className="font-bold">{teacher?.performanceScore || 85}%</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Classes</p>
                <p className="font-bold">{teacher?.assignedClasses?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleOpenProfile}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserCog className="h-4 w-4" /> My Profile
            </button>
            <button
              onClick={handleAddGrade}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Grade
            </button>
            <button
              onClick={handleTakeAttendance}
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" /> Take Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <p className="text-xl font-bold text-slate-900">{myStudents.length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Grade</p>
              <p className="text-xl font-bold text-slate-900">
                {myGrades.length > 0 ? (myGrades.reduce((sum: number, g: any) => sum + (g.numericScore || 0), 0) / myGrades.length).toFixed(1) : 'N/A'}%
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => showNotification('Subject list opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Subjects</p>
              <p className="text-xl font-bold text-slate-900">{teacher?.subjects?.length || 0}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => showNotification('Performance details opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Performance</p>
              <p className="text-xl font-bold text-slate-900">{teacher?.performanceScore || 85}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Students', 'Grades', 'Attendance', 'Classes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-emerald-600 text-white'
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
              <Users className="h-4 w-4" /> My Students
            </h3>
            <span className="text-sm text-slate-500">{myStudents.length} students</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">GPA</th>
                  <th className="px-4 py-2 text-left">Attendance</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No students assigned to you.
                    </td>
                  </tr>
                ) : (
                  myStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">{student.grade || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold">{student.gpa || 'N/A'}</td>
                      <td className="px-4 py-3">{student.attendanceRate || 0}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => showNotification(`Viewing ${student.name}'s profile`, 'info')}
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="h-4 w-4 inline" /> View
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

      {/* Grades List */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Recent Grades
            </h3>
            <button
              onClick={handleAddGrade}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Grade
            </button>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myGrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No grades recorded yet. Click "Add Grade" to get started.
                    </td>
                  </tr>
                ) : (
                  myGrades.slice(0, 10).map((grade: any) => (
                    <tr key={grade.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium">{grade.studentName || 'N/A'}</td>
                      <td className="px-4 py-2">{grade.subject}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          grade.grade === 'A' || grade.grade === 'A-' ? 'bg-green-100 text-green-700' :
                          grade.grade === 'B+' || grade.grade === 'B' || grade.grade === 'B-' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {grade.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{grade.numericScore || 0}%</td>
                      <td className="px-4 py-2 text-slate-500">{grade.date || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {showModal && modalType === 'addGrade' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Grade</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select
                  required
                  value={modalData.studentId}
                  onChange={(e) => setModalData({ ...modalData, studentId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Select Student</option>
                  {myStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Subject *</label>
                <input
                  type="text"
                  required
                  value={modalData.subject}
                  onChange={(e) => setModalData({ ...modalData, subject: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade *</label>
                <select
                  required
                  value={modalData.grade}
                  onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Score (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={modalData.score}
                  onChange={(e) => setModalData({ ...modalData, score: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Assessment Type</label>
                <select
                  value={modalData.assessmentType}
                  onChange={(e) => setModalData({ ...modalData, assessmentType: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Save Grade
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showModal && modalType === 'attendance' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Take Attendance</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Select students present today:</p>
              {myStudents.slice(0, 5).map((student: any) => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    id={`att-${student.id}`}
                    defaultChecked={true}
                    className="h-5 w-5 accent-emerald-600"
                  />
                  <label htmlFor={`att-${student.id}`} className="text-sm font-medium text-slate-700">
                    {student.name}
                  </label>
                </div>
              ))}
              {myStudents.length > 5 && (
                <p className="text-xs text-slate-400">+ {myStudents.length - 5} more students</p>
              )}
              <button
                onClick={handleSaveAttendance}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-emerald-600" />
                My Profile
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact admin for assistance.</p>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Phone number"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Department</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Change Password
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>If you change your password, you will need to use the new password for future logins.</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" /> Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}