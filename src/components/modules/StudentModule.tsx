import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, Clock, Calendar, DollarSign,
  User, Mail, Phone, MapPin, Check, AlertCircle,
  BarChart3, TrendingUp, TrendingDown, Percent,
  Award, FileText, Download, Printer, Eye,
  ChevronRight, ChevronDown, X, Plus, Search,
  Filter, SortAsc, SortDesc, Edit, Trash2
} from 'lucide-react';

interface StudentModuleProps {
  userName: string;
  students: any[];
  grades: any[];
  timetable: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function StudentModule({
  userName,
  students = [],
  grades = [],
  timetable = [],
  transactions = [],
  showNotification
}: StudentModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

  // Find the current student
  const student = students.find((s: any) => s.name === userName || s.email === userName);
  const studentGrades = grades.filter((g: any) => g.studentId === student?.id);
  const studentTransactions = transactions.filter((t: any) => t.studentId === student?.id);

  // Stats
  const totalPaid = studentTransactions.filter((t: any) => t.type === 'Income').reduce((sum: number, t: any) => sum + t.amount, 0);

  if (!student) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
        <p className="text-slate-500 mt-2">Your student profile could not be found. Please contact the school administrator.</p>
        <p className="text-sm text-slate-400 mt-1">Username: {userName}</p>
      </div>
    );
  }

  const handleMakePayment = () => {
    showNotification('Payment initiated! Please complete the payment process.', 'info');
  };

  const handleDownloadReport = () => {
    showNotification('Report downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="text-indigo-200 mt-1">Welcome back, {student.name}</p>
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
                <p className="text-sm text-indigo-200">Attendance</p>
                <p className="font-bold">{student.attendanceRate || 0}%</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-indigo-200">Status</p>
                <p className="font-bold">{student.status || 'Active'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadReport}
              className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-300" /> Report
            </button>
            <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
              <p className="text-sm text-emerald-300">Active Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - GPA removed */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <p className="text-sm text-slate-500">Courses</p>
          <p className="text-2xl font-bold text-slate-900">{studentGrades.length}</p>
          <p className="text-xs text-slate-500">Enrolled this term</p>
        </div>
        <div
          onClick={() => showNotification('Attendance details opened!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <p className="text-sm text-slate-500">Attendance</p>
          <p className="text-2xl font-bold text-slate-900">{student.attendanceRate || 0}%</p>
          <p className="text-xs text-emerald-500">↑ 2% improvement</p>
        </div>
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <p className="text-sm text-slate-500">Assignments</p>
          <p className="text-2xl font-bold text-slate-900">{studentGrades.filter((g: any) => g.assessmentType === 'Assignment').length}</p>
          <p className="text-xs text-slate-500">Pending submission</p>
        </div>
        <div
          onClick={() => setActiveTab('tuition')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
        >
          <p className="text-sm text-slate-500">Tuition Paid</p>
          <p className="text-2xl font-bold text-emerald-600">${totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Balance: ${student.tuitionBalance || 0}</p>
        </div>
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

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> My Grades
            </h3>
            <span className="text-sm text-slate-500">Total: {studentGrades.length} grades</span>
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
                          grade.grade === 'A' || grade.grade === 'A-' ? 'bg-green-100 text-green-700' :
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
                {timetable.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No timetable available yet.
                    </td>
                  </tr>
                ) : (
                  timetable.map((slot: any) => (
                    <tr key={slot.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{slot.day}</td>
                      <td className="px-4 py-3">{slot.time}</td>
                      <td className="px-4 py-3">{slot.subject}</td>
                      <td className="px-4 py-3">{slot.teacherName || 'N/A'}</td>
                      <td className="px-4 py-3">{slot.classroom || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                <p className="text-xl font-bold text-slate-900">${student.tuitionTotal?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Amount Paid</p>
                <p className="text-xl font-bold text-emerald-600">${student.tuitionPaid?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Balance</p>
                <p className={`text-xl font-bold ${student.tuitionBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${student.tuitionBalance?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            {student.tuitionBalance > 0 && (
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
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
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
                    selectedGrade.grade === 'A' || selectedGrade.grade === 'A-' ? 'text-green-600' :
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
    </div>
  );
}