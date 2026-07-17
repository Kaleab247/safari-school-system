// RegistrarModule.tsx - Complete Version with Fixed Credential Saving

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, GraduationCap, Users, Plus, Search, Filter,
  CheckCircle, XCircle, Clock, Calendar, Download, Printer,
  Eye, Edit, Trash2, Award, BookOpen, UserPlus, Mail,
  Phone, MapPin, AlertCircle, ChevronRight, BarChart3,
  CreditCard, DollarSign, UserCheck, Send, X,
  Building2, RefreshCw, Save, User, KeyRound, Shield,
  Upload, File, Image, Paperclip, Loader2, ChevronDown,
  Settings, UserCog, Briefcase, School, BookMarked,
  UserRound, AlertTriangle, Trophy, Star, Medal,
  Users as UsersIcon, Clipboard, FileSpreadsheet,
  ExternalLink, Printer as PrinterIcon, Check,
  ArrowRight, ChevronLeft, Menu, LogOut, Bell,
  Home, PieChart, Activity, TrendingUp, TrendingDown,
  Percent, Calendar as CalendarIcon, Clock as ClockIcon,
  Receipt, Wallet
} from 'lucide-react';

interface RegistrarModuleProps {
  userName: string;
  students: any[];
  admissions: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onAddTransaction?: (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => void;
  onAddStudent?: (student: any) => void;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
  schoolId?: string;
  schoolName?: string;
  teachers?: any[];
  grades?: any[];
  subjects?: any[];
}

// Grade levels
const GRADE_LEVELS = [
  'PreKG', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

// Sections
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Student Statuses
const STUDENT_STATUSES = [
  'Active',
  'Pending Admission',
  'Enrolled',
  'Suspended',
  'Graduated',
  'Withdrawn',
  'Transferred',
  'Expelled',
  'Alumni'
];

// Document Types
const DOCUMENT_TYPES = [
  'Birth Certificate',
  'National ID/Passport',
  'Previous Transcripts',
  'Transfer Certificate',
  'Medical Records',
  'Passport Photos',
  'Immunization Records',
  'Parent ID',
  'Report Card',
  'Recommendation Letter'
];

export default function RegistrarModule({
  userName,
  students = [],
  admissions = [],
  transactions = [],
  showNotification,
  onAddTransaction,
  onAddStudent,
  registeredUsers = [],
  setRegisteredUsers,
  schoolId = '',
  schoolName = '',
  teachers = [],
  grades = [],
  subjects = []
}: RegistrarModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsData, setCredentialsData] = useState<any>(null);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);

  // ============================================================
  // LOAD FEE STRUCTURES
  // ============================================================
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

  // ============================================================
  // GET FEE FOR GRADE
  // ============================================================
  const getFeeForGrade = (grade: string) => {
    const fee = feeStructures.find((f: any) => f.grade === grade);
    return fee ? fee.totalAmount : 0;
  };

  // ============================================================
  // GENERATE STUDENT ID
  // ============================================================
  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = students.length + 1;
    return `STU${year}${String(count).padStart(4, '0')}`;
  };

  const generateAdmissionNo = () => {
    const year = new Date().getFullYear();
    const count = admissions.length + 1;
    return `ADM${year}${String(count).padStart(4, '0')}`;
  };

  // Filter students
  const pendingAdmissions = admissions.filter((a: any) => a.status === 'Pending').length;
  const acceptedAdmissions = admissions.filter((a: any) => a.status === 'Accepted').length;
  const enrolledAdmissions = admissions.filter((a: any) => a.status === 'Enrolled').length;
  const declinedAdmissions = admissions.filter((a: any) => a.status === 'Declined').length;
  const paymentPendingAdmissions = admissions.filter((a: any) => a.status === 'PaymentPending').length;

  // Students by status
  const activeStudents = students.filter((s: any) => s.status === 'Active' || s.status === 'Enrolled');
  const suspendedStudents = students.filter((s: any) => s.status === 'Suspended');
  const graduatedStudents = students.filter((s: any) => s.status === 'Graduated');
  const transferredStudents = students.filter((s: any) => s.status === 'Transferred');
  const withdrawnStudents = students.filter((s: any) => s.status === 'Withdrawn');

  // ============================================================
  // ENROLL STUDENT - WITH AUTO-FILLED GRADE & FEE FROM FINANCE
  // ============================================================
  const handleEnrollStudent = (pendingStudent: any) => {
    // Get the grade from the admission application
    const gradeFromAdmission = pendingStudent.gradeApplied || pendingStudent.grade || 'PreKG';

    // Get the fee from finance structure based on the grade
    const feeAmount = getFeeForGrade(gradeFromAdmission);

    // Get the fee paid from the admission record (from finance)
    const feePaid = pendingStudent.feePaid || pendingStudent.feeAmount || 0;

    setModalType('enrollStudent');
    setModalData({
      ...pendingStudent,
      grade: gradeFromAdmission,  // Auto-filled from admission
      section: 'A',               // Registrar chooses section
      classId: '',
      admissionNo: generateAdmissionNo(),
      studentId: generateStudentId(),
      feeAmount: feeAmount,       // From finance fee structure
      feePaid: feePaid,           // From finance payment record
      feeBalance: feeAmount - feePaid, // Calculated balance
      previousSchool: pendingStudent.previousSchool || '',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // ============================================================
  // FIXED: ENROLL STUDENT - WITH PROPER CREDENTIAL SAVING
  // ============================================================
  const handleSaveEnrollment = () => {
    if (!modalData.name?.trim() || !modalData.email?.trim()) {
      showNotification('Student name and email are required!', 'error');
      return;
    }

    if (!modalData.parentName?.trim()) {
      showNotification('Parent name is required!', 'error');
      return;
    }

    if (!modalData.parentEmail?.trim()) {
      showNotification('Parent email is required!', 'error');
      return;
    }

    setIsSubmitting(true);

    // ============================================================
    // CRITICAL FIX: Generate the student ID FIRST
    // ============================================================
    const newStudentId = modalData.studentId || generateStudentId();
    const newAdmissionNo = modalData.admissionNo || generateAdmissionNo();

    // Create the student
    const newStudent = {
      id: `STU-${Date.now().toString().slice(-6)}`,
      admissionNo: newAdmissionNo,
      studentId: newStudentId,
      name: modalData.name.trim(),
      grade: modalData.grade || 'PreKG',
      classSection: modalData.section || 'A',
      classId: modalData.classId || '',
      email: modalData.email.trim().toLowerCase(),
      phone: modalData.phone || '',
      parentName: modalData.parentName.trim(),
      parentEmail: modalData.parentEmail.trim().toLowerCase(),
      attendanceRate: 0,
      tuitionTotal: modalData.feeAmount || 0,
      tuitionPaid: modalData.feePaid || 0,
      tuitionBalance: (modalData.feeAmount || 0) - (modalData.feePaid || 0),
      status: 'Enrolled',
      schoolId: schoolId,
      schoolName: schoolName,
      disciplinaryRecords: [],
      documents: [],
      emergencyContacts: [],
      previousSchool: modalData.previousSchool || '',
      enrollmentDate: modalData.enrollmentDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ============================================================
    // CRITICAL FIX: Generate passwords using the NEW student ID
    // ============================================================
    // Use the actual student ID that was assigned
    const idForPassword = newStudentId.slice(-6); // Get last 6 chars of student ID
    const studentPassword = `STU${idForPassword}`;
    const parentPassword = `PAR${idForPassword}`;

    console.log('🔑 Generated passwords:', {
      student: { email: newStudent.email, password: studentPassword },
      parent: { email: newStudent.parentEmail, password: parentPassword }
    });
    console.log('🔑 Using student ID for passwords:', newStudentId);

    const createdUsers = [];
    let updatedUsers = [...registeredUsers];

    // ============================================================
    // Create STUDENT user account with proper saving
    // ============================================================
    if (newStudent.email) {
      const studentExists = updatedUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.email.toLowerCase()
      );

      if (!studentExists) {
        const studentUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: newStudent.name,
          email: newStudent.email.toLowerCase(),
          password: studentPassword,  // ✅ Password is set
          role: 'student' as const,
          schoolId: schoolId,
          schoolName: schoolName,
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };

        updatedUsers = [...updatedUsers, studentUser];
        createdUsers.push({ type: 'Student', ...studentUser });
        console.log('✅ Student user created:', studentUser.email, studentUser.password);
      } else {
        // Update existing user with correct password
        updatedUsers = updatedUsers.map((u: any) => {
          if (u.email.toLowerCase() === newStudent.email.toLowerCase()) {
            return {
              ...u,
              password: studentPassword,  // ✅ Update password
              associatedId: newStudent.id
            };
          }
          return u;
        });
        createdUsers.push({
          type: 'Student',
          name: newStudent.name,
          email: newStudent.email,
          password: studentPassword,
          updated: true
        });
        console.log('✅ Student user updated:', newStudent.email, studentPassword);
      }
    }

    // ============================================================
    // Create PARENT user account with proper saving
    // ============================================================
    if (newStudent.parentEmail) {
      const parentExists = updatedUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.parentEmail.toLowerCase()
      );

      if (!parentExists) {
        const parentUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: newStudent.parentName || `${newStudent.name}'s Parent`,
          email: newStudent.parentEmail.toLowerCase(),
          password: parentPassword,  // ✅ Password is set
          role: 'parent' as const,
          schoolId: schoolId,
          schoolName: schoolName,
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };

        updatedUsers = [...updatedUsers, parentUser];
        createdUsers.push({ type: 'Parent', ...parentUser });
        console.log('✅ Parent user created:', parentUser.email, parentUser.password);
      } else {
        // Update existing user with correct password
        updatedUsers = updatedUsers.map((u: any) => {
          if (u.email.toLowerCase() === newStudent.parentEmail.toLowerCase()) {
            return {
              ...u,
              password: parentPassword,  // ✅ Update password
              associatedId: newStudent.id
            };
          }
          return u;
        });
        createdUsers.push({
          type: 'Parent',
          name: newStudent.parentName,
          email: newStudent.parentEmail,
          password: parentPassword,
          updated: true
        });
        console.log('✅ Parent user updated:', newStudent.parentEmail, parentPassword);
      }
    }

    // ============================================================
    // Save to BOTH state AND localStorage
    // ============================================================

    // 1. Update state
    if (setRegisteredUsers) {
      setRegisteredUsers(updatedUsers);
    }

    // 2. Save directly to localStorage
    try {
      localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
      console.log('✅ Users saved to localStorage. Total users:', updatedUsers.length);

      // Log all users for debugging
      console.log('📋 All registered users:', updatedUsers.map((u: any) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password
      })));
    } catch (e) {
      console.error('❌ Error saving users to localStorage:', e);
    }

    // ============================================================
    // Save the student to localStorage
    // ============================================================
    if (onAddStudent) {
      onAddStudent(newStudent);
    } else {
      try {
        const allStudents = JSON.parse(localStorage.getItem('safari_students') || '[]');
        allStudents.push(newStudent);
        localStorage.setItem('safari_students', JSON.stringify(allStudents));
        console.log('✅ Student saved to localStorage:', newStudent.name);
      } catch (e) {
        console.error('❌ Error saving student:', e);
      }
    }

    // Remove from pending students if exists
    const allPending = JSON.parse(localStorage.getItem('safari_pending_students') || '[]');
    const updatedPending = allPending.filter((s: any) => s.id !== modalData.id);
    localStorage.setItem('safari_pending_students', JSON.stringify(updatedPending));

    // Update the admission status to Enrolled
    const allAdmissions = JSON.parse(localStorage.getItem('safari_admissions') || '[]');
    const updatedAdmissions = allAdmissions.map((a: any) => {
      if (a.id === modalData.id || a.candidateName === modalData.name) {
        return { ...a, status: 'Enrolled', enrolledDate: new Date().toISOString() };
      }
      return a;
    });
    localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));

    // ============================================================
    // Verify credentials were saved
    // ============================================================
    const verifyUsers = JSON.parse(localStorage.getItem('safari_registered_users') || '[]');
    console.log('🔍 Verifying saved users:');
    createdUsers.forEach((u: any) => {
      const found = verifyUsers.find((v: any) => v.email === u.email);
      if (found) {
        console.log(`✅ Verified: ${u.email} exists with password: ${found.password}`);
      } else {
        console.error(`❌ ERROR: ${u.email} NOT FOUND in localStorage!`);
      }
    });

    // Build success message with credentials
    let successMsg = `✅ Student ${newStudent.name} enrolled successfully!\n`;
    successMsg += `📋 Student ID: ${newStudent.studentId}\n`;
    successMsg += `📋 Admission No: ${newStudent.admissionNo}\n`;
    successMsg += `📋 Grade: ${newStudent.grade} - Section ${newStudent.classSection}\n`;
    successMsg += `💰 Fee Paid: ${newStudent.tuitionPaid} Birr / Total: ${newStudent.tuitionTotal} Birr\n`;

    if (createdUsers.length > 0) {
      successMsg += `\n🔑 Login credentials created:\n`;
      createdUsers.forEach((u: any) => {
        const status = u.updated ? ' (updated)' : '';
        successMsg += `\n${u.type}: ${u.email} / Password: ${u.password}${status}`;
      });
    }

    // Store credentials for modal
    const studentCred = createdUsers.find((u: any) => u.type === 'Student');
    const parentCred = createdUsers.find((u: any) => u.type === 'Parent');

    setCredentialsData({
      student: studentCred ? {
        name: studentCred.name,
        email: studentCred.email,
        password: studentCred.password
      } : (newStudent.email ? {
        name: newStudent.name,
        email: newStudent.email,
        password: studentPassword
      } : null),
      parent: parentCred ? {
        name: parentCred.name,
        email: parentCred.email,
        password: parentCred.password
      } : (newStudent.parentEmail ? {
        name: newStudent.parentName || `${newStudent.name}'s Parent`,
        email: newStudent.parentEmail,
        password: parentPassword
      } : null),
      studentName: newStudent.name,
      grade: newStudent.grade,
      studentId: newStudent.studentId,
      admissionNo: newStudent.admissionNo,
      feePaid: newStudent.tuitionPaid,
      feeTotal: newStudent.tuitionTotal
    });

    showNotification(successMsg, 'success');

    // Show credentials modal
    if (createdUsers.length > 0) {
      setShowCredentialsModal(true);
    }

    setShowModal(false);
    setModalData({});
    setIsSubmitting(false);
  };

  // ============================================================
  // STUDENT MANAGEMENT FUNCTIONS
  // ============================================================

  // Transfer Student
  const handleTransferStudent = (student: any) => {
    setSelectedStudent(student);
    setModalData({
      studentId: student.id,
      studentName: student.name,
      currentGrade: student.grade,
      currentSection: student.classSection,
      newGrade: student.grade,
      newSection: student.classSection,
      transferReason: '',
      newSchool: ''
    });
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = () => {
    if (!modalData.newGrade && !modalData.newSchool) {
      showNotification('Please select a new grade or enter a new school.', 'error');
      return;
    }

    // Update student
    const updatedStudents = students.map((s: any) => {
      if (s.id === modalData.studentId) {
        return {
          ...s,
          grade: modalData.newGrade || s.grade,
          classSection: modalData.newSection || s.classSection,
          status: modalData.newSchool ? 'Transferred' : s.status,
          previousSchool: s.schoolName,
          transferDate: new Date().toISOString(),
          transferReason: modalData.transferReason,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    try {
      localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
    } catch (e) {
      console.error('Error saving students:', e);
    }

    showNotification(
      `✅ Student ${modalData.studentName} has been ${modalData.newSchool ? 'transferred to ' + modalData.newSchool : 'moved to ' + modalData.newGrade + ' Section ' + modalData.newSection}!`,
      'success'
    );
    setShowTransferModal(false);
    setModalData({});
  };

  // Suspend Student
  const handleSuspendStudent = (student: any) => {
    if (window.confirm(`Are you sure you want to suspend ${student.name}?`)) {
      const updatedStudents = students.map((s: any) => {
        if (s.id === student.id) {
          return {
            ...s,
            status: 'Suspended',
            suspensionDate: new Date().toISOString(),
            suspensionReason: prompt('Reason for suspension:') || '',
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });

      try {
        localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
      } catch (e) {
        console.error('Error saving students:', e);
      }

      showNotification(`⚠️ Student ${student.name} has been suspended.`, 'info');
    }
  };

  // Withdraw Student
  const handleWithdrawStudent = (student: any) => {
    if (window.confirm(`Are you sure you want to withdraw ${student.name}?`)) {
      const updatedStudents = students.map((s: any) => {
        if (s.id === student.id) {
          return {
            ...s,
            status: 'Withdrawn',
            withdrawalDate: new Date().toISOString(),
            withdrawalReason: prompt('Reason for withdrawal:') || '',
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });

      try {
        localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
      } catch (e) {
        console.error('Error saving students:', e);
      }

      showNotification(`📤 Student ${student.name} has been withdrawn.`, 'info');
    }
  };

  // Reactivate Student
  const handleReactivateStudent = (student: any) => {
    if (window.confirm(`Are you sure you want to reactivate ${student.name}?`)) {
      const updatedStudents = students.map((s: any) => {
        if (s.id === student.id) {
          return {
            ...s,
            status: 'Active',
            reactivationDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });

      try {
        localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
      } catch (e) {
        console.error('Error saving students:', e);
      }

      showNotification(`✅ Student ${student.name} has been reactivated.`, 'success');
    }
  };

  // Promote Student
  const handlePromoteStudent = (student: any) => {
    const currentGradeIndex = GRADE_LEVELS.indexOf(student.grade);
    if (currentGradeIndex === -1 || currentGradeIndex === GRADE_LEVELS.length - 1) {
      showNotification('Student is already in the highest grade.', 'error');
      return;
    }

    const nextGrade = GRADE_LEVELS[currentGradeIndex + 1];
    if (window.confirm(`Promote ${student.name} from ${student.grade} to ${nextGrade}?`)) {
      const updatedStudents = students.map((s: any) => {
        if (s.id === student.id) {
          return {
            ...s,
            grade: nextGrade,
            promotionDate: new Date().toISOString(),
            previousGrade: student.grade,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });

      try {
        localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
      } catch (e) {
        console.error('Error saving students:', e);
      }

      showNotification(`🎓 Student ${student.name} promoted to ${nextGrade}!`, 'success');
    }
  };

  // Graduate Student
  const handleGraduateStudent = (student: any) => {
    if (window.confirm(`Mark ${student.name} as graduated?`)) {
      const updatedStudents = students.map((s: any) => {
        if (s.id === student.id) {
          return {
            ...s,
            status: 'Graduated',
            graduationDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });

      try {
        localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
      } catch (e) {
        console.error('Error saving students:', e);
      }

      showNotification(`🎓 Student ${student.name} has graduated!`, 'success');
    }
  };

  // ============================================================
  // DOCUMENT MANAGEMENT
  // ============================================================
  const handleUploadDocument = (student: any) => {
    setSelectedStudent(student);
    setDocumentFiles([]);
    setSelectedDocumentType('');
    setShowDocumentModal(true);
  };

  const handleSaveDocument = () => {
    if (!selectedDocumentType) {
      showNotification('Please select a document type.', 'error');
      return;
    }

    if (documentFiles.length === 0) {
      showNotification('Please upload at least one document.', 'error');
      return;
    }

    const newDocuments = documentFiles.map((file: File) => ({
      id: `DOC-${Date.now().toString().slice(-6)}`,
      type: selectedDocumentType,
      name: file.name,
      size: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: userName,
      status: 'Pending'
    }));

    const updatedStudents = students.map((s: any) => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          documents: [...(s.documents || []), ...newDocuments],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    try {
      localStorage.setItem('safari_students', JSON.stringify(updatedStudents));
    } catch (e) {
      console.error('Error saving students:', e);
    }

    showNotification(`📄 ${documentFiles.length} document(s) uploaded for ${selectedStudent.name}!`, 'success');
    setShowDocumentModal(false);
    setDocumentFiles([]);
    setSelectedDocumentType('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocumentFiles([...documentFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...documentFiles];
    newFiles.splice(index, 1);
    setDocumentFiles(newFiles);
  };

  // ============================================================
  // ADMISSION FUNCTIONS
  // ============================================================
  const handleViewAdmission = (admission: any) => {
    setSelectedAdmission(admission);
    setModalType('viewAdmission');
    setShowModal(true);
  };

  const handleProcessApplication = (id: string, name: string) => {
    const admission = admissions.find((a: any) => a.id === id);
    if (!admission) return;

    const updatedAdmissions = admissions.map((a: any) =>
      a.id === id ? { ...a, status: 'PaymentPending', processedDate: new Date().toLocaleDateString() } : a
    );

    try {
      localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));
    } catch (e) {
      console.error('Error saving admissions:', e);
    }

    showNotification(
      `Application for ${name} has been sent to Finance for fee assessment.`,
      'info'
    );
  };

  const handleFinanceApprove = (id: string, amount: number) => {
    const admission = admissions.find((a: any) => a.id === id);
    if (!admission) return;

    if (onAddTransaction) {
      onAddTransaction(
        amount,
        'Income',
        'Tuition',
        `Registration fee for ${admission.candidateName}`,
        'BankTransfer'
      );
    }

    const updatedAdmissions = admissions.map((a: any) =>
      a.id === id ? {
        ...a,
        status: 'Accepted',
        feePaid: amount,
        feeAmount: amount,
        feePaidDate: new Date().toLocaleDateString(),
        approvedByFinance: true
      } : a
    );

    try {
      localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));
    } catch (e) {
      console.error('Error saving admissions:', e);
    }

    showNotification(
      `Fee of ${amount} Birr received for ${admission.candidateName}. Application approved!`,
      'success'
    );
  };

  const handleRejectApplication = (id: string, name: string) => {
    if (window.confirm(`Reject ${name}'s application?`)) {
      const updatedAdmissions = admissions.map((a: any) =>
        a.id === id ? { ...a, status: 'Declined', declinedDate: new Date().toLocaleDateString() } : a
      );

      try {
        localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));
      } catch (e) {
        console.error('Error saving admissions:', e);
      }

      showNotification(`${name}'s application has been rejected.`, 'error');
    }
  };

  // ============================================================
  // REPORT GENERATION FUNCTIONS
  // ============================================================
  const generateReport = (type: string) => {
    showNotification(`📊 ${type} report generated successfully!`, 'success');
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const getFilteredAdmissions = () => {
    if (!searchQuery) return admissions;
    return admissions.filter((a: any) =>
      a.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredStudents = () => {
    const schoolStudents = students.filter((s: any) => s.schoolId === schoolId || !s.schoolId);
    if (!searchQuery) return schoolStudents;
    return schoolStudents.filter((s: any) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'PaymentPending': 'bg-blue-100 text-blue-700',
      'Accepted': 'bg-green-100 text-green-700',
      'Enrolled': 'bg-purple-100 text-purple-700',
      'Declined': 'bg-red-100 text-red-700',
      'Active': 'bg-green-100 text-green-700',
      'Suspended': 'bg-red-100 text-red-700',
      'Graduated': 'bg-purple-100 text-purple-700',
      'Withdrawn': 'bg-orange-100 text-orange-700',
      'Transferred': 'bg-blue-100 text-blue-700',
      'Expelled': 'bg-red-100 text-red-700',
      'Alumni': 'bg-indigo-100 text-indigo-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'PaymentPending': return <DollarSign className="h-4 w-4" />;
      case 'Accepted': return <CheckCircle className="h-4 w-4" />;
      case 'Enrolled': return <UserCheck className="h-4 w-4" />;
      case 'Declined': return <XCircle className="h-4 w-4" />;
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Suspended': return <AlertTriangle className="h-4 w-4" />;
      case 'Graduated': return <Award className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Registrar Dashboard</h2>
            <p className="text-sky-200 mt-1">Student Admissions & Records Management</p>
            {schoolName && (
              <p className="text-sky-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {schoolName}
              </p>
            )}
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('admissions')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" /> Review Applications
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK STATS */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* QUICK ACTIONS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <button
          onClick={() => setActiveTab('admissions')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <FileText className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Applications</p>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Students</p>
        </button>
        <button
          onClick={() => generateReport('Enrollment')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <BarChart3 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Reports</p>
        </button>
        <button
          onClick={() => generateReport('Graduates')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Graduates</p>
        </button>
        <button
          onClick={() => generateReport('Transcripts')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <FileSpreadsheet className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Transcripts</p>
        </button>
        <button
          onClick={() => generateReport('Certificates')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors text-center cursor-pointer"
        >
          <Printer className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Certificates</p>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TABS */}
      {/* ============================================================ */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Students', 'Admissions', 'Reports', 'Graduates', 'Transfers', 'Documents'].map((tab) => (
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

      {/* ============================================================ */}
      {/* OVERVIEW TAB */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Student Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Students</span>
                <span className="font-bold text-slate-900">{students.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-slate-600">Active / Enrolled</span>
                <span className="font-bold text-emerald-600">{activeStudents.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-slate-600">Suspended</span>
                <span className="font-bold text-red-600">{suspendedStudents.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-sm text-slate-600">Graduated</span>
                <span className="font-bold text-purple-600">{graduatedStudents.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-slate-600">Transferred</span>
                <span className="font-bold text-blue-600">{transferredStudents.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('admissions')}
                className="w-full text-left px-4 py-3 bg-sky-50 hover:bg-sky-100 rounded-xl text-sm font-semibold text-sky-700 transition-colors flex items-center gap-3"
              >
                <FileText className="h-5 w-5" />
                Review Pending Applications ({pendingAdmissions})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-semibold text-blue-700 transition-colors flex items-center gap-3"
              >
                <Users className="h-5 w-5" />
                Manage Students
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-sm font-semibold text-amber-700 transition-colors flex items-center gap-3"
              >
                <ArrowRight className="h-5 w-5" />
                Process Transfers
              </button>
              <button
                onClick={() => setActiveTab('graduation')}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm font-semibold text-purple-700 transition-colors flex items-center gap-3"
              >
                <Award className="h-5 w-5" />
                Manage Graduation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STUDENTS TAB */}
      {/* ============================================================ */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> Student Directory ({getFilteredStudents().length})
            </h3>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, admission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm w-48"
                />
              </div>
              <select
                onChange={(e) => setActiveTab(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                value="students"
              >
                <option value="students">All Students</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Admission</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Section</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No students match your search.' : 'No students enrolled yet.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-sky-700">
                        {student.studentId || student.id}
                      </td>
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">{student.admissionNo || 'N/A'}</td>
                      <td className="px-4 py-3">{student.grade || 'N/A'}</td>
                      <td className="px-4 py-3">{student.classSection || 'N/A'}</td>
                      <td className="px-4 py-3">{student.parentName || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(student.status)}`}>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowStudentDetailsModal(true);
                            }}
                            className="p-1 rounded transition-colors text-blue-500 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUploadDocument(student)}
                            className="p-1 rounded transition-colors text-indigo-500 hover:bg-indigo-50"
                            title="Upload Document"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePromoteStudent(student)}
                            className="p-1 rounded transition-colors text-emerald-500 hover:bg-emerald-50"
                            title="Promote"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTransferStudent(student)}
                            className="p-1 rounded transition-colors text-amber-500 hover:bg-amber-50"
                            title="Transfer"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          {student.status === 'Active' || student.status === 'Enrolled' ? (
                            <>
                              <button
                                onClick={() => handleSuspendStudent(student)}
                                className="p-1 rounded transition-colors text-red-500 hover:bg-red-50"
                                title="Suspend"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleWithdrawStudent(student)}
                                className="p-1 rounded transition-colors text-orange-500 hover:bg-orange-50"
                                title="Withdraw"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          ) : student.status === 'Suspended' || student.status === 'Withdrawn' ? (
                            <button
                              onClick={() => handleReactivateStudent(student)}
                              className="p-1 rounded transition-colors text-emerald-500 hover:bg-emerald-50"
                              title="Reactivate"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          ) : null}
                          {student.status !== 'Graduated' && (
                            <button
                              onClick={() => handleGraduateStudent(student)}
                              className="p-1 rounded transition-colors text-purple-500 hover:bg-purple-50"
                              title="Graduate"
                            >
                              <Award className="h-4 w-4" />
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

      {/* ============================================================ */}
      {/* ADMISSIONS TAB */}
      {/* ============================================================ */}
      {activeTab === 'admissions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Admission Applications ({admissions.length})
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
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Candidate</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Fee Paid</th>
                  <th className="px-4 py-2 text-left">Submitted</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredAdmissions().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No applications match your search.' : 'No applications found.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredAdmissions().map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{app.candidateName}</td>
                      <td className="px-4 py-3">{app.gradeApplied}</td>
                      <td className="px-4 py-3">{app.parentName}</td>
                      <td className="px-4 py-3">
                        {app.feePaid ? (
                          <span className="text-emerald-600 font-semibold">{app.feePaid} Birr</span>
                        ) : app.status === 'PaymentPending' ? (
                          <span className="text-blue-600 text-xs">Awaiting Payment</span>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{app.submittedDate}</td>
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
                                const amount = prompt('Enter fee amount paid (Birr):', '100');
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
                              onClick={() => handleEnrollStudent(app)}
                              className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck className="h-3 w-3" /> Enroll
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

      {/* ============================================================ */}
      {/* ENROLL STUDENT MODAL - WITH AUTO-FILLED GRADE & FEE FROM FINANCE */}
      {/* ============================================================ */}
      {showModal && modalType === 'enrollStudent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-sky-600" /> Enroll Student
              </h3>
              <button
                onClick={() => { setShowModal(false); setModalData({}); }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>School: <strong>{schoolName || 'Not assigned'}</strong></span>
              </p>
            </div>

            {/* Fee Summary from Finance */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Total Fee (from Finance)</p>
                <p className="text-lg font-bold text-emerald-700">{modalData.feeAmount || 0} Birr</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Fee Paid (from Finance)</p>
                <p className="text-lg font-bold text-blue-700">{modalData.feePaid || 0} Birr</p>
              </div>
              <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Balance</p>
                <p className={`text-lg font-bold ${(modalData.feeAmount || 0) - (modalData.feePaid || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(modalData.feeAmount || 0) - (modalData.feePaid || 0)} Birr
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3 mb-2">
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" /> Student Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalData.name || modalData.candidateName || ''}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student Email <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">(will be used for login)</span>
                  </label>
                  <input
                    type="email"
                    value={modalData.email || ''}
                    onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Grade <span className="text-red-500">*</span>
                      <span className="text-slate-400 font-normal ml-1">(Auto-filled from admission)</span>
                    </label>
                    <select
                      value={modalData.grade || 'PreKG'}
                      onChange={(e) => {
                        const newGrade = e.target.value;
                        const fee = getFeeForGrade(newGrade);
                        setModalData({
                          ...modalData,
                          grade: newGrade,
                          feeAmount: fee,
                          feeBalance: fee - (modalData.feePaid || 0)
                        });
                      }}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-sky-50"
                    >
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <p className="text-xs text-sky-600 mt-1">
                      Grade from admission application
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Section <span className="text-red-500">*</span>
                      <span className="text-slate-400 font-normal ml-1">(Select by Registrar)</span>
                    </label>
                    <select
                      value={modalData.section || 'A'}
                      onChange={(e) => setModalData({ ...modalData, section: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-amber-50"
                    >
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <p className="text-xs text-amber-600 mt-1">
                      Registrar determines section
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={modalData.phone || ''}
                    onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Previous School</label>
                  <input
                    type="text"
                    value={modalData.previousSchool || ''}
                    onChange={(e) => setModalData({ ...modalData, previousSchool: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" /> Parent/Guardian Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalData.parentName || ''}
                    onChange={(e) => setModalData({ ...modalData, parentName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent Email <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">(will be used for login)</span>
                  </label>
                  <input
                    type="email"
                    value={modalData.parentEmail || ''}
                    onChange={(e) => setModalData({ ...modalData, parentEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
              <p className="text-sm text-amber-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Login credentials will be automatically created:</strong><br />
                  Student: <span className="font-mono">{modalData.email || 'student@email.com'}</span> / Password: <span className="font-mono">STU{modalData.studentId?.slice(-6) || 'XXXXXX'}</span><br />
                  Parent: <span className="font-mono">{modalData.parentEmail || 'parent@email.com'}</span> / Password: <span className="font-mono">PAR{modalData.studentId?.slice(-6) || 'XXXXXX'}</span>
                </span>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowModal(false); setModalData({}); }}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEnrollment}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" /> Enroll & Create Logins
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREDENTIALS MODAL */}
      {/* ============================================================ */}
      {showCredentialsModal && credentialsData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-emerald-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                Login Credentials Created
              </h3>
              <button
                onClick={() => { setShowCredentialsModal(false); setCredentialsData(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Student: <strong>{credentialsData.studentName || 'N/A'}</strong> ({credentialsData.grade || 'N/A'})</span>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Student ID: <strong>{credentialsData.studentId || 'N/A'}</strong> | Admission: <strong>{credentialsData.admissionNo || 'N/A'}</strong>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Fee Paid: <strong>{credentialsData.feePaid || 0} Birr</strong> | Total: <strong>{credentialsData.feeTotal || 0} Birr</strong>
              </p>
            </div>

            <div className="space-y-4">
              {credentialsData.student && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 text-sm flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4" /> Student Login
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-500">Name:</span> <span className="font-medium">{credentialsData.student.name}</span></p>
                    <p><span className="text-slate-500">Email:</span> <span className="font-medium">{credentialsData.student.email}</span></p>
                    <p><span className="text-slate-500">Password:</span> <span className="font-mono bg-blue-100 px-2 py-0.5 rounded font-bold text-blue-700">{credentialsData.student.password}</span></p>
                  </div>
                </div>
              )}

              {credentialsData.parent && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-800 text-sm flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" /> Parent Login
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-500">Name:</span> <span className="font-medium">{credentialsData.parent.name}</span></p>
                    <p><span className="text-slate-500">Email:</span> <span className="font-medium">{credentialsData.parent.email}</span></p>
                    <p><span className="text-slate-500">Password:</span> <span className="font-mono bg-purple-100 px-2 py-0.5 rounded font-bold text-purple-700">{credentialsData.parent.password}</span></p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>⚠️ Please save these credentials. Both users can now login to the school portal.</span>
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    let creds = '';
                    if (credentialsData.student) {
                      creds += `Student Email: ${credentialsData.student.email}\nStudent Password: ${credentialsData.student.password}\n`;
                    }
                    if (credentialsData.parent) {
                      creds += `Parent Email: ${credentialsData.parent.email}\nParent Password: ${credentialsData.parent.password}`;
                    }
                    if (creds) {
                      navigator.clipboard?.writeText(creds);
                      showNotification('Credentials copied to clipboard!', 'success');
                    }
                  }}
                  className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📋</span> Copy Credentials
                </button>
                <button
                  onClick={() => { setShowCredentialsModal(false); setCredentialsData(null); }}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  I've Saved Them
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TRANSFER MODAL */}
      {/* ============================================================ */}
      {showTransferModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-amber-600" />
                Transfer Student
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Student:</span> {modalData.studentName}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Current:</span> {modalData.currentGrade} - Section {modalData.currentSection}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Grade</label>
                <select
                  value={modalData.newGrade}
                  onChange={(e) => setModalData({ ...modalData, newGrade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Section</label>
                <select
                  value={modalData.newSection}
                  onChange={(e) => setModalData({ ...modalData, newSection: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Reason</label>
                <textarea
                  value={modalData.transferReason}
                  onChange={(e) => setModalData({ ...modalData, transferReason: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Reason for transfer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New School (if transferring out)</label>
                <input
                  type="text"
                  value={modalData.newSchool}
                  onChange={(e) => setModalData({ ...modalData, newSchool: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="School name..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmTransfer}
                  className="flex-1 bg-sky-600 text-white py-2.5 rounded-xl font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
                >
                  Confirm Transfer
                </button>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DOCUMENT UPLOAD MODAL */}
      {/* ============================================================ */}
      {showDocumentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Upload Documents - {selectedStudent.name}
              </h3>
              <button onClick={() => setShowDocumentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type *</label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Document Type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Files *</label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 transition-colors"
                  onClick={() => document.getElementById('docUpload')?.click()}
                >
                  <input
                    id="docUpload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Click or drag to upload documents</p>
                  <p className="text-xs text-slate-400">PDF, JPEG, PNG, DOC (Max 5MB each)</p>
                </div>

                {documentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-slate-400" />
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

              <div className="flex gap-3">
                <button
                  onClick={handleSaveDocument}
                  disabled={!selectedDocumentType || documentFiles.length === 0}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Documents
                </button>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW ADMISSION MODAL */}
      {/* ============================================================ */}
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
                    <p className="text-xs text-slate-500">Fee Paid (from Finance)</p>
                    <p className="font-bold text-emerald-600">{selectedAdmission.feePaid} Birr</p>
                    <p className="text-xs text-slate-400">Paid on: {selectedAdmission.feePaidDate}</p>
                  </div>
                )}
                {selectedAdmission.receiptFiles && selectedAdmission.receiptFiles.length > 0 && (
                  <div className="bg-indigo-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Receipt Files</p>
                    <p className="font-bold text-indigo-600">{selectedAdmission.receiptFiles.length} file(s)</p>
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
                      const amount = prompt('Enter fee amount paid (Birr):', '100');
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
                      handleEnrollStudent(selectedAdmission);
                      setShowModal(false);
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

      {/* ============================================================ */}
      {/* STUDENT DETAILS MODAL */}
      {/* ============================================================ */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Student Details</h3>
              <button onClick={() => setShowStudentDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Student ID</p>
                  <p className="font-bold">{selectedStudent.studentId || selectedStudent.id}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Admission No</p>
                  <p className="font-bold">{selectedStudent.admissionNo || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-bold">{selectedStudent.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Grade</p>
                  <p className="font-bold">{selectedStudent.grade}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Section</p>
                  <p className="font-bold">{selectedStudent.classSection || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(selectedStudent.status)}`}>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-bold text-sm">{selectedStudent.email}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-bold">{selectedStudent.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Parent</p>
                  <p className="font-bold">{selectedStudent.parentName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-slate-500">Parent Email</p>
                  <p className="font-bold text-sm">{selectedStudent.parentEmail}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Fee Balance</p>
                  <p className={`font-bold ${selectedStudent.tuitionBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedStudent.tuitionBalance || 0} Birr
                  </p>
                </div>
              </div>

              {/* Documents List */}
              {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">Documents</h4>
                  <div className="space-y-1">
                    {selectedStudent.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                        <span>{doc.type}: {doc.name}</span>
                        <span className="text-xs text-slate-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowStudentDetailsModal(false)}
                className="w-full bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
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