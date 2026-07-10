import React, { useState } from 'react';
import {
  FileText, GraduationCap, Users, Plus, Search, Filter,
  CheckCircle, XCircle, Clock, Calendar, Download, Printer,
  Eye, Edit, Trash2, Award, BookOpen, UserPlus, Mail,
  Phone, MapPin, AlertCircle, ChevronRight, BarChart3,
  CreditCard, DollarSign, UserCheck, Send, X
} from 'lucide-react';

interface RegistrarModuleProps {
  userName: string;
  students: any[];
  admissions: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onAddTransaction?: (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => void;
  onAddStudent?: (student: any) => void;
}

export default function RegistrarModule({
  userName,
  students = [],
  admissions = [],
  transactions = [],
  showNotification,
  onAddTransaction,
  onAddStudent
}: RegistrarModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingAdmissions = admissions.filter((a: any) => a.status === 'Pending').length;
  const acceptedAdmissions = admissions.filter((a: any) => a.status === 'Accepted').length;
  const enrolledAdmissions = admissions.filter((a: any) => a.status === 'Enrolled').length;
  const declinedAdmissions = admissions.filter((a: any) => a.status === 'Declined').length;
  const paymentPendingAdmissions = admissions.filter((a: any) => a.status === 'PaymentPending').length;

  const handleAddStudent = () => {
    setModalType('addStudent');
    setModalData({ name: '', email: '', grade: 'Grade 11', parentName: '', parentEmail: '' });
    setShowModal(true);
  };

  const handleSaveStudent = () => {
    if (onAddStudent) {
      onAddStudent(modalData);
    }
    showNotification(`Student ${modalData.name} enrolled successfully!`, 'success');
    setShowModal(false);
  };

  // View Admission Details
  const handleViewAdmission = (admission: any) => {
    setSelectedAdmission(admission);
    setModalType('viewAdmission');
    setShowModal(true);
  };

  // Process Application - Send to Finance for Fee Check
  const handleProcessApplication = (id: string, name: string) => {
    const admission = admissions.find((a: any) => a.id === id);
    if (!admission) return;

    // Update admission status to "PaymentPending"
    const updatedAdmissions = admissions.map((a: any) =>
      a.id === id ? { ...a, status: 'PaymentPending', processedDate: new Date().toLocaleDateString() } : a
    );
    // In a real app, this would be saved to state
    // setAdmissions(updatedAdmissions);

    showNotification(
      `Application for ${name} has been sent to Finance for fee assessment.`,
      'info'
    );
  };

  // Finance Approval - Called from Finance Module
  const handleFinanceApprove = (id: string, amount: number) => {
    const admission = admissions.find((a: any) => a.id === id);
    if (!admission) return;

    // Record the fee payment transaction
    if (onAddTransaction) {
      onAddTransaction(
        amount,
        'Income',
        'Tuition',
        `Registration fee for ${admission.candidateName}`,
        'BankTransfer'
      );
    }

    // Update admission status to "Accepted"
    const updatedAdmissions = admissions.map((a: any) =>
      a.id === id ? {
        ...a,
        status: 'Accepted',
        feePaid: amount,
        feePaidDate: new Date().toLocaleDateString(),
        approvedByFinance: true
      } : a
    );
    // In a real app, this would be saved to state
    // setAdmissions(updatedAdmissions);

    showNotification(
      `Fee of $${amount} received for ${admission.candidateName}. Application approved!`,
      'success'
    );
  };

  // Final Registration - Enroll Student (UPDATED to create student and parent users)
  const handleFinalizeRegistration = (id: string, name: string) => {
    const admission = admissions.find((a: any) => a.id === id);
    if (!admission) return;

    if (window.confirm(`Finalize registration for ${name}? This will create a student record and login credentials for both student and parent.`)) {
      // Create student record with parent info for user creation
      const studentData = {
        name: admission.candidateName,
        email: admission.email,
        grade: admission.gradeApplied,
        parentName: admission.parentName,
        parentEmail: admission.email, // Using the same email as parent if not provided separately
        admissionNo: `ADM${Date.now().toString().slice(-6)}`,
        status: 'Active',
        gpa: 0,
        attendanceRate: 0,
        tuitionBalance: 0
      };

      if (onAddStudent) {
        onAddStudent(studentData);
      }

      // Update admission status to "Enrolled"
      const updatedAdmissions = admissions.map((a: any) =>
        a.id === id ? { ...a, status: 'Enrolled', enrolledDate: new Date().toLocaleDateString() } : a
      );
      // In a real app, this would be saved to state
      // setAdmissions(updatedAdmissions);

      showNotification(
        `${name} has been successfully enrolled! Welcome to the school! Login credentials have been created for both student and parent.`,
        'success'
      );
      setShowModal(false);
    }
  };

  // Reject Application
  const handleRejectApplication = (id: string, name: string) => {
    if (window.confirm(`Reject ${name}'s application?`)) {
      const updatedAdmissions = admissions.map((a: any) =>
        a.id === id ? { ...a, status: 'Declined', declinedDate: new Date().toLocaleDateString() } : a
      );
      // In a real app, this would be saved to state
      // setAdmissions(updatedAdmissions);
      showNotification(`${name}'s application has been rejected.`, 'error');
    }
  };

  // Get filtered admissions
  const getFilteredAdmissions = () => {
    if (!searchQuery) return admissions;
    return admissions.filter((a: any) =>
      a.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'PaymentPending': 'bg-blue-100 text-blue-700',
      'Accepted': 'bg-green-100 text-green-700',
      'Enrolled': 'bg-purple-100 text-purple-700',
      'Declined': 'bg-red-100 text-red-700',
      'Waitlisted': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'PaymentPending': return <DollarSign className="h-4 w-4" />;
      case 'Accepted': return <CheckCircle className="h-4 w-4" />;
      case 'Enrolled': return <UserCheck className="h-4 w-4" />;
      case 'Declined': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Registrar Dashboard</h2>
            <p className="text-sky-200 mt-1">Student Admissions & Records Management</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-sky-200">Total Students</p>
                <p className="font-bold">{students.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-sky-200">Pending</p>
                <p className="font-bold text-yellow-300">{pendingAdmissions}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-sky-200">Payment Pending</p>
                <p className="font-bold text-blue-300">{paymentPendingAdmissions}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-sky-200">Accepted</p>
                <p className="font-bold text-green-300">{acceptedAdmissions}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-sky-200">Enrolled</p>
                <p className="font-bold text-purple-300">{enrolledAdmissions}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddStudent}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 transition-all" onClick={() => setActiveTab('admissions')}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Applications</p>
            <FileText className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{admissions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 transition-all" onClick={() => setActiveTab('admissions')}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending Review</p>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingAdmissions}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 transition-all" onClick={() => setActiveTab('admissions')}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Payment Pending</p>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{paymentPendingAdmissions}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 transition-all" onClick={() => setActiveTab('admissions')}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Accepted</p>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{acceptedAdmissions}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 transition-all" onClick={() => setActiveTab('students')}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Enrolled</p>
            <GraduationCap className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">{enrolledAdmissions}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleAddStudent}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <UserPlus className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Enroll Student</p>
        </button>
        <button
          onClick={() => setActiveTab('admissions')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">View Applications</p>
        </button>
        <button
          onClick={() => showNotification('Transcript generated successfully!', 'success')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <GraduationCap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Transcripts</p>
        </button>
        <button
          onClick={() => showNotification('Graduates list generated!', 'info')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Graduates</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Students', 'Admissions', 'Transcripts', 'Graduates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-sky-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Admissions */}
      {activeTab === 'admissions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Admission Applications
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm w-48"
                />
              </div>
              <span className="text-sm text-slate-500">{admissions.length} applications</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Candidate</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Submitted</th>
                  <th className="px-4 py-2 text-left">Fee Status</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredAdmissions().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No applications match your search.' : 'No applications found. Applications from the website will appear here.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredAdmissions().map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{app.candidateName}</td>
                      <td className="px-4 py-3">{app.gradeApplied}</td>
                      <td className="px-4 py-3">{app.parentName}</td>
                      <td className="px-4 py-3 text-slate-500">{app.submittedDate}</td>
                      <td className="px-4 py-3">
                        {app.feePaid ? (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Paid ${app.feePaid}
                          </span>
                        ) : app.status === 'PaymentPending' ? (
                          <span className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting Payment
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusBadge(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewAdmission(app)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                          >
                            <Eye className="h-3 w-3 inline" /> View
                          </button>

                          {app.status === 'Pending' && (
                            <button
                              onClick={() => handleProcessApplication(app.id, app.candidateName)}
                              className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 cursor-pointer"
                            >
                              <Send className="h-3 w-3 inline" /> Send to Finance
                            </button>
                          )}

                          {app.status === 'PaymentPending' && (
                            <button
                              onClick={() => {
                                const amount = prompt('Enter fee amount paid (USD):', '100');
                                if (amount && !isNaN(Number(amount))) {
                                  handleFinanceApprove(app.id, Number(amount));
                                }
                              }}
                              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 cursor-pointer"
                            >
                              <DollarSign className="h-3 w-3 inline" /> Record Payment
                            </button>
                          )}

                          {app.status === 'Accepted' && (
                            <button
                              onClick={() => handleFinalizeRegistration(app.id, app.candidateName)}
                              className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 cursor-pointer"
                            >
                              <UserCheck className="h-3 w-3 inline" /> Enroll
                            </button>
                          )}

                          {(app.status === 'Pending' || app.status === 'PaymentPending') && (
                            <button
                              onClick={() => handleRejectApplication(app.id, app.candidateName)}
                              className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 cursor-pointer"
                            >
                              <XCircle className="h-3 w-3 inline" /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students List */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Student Directory
            </h3>
            <button
              onClick={handleAddStudent}
              className="text-sm text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Enroll Student
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
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No students enrolled yet. Applications must be approved and finalized first.
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">{student.admissionNo || 'N/A'}</td>
                      <td className="px-4 py-3">{student.grade || 'N/A'}</td>
                      <td className="px-4 py-3">{student.parentName || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {student.status || 'Active'}
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

      {/* View Admission Modal */}
      {showModal && modalType === 'viewAdmission' && selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Application Details</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Candidate Name</p>
                  <p className="font-bold">{selectedAdmission.candidateName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Grade Applied</p>
                  <p className="font-bold">{selectedAdmission.gradeApplied}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Parent Name</p>
                  <p className="font-bold">{selectedAdmission.parentName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-bold text-sm">{selectedAdmission.email}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-bold">{selectedAdmission.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Submitted Date</p>
                  <p className="font-bold">{selectedAdmission.submittedDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 inline-flex mt-1 ${getStatusBadge(selectedAdmission.status)}`}>
                    {getStatusIcon(selectedAdmission.status)}
                    {selectedAdmission.status}
                  </span>
                </div>
                {selectedAdmission.feePaid && (
                  <div className="bg-emerald-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Fee Paid</p>
                    <p className="font-bold text-emerald-600">${selectedAdmission.feePaid}</p>
                    <p className="text-xs text-slate-400">Paid on: {selectedAdmission.feePaidDate}</p>
                  </div>
                )}
                {selectedAdmission.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="text-sm">{selectedAdmission.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                {selectedAdmission.status === 'Pending' && (
                  <button
                    onClick={() => {
                      handleProcessApplication(selectedAdmission.id, selectedAdmission.candidateName);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" /> Send to Finance
                  </button>
                )}
                {selectedAdmission.status === 'PaymentPending' && (
                  <button
                    onClick={() => {
                      const amount = prompt('Enter fee amount paid (USD):', '100');
                      if (amount && !isNaN(Number(amount))) {
                        handleFinanceApprove(selectedAdmission.id, Number(amount));
                        setShowModal(false);
                      }
                    }}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="h-4 w-4" /> Record Payment
                  </button>
                )}
                {selectedAdmission.status === 'Accepted' && (
                  <button
                    onClick={() => {
                      handleFinalizeRegistration(selectedAdmission.id, selectedAdmission.candidateName);
                    }}
                    className="flex-1 bg-purple-500 text-white py-2 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" /> Enroll Student
                  </button>
                )}
                {(selectedAdmission.status === 'Pending' || selectedAdmission.status === 'PaymentPending') && (
                  <button
                    onClick={() => {
                      handleRejectApplication(selectedAdmission.id, selectedAdmission.candidateName);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" /> Reject Application
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && modalType === 'addStudent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Enroll New Student</h3>
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
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade</label>
                <select
                  value={modalData.grade}
                  onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
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
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Parent Email</label>
                <input
                  type="email"
                  value={modalData.parentEmail}
                  onChange={(e) => setModalData({ ...modalData, parentEmail: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">If provided, a parent user account will be created automatically.</p>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
              >
                Enroll Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}