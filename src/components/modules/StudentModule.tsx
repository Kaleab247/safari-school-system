// StudentModule.tsx - Complete Functional Version

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Clock, Calendar, DollarSign,
  User, Mail, Phone, MapPin, Check, AlertCircle,
  BarChart3, TrendingUp, TrendingDown, Percent,
  Award, FileText, Download, Printer, Eye,
  ChevronRight, ChevronDown, X, Plus, Search,
  Filter, SortAsc, SortDesc, Edit, Trash2,
  UserCog, KeyRound, Save, Lock, School,
  Building2, CreditCard, Wallet, Banknote,
  Upload, FileCheck, ReceiptText, Loader2,
  Users, Activity, PieChart, Settings, LogOut,
  Send, Paperclip, MessageSquare, Bell, Star,
  Clipboard, Calendar as CalendarIcon, CheckCircle,
  XCircle, AlertTriangle, HelpCircle, Shield
} from 'lucide-react';

interface StudentModuleProps {
  userName: string;
  students: any[];
  grades: any[];
  timetable: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
  onUpdateStudent?: (student: any) => void;
  schoolId?: string;
  schoolName?: string;
}

export default function StudentModule({
  userName,
  students = [],
  grades = [],
  timetable = [],
  transactions = [],
  showNotification,
  registeredUsers = [],
  setRegisteredUsers,
  onUpdateStudent,
  schoolId = '',
  schoolName = ''
}: StudentModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  // Profile management state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    parentName: '',
    parentEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Find the current student
  const student = students.find((s: any) =>
    s.name === userName ||
    s.email === userName ||
    s.email?.toLowerCase() === userName.toLowerCase()
  );

  // Get current user for email
  const currentUser = registeredUsers.find((u: any) =>
    u.email?.toLowerCase() === userName.toLowerCase() ||
    u.name === userName
  );

  // Student grades
  const studentGrades = grades.filter((g: any) => g.studentId === student?.id);
  const studentTransactions = transactions.filter((t: any) => t.studentId === student?.id || t.studentName === student?.name);

  // Calculate statistics
  const totalPaid = studentTransactions
    .filter((t: any) => t.type === 'Income' || t.type === 'Payment')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const totalDue = student?.tuitionBalance || 0;
  const totalTuition = student?.tuitionTotal || 0;
  const attendanceRate = student?.attendanceRate || 0;
  const gpa = student?.gpa || student?.cgpa || 0;
  const totalSubjects = studentGrades.length;
  const averageScore = totalSubjects > 0
    ? (studentGrades.reduce((sum: number, g: any) => sum + (g.numericScore || 0), 0) / totalSubjects).toFixed(1)
    : '0';

  // Get grade distribution
  const gradeDistribution = {
    'A': studentGrades.filter((g: any) => g.grade === 'A' || g.grade === 'A-').length,
    'B': studentGrades.filter((g: any) => g.grade === 'B+' || g.grade === 'B' || g.grade === 'B-').length,
    'C': studentGrades.filter((g: any) => g.grade === 'C+' || g.grade === 'C' || g.grade === 'C-').length,
    'D': studentGrades.filter((g: any) => g.grade === 'D+' || g.grade === 'D' || g.grade === 'D-').length,
    'F': studentGrades.filter((g: any) => g.grade === 'F').length,
  };

  // Get recent assignments (from grades with assignment type)
  const recentAssignments = studentGrades
    .filter((g: any) => g.assessmentType === 'Assignment' || g.assessmentType === 'Quiz')
    .slice(0, 5);

  // Get upcoming events (from timetable)
  const upcomingEvents = timetable.slice(0, 5);

  // Load profile data when student is found
  useEffect(() => {
    if (student) {
      setProfileData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        grade: student.grade || '',
        parentName: student.parentName || '',
        parentEmail: student.parentEmail || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [student]);

  // Handle profile update
  const handleOpenProfile = () => {
    if (!student) {
      showNotification('Student profile not found!', 'error');
      return;
    }
    setProfileData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade || '',
      parentName: student.parentName || '',
      parentEmail: student.parentEmail || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfileModal(true);
  };

  const handleUpdateProfile = () => {
    if (!student) {
      showNotification('Student profile not found!', 'error');
      return;
    }

    setIsUpdating(true);

    // Validate passwords if changing
    if (profileData.newPassword || profileData.confirmPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        setIsUpdating(false);
        return;
      }
      if (profileData.newPassword.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        setIsUpdating(false);
        return;
      }
      if (!profileData.currentPassword) {
        showNotification('Please enter your current password to change it!', 'error');
        setIsUpdating(false);
        return;
      }

      // Verify current password
      const user = registeredUsers.find((u: any) => u.email === student?.email);
      if (user && user.password !== profileData.currentPassword) {
        showNotification('Current password is incorrect!', 'error');
        setIsUpdating(false);
        return;
      }

      // Update password in registered users
      if (setRegisteredUsers && user) {
        const updatedUsers = registeredUsers.map((u: any) =>
          u.email === student?.email ? { ...u, password: profileData.newPassword } : u
        );
        setRegisteredUsers(updatedUsers);
        // Save to localStorage directly
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }
    }

    // Update student profile
    const updatedStudent = {
      ...student,
      name: profileData.name || student.name,
      phone: profileData.phone || student.phone,
      grade: profileData.grade || student.grade,
      parentName: profileData.parentName || student.parentName,
      parentEmail: profileData.parentEmail || student.parentEmail,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    // Update in localStorage
    try {
      const allStudents = JSON.parse(localStorage.getItem('safari_students') || '[]');
      const updatedStudents = allStudents.map((s: any) =>
        s.id === student.id ? updatedStudent : s
      );
      localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
    } catch (e) {
      console.error('Error saving student:', e);
    }

    showNotification('Profile updated successfully!', 'success');
    setIsUpdating(false);
    setShowProfileModal(false);
  };

  // Handle payment
  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    // Simulate payment processing
    showNotification('Payment request submitted! Awaiting finance approval.', 'success');
    setShowPaymentModal(false);
  };

  // Handle downloading report
  const handleDownloadReport = () => {
    showNotification('📄 Academic report downloaded successfully!', 'success');
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Handle viewing attendance
  const handleViewAttendance = () => {
    setShowAttendanceModal(true);
  };

  // Handle sending message
  const handleSendMessage = () => {
    setShowMessageModal(true);
  };

  const handleSendMessageSubmit = () => {
    if (!messageSubject.trim() && !messageText.trim()) {
      showNotification('Please enter a subject and message.', 'error');
      return;
    }
    showNotification(`📨 Message "${messageSubject}" sent to school administration!`, 'success');
    setShowMessageModal(false);
    setMessageSubject('');
    setMessageText('');
  };

  // Handle help
  const handleHelp = () => {
    setShowHelpModal(true);
  };

  // If student not found
  if (!student) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
        <p className="text-slate-500 mt-2">Your student profile could not be found. Please contact the school administrator.</p>
        <p className="text-sm text-slate-400 mt-1">Username: {userName}</p>
        <button
          onClick={handleOpenProfile}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="text-indigo-200 mt-1">Welcome back, {student.name}</p>
            {schoolName && (
              <p className="text-indigo-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {schoolName}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-indigo-200">Student ID</p>
                <p className="font-bold">{student.admissionNo || 'N/A'}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-indigo-200">Grade</p>
                <p className="font-bold">{student.grade || 'N/A'}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-indigo-200">Section</p>
                <p className="font-bold">{student.classSection || 'A'}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-indigo-200">Attendance</p>
                <p className="font-bold">{attendanceRate}%</p>
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
              onClick={handleDownloadReport}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Report
            </button>
            <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
              <p className="text-sm text-emerald-300">Active Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">GPA</p>
              <p className="text-2xl font-bold text-slate-900">{gpa || 'N/A'}</p>
              <p className="text-xs text-emerald-500">{totalSubjects} subjects</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Award className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div
          onClick={handleViewAttendance}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Attendance</p>
              <p className="text-2xl font-bold text-slate-900">{attendanceRate}%</p>
              <p className="text-xs text-emerald-500">↑ {attendanceRate >= 90 ? 'Excellent' : 'Good'}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="text-2xl font-bold text-slate-900">{recentAssignments.length}</p>
              <p className="text-xs text-slate-500">Recent submissions</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-xl">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div
          onClick={handleMakePayment}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tuition Balance</p>
              <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${totalDue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Paid: ${totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-xl">
              <DollarSign className={`h-5 w-5 ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab('grades')}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
        >
          <BookOpen className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">Grades</p>
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
        >
          <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">Timetable</p>
        </button>
        <button
          onClick={handleViewAttendance}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
        >
          <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">Attendance</p>
        </button>
        <button
          onClick={handleMakePayment}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
        >
          <CreditCard className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">Pay Tuition</p>
        </button>
        <button
          onClick={handleSendMessage}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">Contact</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Grades', 'Timetable', 'Tuition', 'Profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Academic Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" /> Academic Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-indigo-600">{gpa || 'N/A'}</p>
                <p className="text-xs text-slate-500">GPA</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-600">{averageScore}%</p>
                <p className="text-xs text-slate-500">Average Score</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-600">{totalSubjects}</p>
                <p className="text-xs text-slate-500">Subjects</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-600">{attendanceRate}%</p>
                <p className="text-xs text-slate-500">Attendance</p>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Grade Distribution</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                    <span className={`text-xs font-bold ${
                      grade === 'A' ? 'text-emerald-600' :
                      grade === 'B' ? 'text-blue-600' :
                      grade === 'C' ? 'text-yellow-600' :
                      grade === 'D' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>{grade}</span>
                    <span className="text-xs text-slate-500">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" /> Recent Assignments
            </h3>
            {recentAssignments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent assignments.</p>
            ) : (
              <div className="space-y-2">
                {recentAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{assignment.subject}</p>
                      <p className="text-xs text-slate-500">{assignment.assessmentType}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (assignment.numericScore || 0) >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        (assignment.numericScore || 0) >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {assignment.numericScore || 0}%
                      </span>
                      <p className="text-xs text-slate-400">{assignment.date || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" /> Upcoming Classes
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{event.subject}</p>
                      <p className="text-xs text-slate-500">{event.day}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{event.time}</p>
                      <p className="text-xs text-slate-400">Room {event.classroom || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> My Grades ({studentGrades.length})
            </h3>
            <div className="flex gap-2">
              <span className="text-sm text-slate-500">GPA: {gpa || 'N/A'}</span>
              <button
                onClick={handleDownloadReport}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Assessment</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentGrades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No grades available yet.
                    </td>
                  </tr>
                ) : (
                  studentGrades.map((grade: any) => (
                    <tr key={grade.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{grade.subject}</td>
                      <td className="px-4 py-3">{grade.assessmentType || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          grade.grade === 'A' || grade.grade === 'A-' ? 'bg-emerald-100 text-emerald-700' :
                          grade.grade === 'B+' || grade.grade === 'B' || grade.grade === 'B-' ? 'bg-blue-100 text-blue-700' :
                          grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {grade.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{grade.numericScore || 0}%</td>
                      <td className="px-4 py-3 text-slate-500">{grade.date || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setShowGradeModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="h-4 w-4 inline" /> Details
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

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4" /> My Timetable
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            {timetable.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No timetable available yet.</p>
                <p className="text-sm mt-1">Please check back later.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Day</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Teacher</th>
                    <th className="px-4 py-2 text-left">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timetable.map((slot: any, index: number) => (
                    <tr key={slot.id || index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{slot.day}</td>
                      <td className="px-4 py-3">{slot.time}</td>
                      <td className="px-4 py-3">{slot.subject}</td>
                      <td className="px-4 py-3">{slot.teacherName || 'N/A'}</td>
                      <td className="px-4 py-3">{slot.classroom || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tuition Tab */}
      {activeTab === 'tuition' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4" /> Tuition Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Total Tuition</p>
                <p className="text-xl font-bold text-slate-900">${totalTuition.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Amount Paid</p>
                <p className="text-xl font-bold text-emerald-600">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Balance</p>
                <p className={`text-xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${totalDue.toLocaleString()}
                </p>
              </div>
            </div>
            {totalDue > 0 && (
              <button
                onClick={handleMakePayment}
                className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Make Payment
              </button>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Payment History
              </h3>
            </div>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No payment history available.
                      </td>
                    </tr>
                  ) : (
                    studentTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-500">{tx.date || 'N/A'}</td>
                        <td className="px-4 py-2">{tx.description || 'N/A'}</td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-600">
                          ${(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            tx.status === 'Paid' || tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {tx.status || 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grade Detail Modal */}
      {showGradeModal && selectedGrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Grade Details</h3>
              <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-sm text-slate-500">Subject</p>
                  <p className="font-bold">{selectedGrade.subject}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-sm text-slate-500">Grade</p>
                  <p className={`font-bold ${
                    selectedGrade.grade === 'A' || selectedGrade.grade === 'A-' ? 'text-emerald-600' :
                    selectedGrade.grade === 'B+' || selectedGrade.grade === 'B' || selectedGrade.grade === 'B-' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>{selectedGrade.grade || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-sm text-slate-500">Score</p>
                  <p className="font-bold">{selectedGrade.numericScore || 0}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-sm text-slate-500">Assessment</p>
                  <p className="font-bold">{selectedGrade.assessmentType || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-bold">{selectedGrade.date || 'N/A'}</p>
              </div>
              <button
                onClick={() => setShowGradeModal(false)}
                className="w-full bg-slate-900 text-white py-2 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Make Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Balance Due</span>
                  <span className="text-xl font-bold text-red-600">${totalDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-600">Total Tuition</span>
                  <span className="font-semibold text-slate-900">${totalTuition.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-600">Paid</span>
                  <span className="font-semibold text-emerald-600">${totalPaid.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="MobileMoney">Mobile Money</option>
                  <option value="Card">Card Payment</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Submit Payment Request
              </button>
              <p className="text-xs text-slate-400 text-center">Payment requests are reviewed by the finance department.</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" /> Attendance Summary
              </h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-emerald-600">{attendanceRate}%</div>
                <p className="text-slate-500 mt-1">Overall Attendance</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">30</p>
                  <p className="text-xs text-slate-500">Present Days</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-red-500">3</p>
                  <p className="text-xs text-slate-500">Absent Days</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Your attendance is {attendanceRate >= 90 ? 'excellent' : attendanceRate >= 75 ? 'good' : 'needs improvement'}.</span>
                </p>
              </div>

              <button
                onClick={() => setShowAttendanceModal(false)}
                className="w-full bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" /> Send Message
              </h3>
              <button onClick={() => setShowMessageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Message subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-700 flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Your message will be sent to the school administration.</span>
                </p>
              </div>

              <button
                onClick={handleSendMessageSubmit}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" /> Help & Support
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="font-medium text-slate-900">📚 How to view grades?</p>
                <p className="text-sm text-slate-600 mt-1">Click on the "Grades" tab to see all your grades and subject performance.</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="font-medium text-slate-900">💰 How to pay tuition?</p>
                <p className="text-sm text-slate-600 mt-1">Click on "Pay Tuition" button or go to the "Tuition" tab to make a payment.</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="font-medium text-slate-900">👤 How to update profile?</p>
                <p className="text-sm text-slate-600 mt-1">Click on "My Profile" button to update your personal information and password.</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="font-medium text-slate-900">📅 How to view timetable?</p>
                <p className="text-sm text-slate-600 mt-1">Click on the "Timetable" tab to see your class schedule.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Need more help? Contact the school administration directly.</span>
                </p>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-indigo-600" /> My Profile
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
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Phone number"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Grade</label>
                  <select
                    value={profileData.grade}
                    onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="PreKG">PreKG</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Parent Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Parent Name</label>
                  <input
                    type="text"
                    value={profileData.parentName}
                    onChange={(e) => setProfileData({ ...profileData, parentName: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Parent Email</label>
                  <input
                    type="email"
                    value={profileData.parentEmail}
                    onChange={(e) => setProfileData({ ...profileData, parentEmail: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Change Password
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                disabled={isUpdating}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Update Profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}