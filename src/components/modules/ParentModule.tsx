// ParentModule.tsx - Fixed Version

import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, BookOpen, Calendar, Clock, DollarSign,
  User, Mail, Phone, MapPin, Heart, Award, Star, TrendingUp,
  TrendingDown, Percent, FileText, CheckCircle, AlertCircle,
  MessageSquare, Bell, Download, Printer, Eye, CreditCard, X,
  Plus, UserPlus, Edit, Trash2, Search, Filter, ChevronRight,
  BarChart3, Activity, PieChart, Settings, UserCog, LogOut,
  Send, Paperclip, Upload, Building2, KeyRound, Save,
  CreditCard as CreditCardIcon, Banknote, Wallet, UploadCloud,
  FileCheck, ReceiptText, Loader2, School
} from 'lucide-react';

interface ParentModuleProps {
  userName: string;
  students: any[];
  grades: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onAddStudent?: (student: any) => void;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
  schoolId?: string;
  schoolName?: string;
  teachers?: any[];
  subjects?: any[];
}

export default function ParentModule({
  userName,
  students = [],
  grades = [],
  transactions = [],
  showNotification,
  onAddStudent,
  registeredUsers = [],
  setRegisteredUsers,
  schoolId = '',
  schoolName = '',
  teachers = [],
  subjects = []
}: ParentModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Payment-related states
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('BankTransfer');
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentReceiptName, setPaymentReceiptName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [selectedGradeFees, setSelectedGradeFees] = useState<Record<string, number>>({});
  const [paymentNotes, setPaymentNotes] = useState('');

  // Communication states
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [communicationFiles, setCommunicationFiles] = useState<File[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Find children linked to this parent
  const children = students.filter((s: any) => {
    if (s.parentEmail && s.parentEmail.toLowerCase() === userName.toLowerCase()) {
      return true;
    }
    if (s.parentName && s.parentName.toLowerCase() === userName.toLowerCase()) {
      return true;
    }
    return false;
  });

  // Get the parent user record
  const parentUser = registeredUsers.find((u: any) =>
    u.email.toLowerCase() === userName.toLowerCase() || u.name === userName
  );

  // Get current user for email
  const currentUser = registeredUsers.find((u: any) =>
    u.email.toLowerCase() === userName.toLowerCase() || u.name === userName
  );

  // Load fee structures
  useEffect(() => {
    loadFeeStructures();
  }, [schoolId]);

  const loadFeeStructures = () => {
    try {
      const saved = localStorage.getItem('safari_fee_structures');
      const allFees = saved ? JSON.parse(saved) : [];

      // Filter by school
      let filteredFees = allFees;
      if (schoolId) {
        filteredFees = allFees.filter((f: any) => f.schoolId === schoolId || !f.schoolId);
      }

      setFeeStructures(filteredFees);
    } catch (error) {
      console.error('Error loading fee structures:', error);
      setFeeStructures([]);
    }
  };

  // Filter children by search
  const filteredChildren = children.filter((child: any) =>
    child.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.grade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalBalance = children.reduce((sum: number, c: any) => sum + (c.tuitionBalance || 0), 0);
  const totalPaid = children.reduce((sum: number, c: any) => sum + (c.tuitionPaid || 0), 0);
  const totalStudents = children.length;
  const totalAttendance = children.length > 0
    ? Math.round(children.reduce((sum: number, c: any) => sum + (c.attendanceRate || 0), 0) / children.length)
    : 0;

  // Get fee for a specific grade
  const getFeeForGrade = (grade: string) => {
    const fee = feeStructures.find((f: any) => f.grade === grade);
    return fee ? fee.totalAmount : 0;
  };

  // Calculate total for selected students - FIXED: properly calculates and updates state
  const calculateTotalAmount = () => {
    let total = 0;
    const fees: Record<string, number> = {};

    selectedStudents.forEach(studentId => {
      const student = children.find(c => c.id === studentId);
      if (student) {
        const fee = getFeeForGrade(student.grade);
        total += fee;
        fees[studentId] = fee;
      }
    });

    setSelectedGradeFees(fees);
    setPaymentAmount(total);
    return total;
  };

  // Handle student selection - FIXED: recalculates total immediately
  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
    // Recalculate total immediately - FIXED: removed setTimeout
    const total = calculateTotalAmountWithSet(newSelection);
    setPaymentAmount(total);
  };

  // Helper function to calculate total from a Set
  const calculateTotalAmountWithSet = (selection: Set<string>) => {
    let total = 0;
    const fees: Record<string, number> = {};

    selection.forEach(studentId => {
      const student = children.find(c => c.id === studentId);
      if (student) {
        const fee = getFeeForGrade(student.grade);
        total += fee;
        fees[studentId] = fee;
      }
    });

    setSelectedGradeFees(fees);
    return total;
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === children.length && children.length > 0) {
      setSelectedStudents(new Set());
      setPaymentAmount(0);
      setSelectedGradeFees({});
    } else {
      const allIds = new Set(children.map(c => c.id));
      setSelectedStudents(allIds);
      const total = calculateTotalAmountWithSet(allIds);
      setPaymentAmount(total);
    }
  };

  // Save pending payment to localStorage
  const savePendingPayment = (payment: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem('safari_pending_payments') || '[]');
      existing.push(payment);
      localStorage.setItem('safari_pending_payments', JSON.stringify(existing));

      // Also save to admissions with PaymentPending status if not already
      const admissions = JSON.parse(localStorage.getItem('safari_admissions') || '[]');
      const existingAdmission = admissions.find((a: any) => a.studentId === payment.studentId);
      if (!existingAdmission) {
        admissions.push({
          id: `ADM-${Date.now().toString().slice(-6)}`,
          candidateName: payment.studentName,
          gradeApplied: payment.grade,
          parentName: payment.parentName,
          email: payment.parentEmail,
          status: 'PaymentPending',
          submittedDate: payment.submittedDate,
          schoolId: payment.schoolId,
          schoolName: payment.schoolName,
          hasReceipt: true,
          feeAmount: payment.amount,
          receiptFiles: payment.receiptFile ? [{
            name: payment.receiptFile.name,
            type: payment.receiptFile.type,
            size: payment.receiptFile.size
          }] : [],
          studentId: payment.studentId
        });
        localStorage.setItem('safari_admissions', JSON.stringify(admissions));
      }
    } catch (error) {
      console.error('Error saving pending payment:', error);
    }
  };

  // Reset payment modal
  const resetPaymentModal = () => {
    setSelectedStudents(new Set());
    setPaymentAmount(0);
    setPaymentMethod('BankTransfer');
    setPaymentReceipt(null);
    setPaymentReceiptName('');
    setPaymentStep('select');
    setSelectedGradeFees({});
    setPaymentNotes('');
    setShowPaymentModal(false);
  };

  // Handle file upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a JPEG, PNG, or PDF file', 'error');
        return;
      }
      setPaymentReceipt(file);
      setPaymentReceiptName(file.name);
    }
  };

  // Handle payment confirmation
  const handleConfirmPayment = () => {
    if (selectedStudents.size === 0) {
      showNotification('Please select at least one student', 'error');
      return;
    }

    if (paymentAmount <= 0) {
      showNotification('Invalid payment amount', 'error');
      return;
    }

    // If payment method requires receipt (BankTransfer, Cash)
    if ((paymentMethod === 'BankTransfer' || paymentMethod === 'Cash') && !paymentReceipt) {
      showNotification('Please upload a payment receipt', 'error');
      return;
    }

    setPaymentStep('processing');
    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentStep('success');

      // Record payment for each selected student
      const studentNames: string[] = [];
      selectedStudents.forEach(studentId => {
        const student = children.find(c => c.id === studentId);
        const amount = selectedGradeFees[studentId] || 0;

        if (student && amount > 0) {
          studentNames.push(student.name);

          // Create pending payment record
          const pendingPayment = {
            id: `PAY-${Date.now().toString().slice(-6)}`,
            studentId: student.id,
            studentName: student.name,
            parentName: userName,
            parentEmail: currentUser?.email || '',
            grade: student.grade,
            amount: amount,
            paymentMethod: paymentMethod,
            receiptFile: paymentReceipt ? {
              name: paymentReceipt.name,
              type: paymentReceipt.type,
              size: paymentReceipt.size
            } : null,
            notes: paymentNotes,
            status: 'Pending',
            submittedDate: new Date().toLocaleDateString(),
            schoolId: schoolId,
            schoolName: schoolName,
            transactionId: `TXN-${Date.now().toString().slice(-6)}`
          };

          // Save to pending payments
          savePendingPayment(pendingPayment);
        }
      });

      // Notify success
      showNotification(
        `✅ Payment of ${paymentAmount} Birr submitted for: ${studentNames.join(', ')}. Awaiting finance approval.`,
        'success'
      );

      // Auto-close after 4 seconds
      setTimeout(() => {
        resetPaymentModal();
      }, 4000);
    }, 2000);
  };

  // Get grades for a specific child
  const getChildGrades = (childId: string) => {
    return grades.filter((g: any) => g.studentId === childId);
  };

  // Get transactions for a specific child
  const getChildTransactions = (childId: string) => {
    return transactions.filter((t: any) => t.studentId === childId);
  };

  // Calculate average grade for a child
  const getAverageGrade = (childId: string) => {
    const childGrades = getChildGrades(childId);
    if (childGrades.length === 0) return 'N/A';
    const avg = childGrades.reduce((sum: number, g: any) => sum + (g.numericScore || 0), 0) / childGrades.length;
    return avg.toFixed(1);
  };

  // Get real teachers for a child based on their subjects
  const getChildTeachers = (childId: string) => {
    const child = students.find((s: any) => s.id === childId);
    if (!child) return [];

    const childGrades = grades.filter((g: any) => g.studentId === childId);
    const subjectNames = [...new Set(childGrades.map((g: any) => g.subject))];
    const childTeachers: any[] = [];

    subjectNames.forEach((subjectName: string) => {
      const subject = subjects.find((s: any) => s.name === subjectName);
      if (subject && subject.teacherId) {
        const teacher = teachers.find((t: any) => t.id === subject.teacherId);
        if (teacher && teacher.approvalStatus === 'approved') {
          childTeachers.push({
            name: teacher.name,
            email: teacher.email,
            subject: subjectName,
            teacherId: teacher.id,
            subjectId: subject.id
          });
        }
      }
    });

    if (childTeachers.length === 0 && child.classId) {
      const classSubjects = subjects.filter((s: any) => s.classId === child.classId || s.grade === child.grade);
      classSubjects.forEach((subject: any) => {
        if (subject.teacherId) {
          const teacher = teachers.find((t: any) => t.id === subject.teacherId);
          if (teacher && teacher.approvalStatus === 'approved') {
            childTeachers.push({
              name: teacher.name,
              email: teacher.email,
              subject: subject.name,
              teacherId: teacher.id,
              subjectId: subject.id
            });
          }
        }
      });
    }

    return childTeachers;
  };

  // Handle child selection
  const handleSelectChild = (child: any) => {
    setSelectedChild(selectedChild?.id === child.id ? null : child);
  };

  // Handle payment - FIXED: properly initializes payment modal
  const handleMakePayment = () => {
    setSelectedStudents(new Set());
    setPaymentAmount(0);
    setPaymentMethod('BankTransfer');
    setPaymentReceipt(null);
    setPaymentReceiptName('');
    setPaymentStep('select');
    setPaymentNotes('');
    setSelectedGradeFees({});
    setShowPaymentModal(true);
  };

  // Handle communication
  const handleOpenCommunication = (child: any) => {
    const childTeachers = getChildTeachers(child.id);
    setSelectedChild(child);
    setSelectedTeacher(childTeachers.length > 0 ? childTeachers[0] : null);
    setSelectedSubject(childTeachers.length > 0 ? childTeachers[0].subject : '');
    setCommunicationMessage('');
    setCommunicationFiles([]);
    setShowCommunicationModal(true);
  };

  const handleSendCommunication = () => {
    if (!communicationMessage.trim() && communicationFiles.length === 0) {
      showNotification('Please enter a message or attach a file.', 'error');
      return;
    }

    const fileNames = communicationFiles.map(f => f.name).join(', ');
    showNotification(
      `📨 Message sent to ${selectedTeacher?.name || 'Teacher'} for ${selectedChild?.name}!\n` +
      `Subject: ${selectedSubject || 'General'}\n` +
      `Message: ${communicationMessage || 'No message'}\n` +
      `Attachments: ${fileNames || 'None'}`,
      'success'
    );

    setShowCommunicationModal(false);
    setCommunicationMessage('');
    setCommunicationFiles([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setCommunicationFiles([...communicationFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...communicationFiles];
    newFiles.splice(index, 1);
    setCommunicationFiles(newFiles);
  };

  // Handle profile update
  const handleOpenProfile = () => {
    setProfileData({
      name: parentUser?.name || '',
      email: parentUser?.email || '',
      phone: parentUser?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfileModal(true);
  };

  const handleUpdateProfile = () => {
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

      const user = registeredUsers.find((u: any) => u.email === parentUser?.email);
      if (user && user.password !== profileData.currentPassword) {
        showNotification('Current password is incorrect!', 'error');
        return;
      }

      if (setRegisteredUsers && user) {
        setRegisteredUsers(registeredUsers.map((u: any) =>
          u.email === parentUser?.email ? { ...u, password: profileData.newPassword } : u
        ));
      }
    }

    showNotification('Profile updated successfully!', 'success');
    setShowProfileModal(false);
  };

  // Handle adding a new student - FIXED: Opens enrollment form or redirects
  const handleAddStudent = () => {
    // Check if we have the onAddStudent callback
    if (onAddStudent) {
      // Open a simple enrollment form
      const name = prompt('Enter student name:');
      if (!name) return;

      const email = prompt('Enter student email:');
      if (!email) return;

      const grade = prompt('Enter grade (e.g., Grade 1, Grade 2, etc.):') || 'Grade 1';
      const parentName = prompt('Enter parent/guardian name:') || userName;

      const newStudent = {
        name: name,
        email: email,
        grade: grade,
        parentName: parentName,
        parentEmail: currentUser?.email || '',
        schoolId: schoolId,
        schoolName: schoolName,
        status: 'Active'
      };

      onAddStudent(newStudent);
      showNotification(`Student ${name} enrolled successfully!`, 'success');
    } else {
      // If no callback, show a more helpful message
      showNotification(
        '📝 To enroll a new student, please visit the school website or contact the registrar office.',
        'info'
      );
    }
  };

  // Handle downloading report
  const handleDownloadReport = (child: any) => {
    showNotification(`📄 Report for ${child.name} downloaded successfully!`, 'success');
  };

  // Handle viewing attendance
  const handleViewAttendance = (child: any) => {
    showNotification(`📅 Attendance details for ${child.name} opened!`, 'info');
  };

  // If no children, show empty state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-2xl">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Parent Dashboard</h2>
              <p className="text-amber-200 mt-1">Welcome back, {userName}</p>
              {schoolName && (
                <p className="text-amber-300 text-sm mt-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> {schoolName}
                </p>
              )}
            </div>
            <button
              onClick={handleOpenProfile}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserCog className="h-4 w-4" /> My Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Children Linked</h3>
          <p className="text-slate-500 mt-2">No children are currently linked to your account.</p>
          <p className="text-sm text-slate-400 mt-1">
            If you have children at this school, please contact the administration to link them to your account.
          </p>
          <button
            onClick={handleAddStudent}
            className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Enroll New Student
          </button>
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-amber-600" />
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
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
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
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Phone number"
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
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
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
                  className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Parent Dashboard</h2>
            <p className="text-amber-200 mt-1">Welcome back, {userName}</p>
            {schoolName && (
              <p className="text-amber-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {schoolName}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-amber-200">Children</p>
                <p className="font-bold">{totalStudents}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-amber-200">Total Balance</p>
                <p className="font-bold">${totalBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-amber-200">Total Paid</p>
                <p className="font-bold text-green-300">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-amber-200">Avg Attendance</p>
                <p className="font-bold">{totalAttendance}%</p>
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
              onClick={handleMakePayment}
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" /> Make Payment
            </button>
            <button
              onClick={handleAddStudent}
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Enroll Student
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Children</p>
              <p className="text-xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Paid</p>
              <p className="text-xl font-bold text-emerald-600">${totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Balance Due</p>
              <p className={`text-xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${totalBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Attendance</p>
              <p className="text-xl font-bold text-purple-600">{totalAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search children by name, grade, or admission number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
        />
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChildren.map((child: any) => {
          const childGrades = getChildGrades(child.id);
          const avgGrade = getAverageGrade(child.id);
          const childTransactions = getChildTransactions(child.id);
          const childTeachers = getChildTeachers(child.id);

          return (
            <div
              key={child.id}
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer ${
                selectedChild?.id === child.id
                  ? 'border-amber-500 shadow-md'
                  : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{child.name}</h3>
                    <p className="text-sm text-slate-500">{child.grade} • Section {child.classSection || 'A'}</p>
                    <p className="text-xs text-slate-400">Admission: {child.admissionNo || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    child.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {child.status || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-slate-500">GPA</p>
                    <p className="font-bold text-slate-900">{child.gpa || child.cgpa || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Avg Grade</p>
                    <p className="font-bold text-slate-900">{avgGrade}%</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Attendance</p>
                    <p className="font-bold text-slate-900">{child.attendanceRate || 0}%</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Balance</p>
                    <p className={`font-bold ${(child.tuitionBalance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${(child.tuitionBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleSelectChild(child)}
                    className="flex-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> {selectedChild?.id === child.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => handleOpenCommunication(child)}
                    className="text-xs border border-slate-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" /> Message Teacher
                  </button>
                  <button
                    onClick={() => handleDownloadReport(child)}
                    className="text-xs border border-slate-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Report
                  </button>
                </div>

                {/* Show assigned teachers summary */}
                {childTeachers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Assigned Teachers:</p>
                    <div className="flex flex-wrap gap-1">
                      {childTeachers.slice(0, 3).map((t: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {t.name} ({t.subject})
                        </span>
                      ))}
                      {childTeachers.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                          +{childTeachers.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedChild?.id === child.id && (
                <div className="border-t border-slate-200 p-5 bg-slate-50/50">
                  {/* Teachers Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Teachers & Subjects ({childTeachers.length})
                    </h4>
                    {childTeachers.length === 0 ? (
                      <p className="text-sm text-slate-400">No teachers assigned yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {childTeachers.map((t: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{t.name}</p>
                              <p className="text-xs text-slate-500">{t.subject}</p>
                              <p className="text-xs text-slate-400">{t.email}</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedChild(child);
                                setSelectedTeacher(t);
                                setSelectedSubject(t.subject);
                                setCommunicationMessage('');
                                setCommunicationFiles([]);
                                setShowCommunicationModal(true);
                              }}
                              className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="h-3 w-3" /> Message
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grades */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      Recent Grades ({childGrades.length})
                    </h4>
                    {childGrades.length === 0 ? (
                      <p className="text-sm text-slate-400">No grades available yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 text-slate-600">
                            <tr>
                              <th className="px-3 py-1 text-left">Subject</th>
                              <th className="px-3 py-1 text-left">Grade</th>
                              <th className="px-3 py-1 text-left">Score</th>
                              <th className="px-3 py-1 text-left">Date</th>
                              <th className="px-3 py-1 text-left">Teacher</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {childGrades.slice(0, 5).map((grade: any) => {
                              const subject = subjects.find((s: any) => s.name === grade.subject);
                              const teacher = subject?.teacherId ? teachers.find((t: any) => t.id === subject.teacherId) : null;
                              return (
                                <tr key={grade.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-1.5 font-medium">{grade.subject}</td>
                                  <td className="px-3 py-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      grade.grade === 'A' || grade.grade === 'A-' ? 'bg-green-100 text-green-700' :
                                      grade.grade === 'B+' || grade.grade === 'B' || grade.grade === 'B-' ? 'bg-blue-100 text-blue-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {grade.grade || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-1.5">{grade.numericScore || 0}%</td>
                                  <td className="px-3 py-1.5 text-slate-500">{grade.date || 'N/A'}</td>
                                  <td className="px-3 py-1.5 text-xs text-slate-500">
                                    {teacher?.name || 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {childGrades.length > 5 && (
                          <p className="text-xs text-slate-400 mt-1">+ {childGrades.length - 5} more grades</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Payment History
                    </h4>
                    {childTransactions.length === 0 ? (
                      <p className="text-sm text-slate-400">No payments recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 text-slate-600">
                            <tr>
                              <th className="px-3 py-1 text-left">Date</th>
                              <th className="px-3 py-1 text-left">Description</th>
                              <th className="px-3 py-1 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {childTransactions.slice(0, 5).map((tx: any) => (
                              <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="px-3 py-1.5 text-slate-500">{tx.date || 'N/A'}</td>
                                <td className="px-3 py-1.5">{tx.description || 'N/A'}</td>
                                <td className="px-3 py-1.5 text-right font-semibold text-emerald-600">
                                  ${(tx.amount || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewAttendance(child)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="h-3 w-3" /> Attendance
                    </button>
                    <button
                      onClick={() => handleOpenCommunication(child)}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="h-3 w-3" /> Message Teacher
                    </button>
                    <button
                      onClick={handleMakePayment}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="h-3 w-3" /> Pay Tuition
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredChildren.length === 0 && searchQuery && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No children match your search.</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search terms.</p>
        </div>
      )}

      {/* Payment Modal - Enhanced with Student Selection */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                Make Tuition Payment
              </h3>
              <button
                onClick={resetPaymentModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: Select Students */}
            {paymentStep === 'select' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Select the students you want to pay tuition for. The amount is based on the fee structure set by finance.</span>
                  </p>
                </div>

                {/* Student Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Select Students</label>
                    <button
                      type="button"
                      onClick={toggleAllStudents}
                      className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                    >
                      {selectedStudents.size === children.length && children.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {children.map((student) => {
                      const fee = getFeeForGrade(student.grade);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedStudents.has(student.id)
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="h-4 w-4 accent-amber-600 cursor-pointer"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{student.name}</p>
                              <p className="text-xs text-slate-500">{student.grade} • Section {student.classSection || 'A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{fee} Birr</p>
                            <p className="text-xs text-slate-400">Fee</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {children.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No students to select</p>
                  )}
                </div>

                {/* Selected Students Summary */}
                {selectedStudents.size > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">{selectedStudents.size}</span> student(s) selected
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {children
                        .filter(c => selectedStudents.has(c.id))
                        .map(c => (
                          <span key={c.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {c.name} ({getFeeForGrade(c.grade)} Birr)
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Total Amount Display - FIXED: Shows correct total */}
                {selectedStudents.size > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-emerald-700">{paymentAmount} Birr</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Based on fee structure for selected grades
                    </p>
                  </div>
                )}

                {/* Next Button - FIXED: Enabled when students are selected and amount > 0 */}
                <button
                  onClick={() => {
                    if (selectedStudents.size === 0) {
                      showNotification('Please select at least one student', 'error');
                      return;
                    }
                    if (paymentAmount <= 0) {
                      showNotification('Invalid payment amount', 'error');
                      return;
                    }
                    setPaymentStep('confirm');
                  }}
                  disabled={selectedStudents.size === 0 || paymentAmount <= 0}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    selectedStudents.size > 0 && paymentAmount > 0
                      ? 'bg-amber-600 text-white hover:bg-amber-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Confirm Payment */}
            {paymentStep === 'confirm' && (
              <div className="space-y-4">
                {/* Payment Summary */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <p className="font-semibold text-slate-900 text-sm">Payment Summary</p>
                  {children
                    .filter(c => selectedStudents.has(c.id))
                    .map(c => (
                      <div key={c.id} className="flex justify-between text-sm border-b border-slate-200 pb-1">
                        <span>{c.name} ({c.grade})</span>
                        <span className="font-bold text-emerald-600">{selectedGradeFees[c.id] || 0} Birr</span>
                      </div>
                    ))
                  }
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300">
                    <span>Total</span>
                    <span className="text-emerald-700">{paymentAmount} Birr</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'BankTransfer', label: 'Bank Transfer', icon: Banknote },
                      { value: 'MobileMoney', label: 'Mobile Money', icon: Wallet },
                      { value: 'Card', label: 'Card Payment', icon: CreditCardIcon },
                      { value: 'Cash', label: 'Cash', icon: DollarSign },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          paymentMethod === method.value
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <method.icon className={`h-5 w-5 mx-auto mb-1 ${
                          paymentMethod === method.value ? 'text-amber-600' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          paymentMethod === method.value ? 'text-amber-700' : 'text-slate-600'
                        }`}>
                          {method.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receipt Upload for BankTransfer and Cash */}
                {(paymentMethod === 'BankTransfer' || paymentMethod === 'Cash') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Upload Payment Receipt *
                      <span className="text-xs text-slate-400 ml-2">(JPEG, PNG, PDF - Max 5MB)</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                        paymentReceipt
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-300 hover:border-amber-400'
                      }`}
                      onClick={() => document.getElementById('receiptUpload')?.click()}
                    >
                      <input
                        id="receiptUpload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      {paymentReceipt ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileCheck className="h-8 w-8 text-emerald-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                              {paymentReceiptName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(paymentReceipt.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentReceipt(null);
                              setPaymentReceiptName('');
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Click to upload receipt</p>
                          <p className="text-xs text-slate-400">Or drag and drop</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Payment Info */}
                {paymentMethod === 'Card' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm text-amber-700 flex items-start gap-2">
                      <CreditCardIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>You will be redirected to the secure payment gateway to complete your card payment.</span>
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Payment Notes (Optional)</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Any additional notes for finance..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={
                      (paymentMethod === 'BankTransfer' || paymentMethod === 'Cash') && !paymentReceipt
                    }
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                      (paymentMethod === 'BankTransfer' || paymentMethod === 'Cash') && !paymentReceipt
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:bg-amber-700 cursor-pointer'
                    }`}
                  >
                    {paymentMethod === 'Card' ? (
                      <>
                        <CreditCardIcon className="h-4 w-4" />
                        Pay {paymentAmount} Birr
                      </>
                    ) : (
                      <>
                        <ReceiptText className="h-4 w-4" />
                        Submit for Approval
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  {paymentMethod === 'BankTransfer' || paymentMethod === 'Cash'
                    ? '📋 Your payment will be verified by finance before approval.'
                    : '🔒 Your payment will be processed securely through our payment gateway.'}
                </p>
              </div>
            )}

            {/* Processing State */}
            {paymentStep === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-900">Processing Payment...</h4>
                <p className="text-slate-500 text-sm mt-2">Please wait while we process your payment.</p>
              </div>
            )}

            {/* Success State */}
            {paymentStep === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-900">Payment Submitted!</h4>
                <p className="text-slate-600 text-sm mt-2">
                  Your payment of <span className="font-bold text-emerald-600">{paymentAmount} Birr</span> has been submitted.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {paymentMethod === 'BankTransfer' || paymentMethod === 'Cash'
                    ? '📋 Awaiting finance approval.'
                    : '🔒 Payment confirmation sent to finance.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {children
                    .filter(c => selectedStudents.has(c.id))
                    .map(c => (
                      <span key={c.id} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {c.name}
                      </span>
                    ))
                  }
                </div>
                <button
                  onClick={resetPaymentModal}
                  className="mt-4 px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && selectedChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Send Message to Teacher
              </h3>
              <button
                onClick={() => { setShowCommunicationModal(false); setSelectedChild(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Student:</span> {selectedChild.name} ({selectedChild.grade} - Section {selectedChild.classSection || 'A'})
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-medium">School:</span> {schoolName || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Teacher *</label>
                <select
                  value={selectedTeacher?.teacherId || ''}
                  onChange={(e) => {
                    const childTeachers = getChildTeachers(selectedChild.id);
                    const teacher = childTeachers.find(t => t.teacherId === e.target.value);
                    setSelectedTeacher(teacher || null);
                    setSelectedSubject(teacher?.subject || '');
                  }}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select a teacher...</option>
                  {getChildTeachers(selectedChild.id).map((teacher, idx) => (
                    <option key={idx} value={teacher.teacherId}>
                      {teacher.name} ({teacher.subject})
                    </option>
                  ))}
                </select>
                {getChildTeachers(selectedChild.id).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No teachers assigned to this student yet. Please contact the school administration.
                  </p>
                )}
              </div>

              {selectedTeacher && (
                <div className="bg-blue-50 p-2 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Subject:</span> {selectedSubject || selectedTeacher.subject}
                  </p>
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Teacher Email:</span> {selectedTeacher.email}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                <textarea
                  value={communicationMessage}
                  onChange={(e) => setCommunicationMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Type your message here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attachments</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Click to upload files
                  </label>
                  <p className="text-xs text-slate-400 mt-1">Supported: PDF, Word, Excel, Images</p>
                </div>

                {communicationFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {communicationFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-slate-400" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSendCommunication}
                  disabled={!selectedTeacher}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTeacher
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
                <button
                  onClick={() => { setShowCommunicationModal(false); setSelectedChild(null); }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-amber-600" />
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
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
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
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Phone number"
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
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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