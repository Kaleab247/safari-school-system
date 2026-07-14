// PrincipalModule.tsx - Complete Fixed Version with Credentials Fix

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award, Users, GraduationCap, BarChart3, TrendingUp, TrendingDown,
  Percent, Calendar, Clock, FileText, AlertTriangle, UserCheck,
  DollarSign, PieChart, Activity, BookOpen, ChevronRight,
  Download, Printer, Eye, Star, Medal, Trophy, X, Plus,
  UserPlus, Mail, Phone, MapPin, Edit, Trash2, Search, Filter,
  UserCog, Briefcase, School, BookMarked, UserRound, CheckCircle,
  AlertCircle, Building2, KeyRound, RefreshCw, UserX, User,
  Shield, Lock, Unlock, Save, Pencil, RotateCcw, Archive,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Square,
  CheckSquare,
  MessageSquare, Send, Paperclip, Upload
} from 'lucide-react';

interface PrincipalModuleProps {
  userName: string;
  students: any[];
  teachers: any[];
  grades: any[];
  transactions: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onAddStudent?: (student: any) => void;
  setStudents?: any;
  setTeachers?: any;
  schoolId?: string;
  schoolName?: string;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
  schools?: any[];
}

// Grade levels from PreKG to Grade 12
const GRADE_LEVELS = [
  'PreKG', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

// Sections
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Department options
const DEPARTMENTS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Arabic',
  'Islamic Studies',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'French',
  'General'
];

// Staff roles with their corresponding system roles
const STAFF_ROLES = [
  'Registrar',
  'Finance Officer',
  'Librarian',
  'Clinic Nurse',
  'Counselor',
  'Transport Manager',
  'Driver',
  'Cafeteria Manager',
  'Alumni Coordinator',
  'IT Support',
  'Receptionist',
  'Security Officer',
  'Maintenance Staff',
  'HR Officer',
  'Inventory Manager'
];

// Map staff roles to system roles
const STAFF_ROLE_MAP: Record<string, string> = {
  'Registrar': 'registrar',
  'Finance Officer': 'finance',
  'Librarian': 'librarian',
  'Clinic Nurse': 'clinic',
  'Counselor': 'counselor',
  'Transport Manager': 'transport',
  'Driver': 'driver',
  'Cafeteria Manager': 'cafeteria',
  'Alumni Coordinator': 'alumni',
  'IT Support': 'staff',
  'Receptionist': 'staff',
  'Security Officer': 'staff',
  'Maintenance Staff': 'staff',
  'HR Officer': 'staff',
  'Inventory Manager': 'staff'
};

export default function PrincipalModule({
  userName,
  students = [],
  teachers = [],
  grades = [],
  transactions = [],
  showNotification,
  onAddStudent,
  setStudents,
  setTeachers,
  schoolId = '',
  schoolName = '',
  registeredUsers = [],
  setRegisteredUsers,
  schools = []
}: PrincipalModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [pendingTeacherRequests, setPendingTeacherRequests] = useState<any[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<any[]>([]);
  const [rejectedTeachers, setRejectedTeachers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsData, setCredentialsData] = useState<any>(null);
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState<any>(null);
  const [showTeacherDetailsModal, setShowTeacherDetailsModal] = useState(false);

  // Parent management states
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [showParentDetailsModal, setShowParentDetailsModal] = useState(false);
  const [showParentCommunicationModal, setShowParentCommunicationModal] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [communicationFiles, setCommunicationFiles] = useState<File[]>([]);
  const [parentSearchQuery, setParentSearchQuery] = useState('');

  // Bulk selection states
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | null>(null);

  // Subjects state
  const [subjects, setSubjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('safari_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Staff members
  const [staffMembers, setStaffMembers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('safari_staff');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Get parents for this school with real linked students
  const getSchoolParents = () => {
    const schoolParents = registeredUsers.filter((u: any) => {
      if (u.role !== 'parent') return false;
      if (schoolId) {
        return u.schoolId === schoolId;
      }
      if (schoolName) {
        return u.schoolName === schoolName;
      }
      return true;
    });

    return schoolParents.map((parent: any) => {
      const linkedStudents = students.filter((s: any) => {
        if (s.parentEmail && s.parentEmail.toLowerCase() === parent.email.toLowerCase()) {
          return true;
        }
        if (s.parentName && s.parentName.toLowerCase() === parent.name.toLowerCase()) {
          return true;
        }
        return false;
      });

      return {
        ...parent,
        linkedStudents: linkedStudents,
        studentCount: linkedStudents.length,
        studentNames: linkedStudents.map((s: any) => s.name).join(', ')
      };
    });
  };

  // Load pending students
  useEffect(() => {
    loadPendingStudents();
  }, [schoolId, students]);

  const loadPendingStudents = useCallback(() => {
    try {
      const saved = localStorage.getItem('safari_pending_students');
      const allPending = saved ? JSON.parse(saved) : [];
      const schoolPending = allPending.filter((s: any) => s.schoolId === schoolId);
      setPendingStudents(schoolPending);
    } catch {
      setPendingStudents([]);
    }
  }, [schoolId]);

  // Load pending teacher requests
  const loadPendingTeacherRequests = useCallback(() => {
    try {
      const saved = localStorage.getItem('safari_pending_teacher_requests');
      const allRequests = saved ? JSON.parse(saved) : [];
      const schoolRequests = allRequests.filter((r: any) => {
        const matchesSchool = r.schoolId === schoolId || !r.schoolId;
        const isPending = r.status === 'pending';
        return matchesSchool && isPending;
      });
      setPendingTeacherRequests(schoolRequests);
      return schoolRequests;
    } catch (error) {
      console.error('Error loading pending teacher requests:', error);
      setPendingTeacherRequests([]);
      return [];
    }
  }, [schoolId]);

  // Load approved and rejected teachers
  const loadApprovedRejectedTeachers = useCallback(() => {
    try {
      const savedApproved = localStorage.getItem('safari_approved_teachers');
      const savedRejected = localStorage.getItem('safari_rejected_teachers');

      const allApproved = savedApproved ? JSON.parse(savedApproved) : [];
      const allRejected = savedRejected ? JSON.parse(savedRejected) : [];

      const schoolApproved = allApproved.filter((t: any) => t.schoolId === schoolId || !t.schoolId);
      const schoolRejected = allRejected.filter((t: any) => t.schoolId === schoolId || !t.schoolId);

      setApprovedTeachers(schoolApproved);
      setRejectedTeachers(schoolRejected);
    } catch (error) {
      console.error('Error loading approved/rejected teachers:', error);
      setApprovedTeachers([]);
      setRejectedTeachers([]);
    }
  }, [schoolId]);

  useEffect(() => {
    loadPendingTeacherRequests();
    loadApprovedRejectedTeachers();
  }, [loadPendingTeacherRequests, loadApprovedRejectedTeachers]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = () => {
      loadPendingTeacherRequests();
      loadApprovedRejectedTeachers();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('teacherRequestUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('teacherRequestUpdated', handleStorageChange);
    };
  }, [loadPendingTeacherRequests, loadApprovedRejectedTeachers]);

  // Save functions
  const saveSubjects = (newSubjects: any[]) => {
    setSubjects(newSubjects);
    localStorage.setItem('safari_subjects', JSON.stringify(newSubjects));
  };

  const saveStaff = (newStaff: any[]) => {
    setStaffMembers(newStaff);
    localStorage.setItem('safari_staff', JSON.stringify(newStaff));
  };

  // ============ PARENT HANDLERS ============
  const handleViewParent = (parent: any) => {
    setSelectedParent(parent);
    setShowParentDetailsModal(true);
  };

  const handleResetParentPassword = (parent: any) => {
    const newPassword = prompt(`Enter new password for ${parent.name}:`, 'password123');
    if (newPassword && newPassword.trim() && newPassword.trim().length >= 6) {
      if (setRegisteredUsers) {
        const updatedUsers = registeredUsers.map((u: any) =>
          u.id === parent.id ? { ...u, password: newPassword.trim() } : u
        );
        setRegisteredUsers(updatedUsers);
        // Also save to localStorage directly
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }
      showNotification(`Password reset for ${parent.name} successfully!`, 'success');
    } else if (newPassword !== null) {
      showNotification('Password must be at least 6 characters!', 'error');
    }
  };

  const handleToggleParentStatus = (parent: any) => {
    const newStatus = parent.isActive !== false ? false : true;
    if (window.confirm(`Set ${newStatus ? 'active' : 'inactive'} for ${parent.name}?`)) {
      if (setRegisteredUsers) {
        const updatedUsers = registeredUsers.map((u: any) =>
          u.id === parent.id ? { ...u, isActive: newStatus } : u
        );
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }
      showNotification(`Parent ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
  };

  const handleDeleteParent = (parent: any) => {
    if (window.confirm(`Are you sure you want to delete ${parent.name}? This will also remove their login access.`)) {
      if (setRegisteredUsers) {
        const updatedUsers = registeredUsers.filter((u: any) => u.id !== parent.id);
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }
      showNotification(`Parent ${parent.name} deleted successfully!`, 'success');
    }
  };

  const handleCommunicateParent = (parent: any) => {
    setSelectedParent(parent);
    setCommunicationMessage('');
    setCommunicationFiles([]);
    setShowParentCommunicationModal(true);
  };

  const handleSendCommunication = () => {
    if (!communicationMessage.trim() && communicationFiles.length === 0) {
      showNotification('Please enter a message or attach a file.', 'error');
      return;
    }

    const fileNames = communicationFiles.map(f => f.name).join(', ');
    showNotification(
      `Message sent to ${selectedParent.name}!\n` +
      `Message: ${communicationMessage || 'No message'}\n` +
      `Attachments: ${fileNames || 'None'}`,
      'success'
    );

    setShowParentCommunicationModal(false);
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

  // ============ STAFF HANDLERS ============
  const handleAddStaff = () => {
    setModalType('addStaff');
    setModalData({
      name: '',
      email: '',
      password: '',
      role: 'Administrative',
      department: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      schoolId: schoolId,
      schoolName: schoolName
    });
    setShowModal(true);
  };

  const handleSaveStaff = () => {
    if (!modalData.name?.trim() || !modalData.email?.trim() || !modalData.password?.trim()) {
      showNotification('Name, Email and Password are required!', 'error');
      return;
    }

    if (modalData.password.trim().length < 6) {
      showNotification('Password must be at least 6 characters!', 'error');
      return;
    }

    // Check if email already exists
    if (registeredUsers.some((u: any) => u.email.toLowerCase() === modalData.email.trim().toLowerCase())) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    // Get the system role from the staff role
    const systemRole = STAFF_ROLE_MAP[modalData.role] || 'staff';

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      email: modalData.email.trim().toLowerCase(),
      password: modalData.password.trim(),
      role: modalData.role || 'Administrative',
      department: modalData.department || 'Administration',
      phone: modalData.phone || '',
      hireDate: modalData.hireDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      schoolId: schoolId,
      schoolName: schoolName,
      createdAt: new Date().toISOString()
    };

    saveStaff([...staffMembers, newStaff]);

    // Register as a user with the CORRECT system role
    if (setRegisteredUsers) {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: newStaff.name,
        email: newStaff.email,
        password: newStaff.password,
        role: systemRole,
        schoolId: schoolId,
        schoolName: schoolName,
        isActive: true,
        createdAt: new Date().toISOString(),
        associatedId: newStaff.id
      };
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      // Save directly to localStorage
      try {
        localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error('Error saving users:', e);
      }
    }

    showNotification(`Staff ${newStaff.name} added successfully! Login credentials created.`, 'success');
    setShowModal(false);
    setModalData({});
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const staff = staffMembers.find((s: any) => s.id === id);
      saveStaff(staffMembers.filter((s: any) => s.id !== id));

      if (setRegisteredUsers && staff) {
        const updatedUsers = registeredUsers.filter((u: any) => u.email !== staff.email);
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }

      showNotification(`Staff ${name} deleted successfully!`, 'success');
    }
  };

  const handleResetStaffPassword = (id: string, name: string) => {
    const newPassword = prompt(`Enter new password for ${name}:`, 'password123');
    if (newPassword && newPassword.trim() && newPassword.trim().length >= 6) {
      const updatedStaff = staffMembers.map((s: any) =>
        s.id === id ? { ...s, password: newPassword.trim() } : s
      );
      saveStaff(updatedStaff);

      const staff = staffMembers.find((s: any) => s.id === id);
      if (setRegisteredUsers && staff) {
        const updatedUsers = registeredUsers.map((u: any) =>
          u.email === staff.email ? { ...u, password: newPassword.trim() } : u
        );
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }

      showNotification(`Password reset for ${name} successfully!`, 'success');
    } else if (newPassword !== null) {
      showNotification('Password must be at least 6 characters!', 'error');
    }
  };

  const handleToggleStaffStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Set ${currentStatus === 'Active' ? 'inactive' : 'active'} for this staff member?`)) {
      const updatedStaff = staffMembers.map((s: any) =>
        s.id === id ? { ...s, status: newStatus } : s
      );
      saveStaff(updatedStaff);

      const staff = staffMembers.find((s: any) => s.id === id);
      if (setRegisteredUsers && staff) {
        const updatedUsers = registeredUsers.map((u: any) =>
          u.email === staff.email ? { ...u, isActive: newStatus === 'Active' } : u
        );
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }

      showNotification(`Staff ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
  };

  // ============ TEACHER HANDLERS ============
  const handleAddTeacher = () => {
    setModalType('addTeacher');
    setModalData({
      name: '',
      email: '',
      password: '',
      department: '',
      subjects: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      schoolId: schoolId,
      schoolName: schoolName,
      role: 'teacher',
      qualifications: ''
    });
    setShowModal(true);
    setIsSubmitting(false);
  };

  const handleSaveTeacher = () => {
    if (isSubmitting) return;

    if (!modalData.name?.trim()) {
      showNotification('Teacher name is required!', 'error');
      return;
    }
    if (!modalData.email?.trim()) {
      showNotification('Email is required!', 'error');
      return;
    }
    if (!modalData.password?.trim() || modalData.password.trim().length < 6) {
      showNotification('Password must be at least 6 characters!', 'error');
      return;
    }

    if (registeredUsers.some((u: any) => u.email.toLowerCase() === modalData.email.trim().toLowerCase())) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let subjectsArray: string[] = [];
      if (modalData.subjects) {
        if (typeof modalData.subjects === 'string') {
          subjectsArray = modalData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
        } else if (Array.isArray(modalData.subjects)) {
          subjectsArray = modalData.subjects;
        }
      }

      let qualificationsArray: string[] = [];
      if (modalData.qualifications) {
        if (typeof modalData.qualifications === 'string') {
          qualificationsArray = modalData.qualifications.split(',').map((q: string) => q.trim()).filter(Boolean);
        } else if (Array.isArray(modalData.qualifications)) {
          qualificationsArray = modalData.qualifications;
        }
      }

      const newTeacher = {
        id: `TCH-${Date.now().toString().slice(-6)}`,
        name: modalData.name.trim(),
        email: modalData.email.trim().toLowerCase(),
        password: modalData.password.trim(),
        department: modalData.department || 'General',
        subjects: subjectsArray,
        phone: modalData.phone || '',
        hireDate: modalData.hireDate || new Date().toISOString().split('T')[0],
        salary: 0,
        attendanceRate: 0,
        performanceScore: 0,
        status: 'Pending',
        schoolId: schoolId,
        schoolName: schoolName || 'My School',
        qualifications: qualificationsArray,
        createdAt: new Date().toISOString(),
        approvalStatus: 'pending',
        requestedBy: userName,
        requestedDate: new Date().toISOString(),
        requestedByRole: 'principal'
      };

      const pendingRequest = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        teacherData: newTeacher,
        requestedBy: userName,
        requestedByRole: 'principal',
        requestedDate: new Date().toISOString(),
        status: 'pending',
        schoolId: schoolId,
        schoolName: schoolName || 'My School',
        notes: `Created by Principal ${userName}`
      };

      const existingRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      existingRequests.push(pendingRequest);
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(existingRequests));

      setPendingTeacherRequests(existingRequests.filter((r: any) => r.schoolId === schoolId));

      if (setTeachers) {
        setTeachers((prev: any[]) => [...prev, newTeacher]);
      } else {
        const existingTeachers = JSON.parse(localStorage.getItem('safari_teachers') || '[]');
        existingTeachers.push(newTeacher);
        localStorage.setItem('safari_teachers', JSON.stringify(existingTeachers));
      }

      window.dispatchEvent(new Event('teacherRequestUpdated'));

      showNotification(
        `Teacher ${newTeacher.name} has been created and is pending approval.`,
        'success'
      );
      setShowModal(false);
      setModalData({});
    } catch (error) {
      console.error('Error creating teacher:', error);
      showNotification('Error creating teacher. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ BULK SELECTION HANDLERS ============
  const toggleTeacherSelection = (requestId: string) => {
    const newSelection = new Set(selectedTeachers);
    if (newSelection.has(requestId)) {
      newSelection.delete(requestId);
    } else {
      newSelection.add(requestId);
    }
    setSelectedTeachers(newSelection);
    setSelectAll(newSelection.size === pendingTeacherRequests.length && pendingTeacherRequests.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTeachers(new Set());
    } else {
      const allIds = new Set(pendingTeacherRequests.map(r => r.id));
      setSelectedTeachers(allIds);
    }
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedTeachers(new Set());
    setSelectAll(false);
  };

  // Bulk approve
  const handleBulkApprove = () => {
    if (selectedTeachers.size === 0) {
      showNotification('Please select at least one teacher to approve.', 'error');
      return;
    }
    setBulkActionType('approve');
    setModalType('bulkApprove');
    setShowModal(true);
  };

  // Bulk reject
  const handleBulkReject = () => {
    if (selectedTeachers.size === 0) {
      showNotification('Please select at least one teacher to reject.', 'error');
      return;
    }
    setBulkActionType('reject');
    setRejectionReason('');
    setModalType('bulkReject');
    setShowModal(true);
  };

  // Confirm bulk approval
  const handleConfirmBulkApproval = useCallback(async () => {
    const selectedRequests = pendingTeacherRequests.filter(r => selectedTeachers.has(r.id));

    if (selectedRequests.length === 0) {
      showNotification('No teachers selected for approval.', 'error');
      return;
    }

    try {
      let allUpdatedUsers = [...registeredUsers];

      for (const request of selectedRequests) {
        const teacherData = request.teacherData;

        const updatedTeacher = {
          ...teacherData,
          status: 'Active',
          approvalStatus: 'approved',
          approvedBy: userName,
          approvedDate: new Date().toISOString()
        };

        if (setTeachers) {
          setTeachers((prev: any[]) =>
            prev.map((t: any) =>
              t.id === teacherData.id ? updatedTeacher : t
            )
          );
        }

        const newUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password,
          role: 'teacher',
          schoolId: schoolId,
          schoolName: schoolName,
          isActive: true,
          createdAt: new Date().toISOString(),
          associatedId: teacherData.id
        };

        allUpdatedUsers = [...allUpdatedUsers, newUser];
      }

      if (setRegisteredUsers) {
        setRegisteredUsers(allUpdatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(allUpdatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }

      const currentApproved = JSON.parse(localStorage.getItem('safari_approved_teachers') || '[]');
      selectedRequests.forEach(r => {
        currentApproved.push({ ...r.teacherData, approvedBy: userName, approvedDate: new Date().toISOString() });
      });
      localStorage.setItem('safari_approved_teachers', JSON.stringify(currentApproved));

      const selectedIds = new Set(selectedRequests.map(r => r.id));
      const allRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      const updatedRequests = allRequests.filter((r: any) => !selectedIds.has(r.id));
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(updatedRequests));

      setPendingTeacherRequests(updatedRequests.filter((r: any) => r.schoolId === schoolId));
      loadApprovedRejectedTeachers();
      clearSelection();

      window.dispatchEvent(new Event('teacherRequestUpdated'));

      showNotification(`✅ Successfully approved ${selectedRequests.length} teacher(s)!`, 'success');
      setShowModal(false);
      setBulkActionType(null);

    } catch (error) {
      console.error('Error in bulk approval:', error);
      showNotification('Failed to approve teachers. Please try again.', 'error');
    }
  }, [selectedTeachers, pendingTeacherRequests, userName, schoolId, schoolName, setTeachers, setRegisteredUsers, registeredUsers, showNotification, loadApprovedRejectedTeachers]);

  // Confirm bulk rejection
  const handleConfirmBulkRejection = useCallback(() => {
    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection.', 'error');
      return;
    }

    const selectedRequests = pendingTeacherRequests.filter(r => selectedTeachers.has(r.id));

    if (selectedRequests.length === 0) {
      showNotification('No teachers selected for rejection.', 'error');
      return;
    }

    try {
      for (const request of selectedRequests) {
        const teacherData = request.teacherData;

        const rejectedTeacher = {
          ...teacherData,
          status: 'Rejected',
          approvalStatus: 'rejected',
          rejectedBy: userName,
          rejectedDate: new Date().toISOString(),
          rejectionReason: rejectionReason.trim()
        };

        if (setTeachers) {
          setTeachers((prev: any[]) =>
            prev.map((t: any) =>
              t.id === teacherData.id ? rejectedTeacher : t
            )
          );
        }

        const currentRejected = JSON.parse(localStorage.getItem('safari_rejected_teachers') || '[]');
        currentRejected.push(rejectedTeacher);
        localStorage.setItem('safari_rejected_teachers', JSON.stringify(currentRejected));
      }

      const selectedIds = new Set(selectedRequests.map(r => r.id));
      const allRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      const updatedRequests = allRequests.filter((r: any) => !selectedIds.has(r.id));
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(updatedRequests));

      setPendingTeacherRequests(updatedRequests.filter((r: any) => r.schoolId === schoolId));
      loadApprovedRejectedTeachers();
      clearSelection();

      window.dispatchEvent(new Event('teacherRequestUpdated'));

      showNotification(`❌ Successfully rejected ${selectedRequests.length} teacher(s).`, 'error');
      setShowModal(false);
      setBulkActionType(null);
      setRejectionReason('');

    } catch (error) {
      console.error('Error in bulk rejection:', error);
      showNotification('Failed to reject teachers. Please try again.', 'error');
    }
  }, [selectedTeachers, pendingTeacherRequests, rejectionReason, userName, schoolId, setTeachers, showNotification, loadApprovedRejectedTeachers]);

  // ============ SINGLE TEACHER HANDLERS ============
  const handleApproveTeacher = (request: any) => {
    if (!request) {
      showNotification('Error: No teacher request data found.', 'error');
      return;
    }
    setSelectedRequest(request);
    setModalType('approveTeacher');
    setModalData({
      ...request.teacherData,
      notes: ''
    });
    setShowModal(true);
  };

  const handleConfirmApproval = useCallback(async () => {
    if (!selectedRequest) {
      showNotification('Error: No teacher selected for approval.', 'error');
      return;
    }

    const teacherData = selectedRequest.teacherData;

    if (!teacherData) {
      showNotification('Error: Invalid teacher data.', 'error');
      return;
    }

    try {
      const updatedTeacher = {
        ...teacherData,
        status: 'Active',
        approvalStatus: 'approved',
        approvedBy: userName,
        approvedDate: new Date().toISOString()
      };

      if (setTeachers) {
        setTeachers((prev: any[]) =>
          prev.map((t: any) =>
            t.id === teacherData.id ? updatedTeacher : t
          )
        );
      }

      const newUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: teacherData.name,
        email: teacherData.email,
        password: teacherData.password,
        role: 'teacher',
        schoolId: schoolId,
        schoolName: schoolName,
        isActive: true,
        createdAt: new Date().toISOString(),
        associatedId: teacherData.id
      };

      if (setRegisteredUsers) {
        const updatedUsers = [...registeredUsers, newUser];
        setRegisteredUsers(updatedUsers);
        try {
          localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
        } catch (e) {
          console.error('Error saving users:', e);
        }
      }

      const currentApproved = JSON.parse(localStorage.getItem('safari_approved_teachers') || '[]');
      currentApproved.push(updatedTeacher);
      localStorage.setItem('safari_approved_teachers', JSON.stringify(currentApproved));
      setApprovedTeachers(currentApproved.filter((t: any) => t.schoolId === schoolId || !t.schoolId));

      const allRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      const updatedRequests = allRequests.filter((r: any) => r.id !== selectedRequest.id);
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(updatedRequests));
      setPendingTeacherRequests(updatedRequests.filter((r: any) => r.schoolId === schoolId));

      window.dispatchEvent(new Event('teacherRequestUpdated'));

      showNotification(`✅ Teacher ${teacherData.name} has been approved and can now login!`, 'success');

      setShowModal(false);
      setSelectedRequest(null);

    } catch (error) {
      console.error('Error in approval:', error);
      showNotification('Failed to approve teacher. Please try again.', 'error');
    }
  }, [selectedRequest, userName, schoolId, schoolName, setTeachers, setRegisteredUsers, registeredUsers, showNotification]);

  const handleRejectTeacher = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setModalType('rejectTeacher');
    setShowModal(true);
  };

  const handleConfirmRejection = useCallback(() => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection.', 'error');
      return;
    }

    const teacherData = selectedRequest.teacherData;

    const rejectedTeacher = {
      ...teacherData,
      status: 'Rejected',
      approvalStatus: 'rejected',
      rejectedBy: userName,
      rejectedDate: new Date().toISOString(),
      rejectionReason: rejectionReason.trim()
    };

    if (setTeachers) {
      setTeachers((prev: any[]) =>
        prev.map((t: any) =>
          t.id === teacherData.id ? rejectedTeacher : t
        )
      );
    }

    const currentRejected = JSON.parse(localStorage.getItem('safari_rejected_teachers') || '[]');
    currentRejected.push(rejectedTeacher);
    localStorage.setItem('safari_rejected_teachers', JSON.stringify(currentRejected));
    setRejectedTeachers(currentRejected.filter((t: any) => t.schoolId === schoolId || !t.schoolId));

    const allRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
    const updatedRequests = allRequests.filter((r: any) => r.id !== selectedRequest.id);
    localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(updatedRequests));
    setPendingTeacherRequests(updatedRequests.filter((r: any) => r.schoolId === schoolId));

    window.dispatchEvent(new Event('teacherRequestUpdated'));

    showNotification(`Teacher ${teacherData.name} has been rejected.`, 'error');
    setShowModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  }, [selectedRequest, rejectionReason, userName, schoolId, setTeachers, showNotification]);

  const handleResubmitTeacher = (teacher: any) => {
    if (window.confirm(`Re-submit ${teacher.name} for approval?`)) {
      const currentRejected = JSON.parse(localStorage.getItem('safari_rejected_teachers') || '[]');
      const updatedRejected = currentRejected.filter((t: any) => t.id !== teacher.id);
      localStorage.setItem('safari_rejected_teachers', JSON.stringify(updatedRejected));
      setRejectedTeachers(updatedRejected.filter((t: any) => t.schoolId === schoolId || !t.schoolId));

      const resubmittedTeacher = {
        ...teacher,
        approvalStatus: 'pending',
        status: 'Pending',
        rejectedBy: undefined,
        rejectedDate: undefined,
        rejectionReason: undefined,
        resubmittedBy: userName,
        resubmittedDate: new Date().toISOString()
      };

      if (setTeachers) {
        setTeachers((prev: any[]) =>
          prev.map((t: any) =>
            t.id === teacher.id ? resubmittedTeacher : t
          )
        );
      }

      const pendingRequest = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        teacherData: resubmittedTeacher,
        requestedBy: userName,
        requestedByRole: 'principal',
        requestedDate: new Date().toISOString(),
        status: 'pending',
        schoolId: schoolId,
        schoolName: schoolName,
        notes: `Re-submitted by ${userName}`
      };

      const existingRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      existingRequests.push(pendingRequest);
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(existingRequests));
      setPendingTeacherRequests(existingRequests.filter((r: any) => r.schoolId === schoolId));

      window.dispatchEvent(new Event('teacherRequestUpdated'));

      showNotification(`Teacher ${teacher.name} has been re-submitted for approval.`, 'success');
    }
  };

  const handlePermanentlyRemoveTeacher = (teacher: any) => {
    if (window.confirm(`Are you sure you want to permanently remove ${teacher.name}? This action cannot be undone.`)) {
      const currentRejected = JSON.parse(localStorage.getItem('safari_rejected_teachers') || '[]');
      const updatedRejected = currentRejected.filter((t: any) => t.id !== teacher.id);
      localStorage.setItem('safari_rejected_teachers', JSON.stringify(updatedRejected));
      setRejectedTeachers(updatedRejected.filter((t: any) => t.schoolId === schoolId || !t.schoolId));

      if (setTeachers) {
        setTeachers((prev: any[]) => prev.filter((t: any) => t.id !== teacher.id));
      }

      showNotification(`Teacher ${teacher.name} has been permanently removed.`, 'info');
    }
  };

  const handleViewTeacherDetails = (teacher: any) => {
    setSelectedTeacherDetails(teacher);
    setShowTeacherDetailsModal(true);
  };

  const handleViewRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    const teacher = teachers.find((t: any) => t.id === id);
    if (teacher && teacher.approvalStatus === 'pending') {
      const allRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      const requestToRemove = allRequests.find((r: any) => r.teacherData.id === id);
      if (requestToRemove) {
        const updatedRequests = allRequests.filter((r: any) => r.id !== requestToRemove.id);
        localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(updatedRequests));
        setPendingTeacherRequests(updatedRequests.filter((r: any) => r.schoolId === schoolId));
      }
    }

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      if (setTeachers) {
        setTeachers((prev: any[]) => prev.filter((t: any) => t.id !== id));
      }

      if (setRegisteredUsers) {
        const teacher = teachers.find((t: any) => t.id === id);
        if (teacher) {
          const updatedUsers = registeredUsers.filter((u: any) => u.email !== teacher.email);
          setRegisteredUsers(updatedUsers);
          try {
            localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
          } catch (e) {
            console.error('Error saving users:', e);
          }
        }
      }

      showNotification(`Teacher ${name} deleted successfully!`, 'success');
    }
  };

  const handleResetTeacherPassword = (id: string, name: string) => {
    const newPassword = prompt(`Enter new password for ${name}:`, 'password123');
    if (newPassword && newPassword.trim() && newPassword.trim().length >= 6) {
      if (setTeachers) {
        setTeachers((prev: any[]) =>
          prev.map((t: any) =>
            t.id === id ? { ...t, password: newPassword.trim() } : t
          )
        );
      }

      if (setRegisteredUsers) {
        const teacher = teachers.find((t: any) => t.id === id);
        if (teacher) {
          const updatedUsers = registeredUsers.map((u: any) =>
            u.email === teacher.email ? { ...u, password: newPassword.trim() } : u
          );
          setRegisteredUsers(updatedUsers);
          try {
            localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
          } catch (e) {
            console.error('Error saving users:', e);
          }
        }
      }

      showNotification(`Password reset for ${name} successfully!`, 'success');
    } else if (newPassword !== null) {
      showNotification('Password must be at least 6 characters!', 'error');
    }
  };

  const handleToggleTeacherStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Set ${currentStatus === 'Active' ? 'inactive' : 'active'} for this teacher?`)) {
      if (setTeachers) {
        setTeachers((prev: any[]) =>
          prev.map((t: any) =>
            t.id === id ? { ...t, status: newStatus } : t
          )
        );
      }

      if (setRegisteredUsers) {
        const teacher = teachers.find((t: any) => t.id === id);
        if (teacher) {
          const updatedUsers = registeredUsers.map((u: any) =>
            u.email === teacher.email ? { ...u, isActive: newStatus === 'Active' } : u
          );
          setRegisteredUsers(updatedUsers);
          try {
            localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
          } catch (e) {
            console.error('Error saving users:', e);
          }
        }
      }

      showNotification(`Teacher ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
  };

  // ============ FIXED: ENROLL STUDENT HANDLERS ============

  const handleEnrollStudent = (pendingStudent: any) => {
    setModalType('enrollStudent');
    setModalData({
      ...pendingStudent,
      grade: pendingStudent.grade || 'PreKG',
      section: 'A',
      classId: '',
    });
    setShowModal(true);
  };

  // FIXED: This is the critical function that was causing login issues
  // Now properly saves credentials and displays them in the modal
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

    // Create the student
    const newStudent = {
      id: `STU-${Date.now().toString().slice(-6)}`,
      admissionNo: `ADM${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      grade: modalData.grade || 'PreKG',
      classSection: modalData.section || 'A',
      classId: modalData.classId || '',
      email: modalData.email.trim(),
      phone: modalData.phone || '',
      parentName: modalData.parentName.trim(),
      parentEmail: modalData.parentEmail.trim(),
      attendanceRate: 0,
      tuitionTotal: 0,
      tuitionPaid: 0,
      tuitionBalance: 0,
      status: 'Active',
      schoolId: schoolId,
      schoolName: schoolName,
      disciplinaryRecords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onAddStudent) {
      onAddStudent(newStudent);
    } else if (setStudents) {
      setStudents((prev: any[]) => [...prev, newStudent]);
    }

    // Generate passwords
    const studentPassword = `STU${newStudent.id.slice(-6)}`;
    const parentPassword = `PAR${newStudent.id.slice(-6)}`;

    const createdUsers = [];
    let updatedUsers = [...registeredUsers];

    // Create STUDENT user account - FIXED: properly save with password
    if (newStudent.email && setRegisteredUsers) {
      // Check if student user already exists
      const studentExists = updatedUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.email.toLowerCase()
      );

      if (!studentExists) {
        const studentUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: newStudent.name,
          email: newStudent.email.toLowerCase(),
          password: studentPassword,
          role: 'student' as const,
          schoolId: schoolId,
          schoolName: schoolName,
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };

        updatedUsers = [...updatedUsers, studentUser];
        createdUsers.push({ type: 'Student', ...studentUser });
      } else {
        // Update existing student user with correct password
        updatedUsers = updatedUsers.map((u: any) =>
          u.email.toLowerCase() === newStudent.email.toLowerCase()
            ? { ...u, password: studentPassword, associatedId: newStudent.id }
            : u
        );
        createdUsers.push({
          type: 'Student',
          name: newStudent.name,
          email: newStudent.email,
          password: studentPassword,
          updated: true
        });
      }
    }

    // Create PARENT user account - FIXED: properly save with password
    if (newStudent.parentEmail && setRegisteredUsers) {
      const parentExists = updatedUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.parentEmail.toLowerCase()
      );

      if (!parentExists) {
        const parentUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: newStudent.parentName || `${newStudent.name}'s Parent`,
          email: newStudent.parentEmail.toLowerCase(),
          password: parentPassword,
          role: 'parent' as const,
          schoolId: schoolId,
          schoolName: schoolName,
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };

        updatedUsers = [...updatedUsers, parentUser];
        createdUsers.push({ type: 'Parent', ...parentUser });
      } else {
        // Update existing parent user with correct password
        updatedUsers = updatedUsers.map((u: any) =>
          u.email.toLowerCase() === newStudent.parentEmail.toLowerCase()
            ? { ...u, password: parentPassword, associatedId: newStudent.id }
            : u
        );
        createdUsers.push({
          type: 'Parent',
          name: newStudent.parentName,
          email: newStudent.parentEmail,
          password: parentPassword,
          updated: true
        });
      }
    }

    // FIXED: CRITICAL - Update the state and localStorage
    if (setRegisteredUsers) {
      setRegisteredUsers(updatedUsers);
    }

    // FIXED: CRITICAL - Directly save to localStorage as backup
    try {
      localStorage.setItem('safari_registered_users', JSON.stringify(updatedUsers));
      console.log('✅ Users saved to localStorage:', updatedUsers.length);
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }

    // Remove from pending students
    const allPending = JSON.parse(localStorage.getItem('safari_pending_students') || '[]');
    const updatedPending = allPending.filter((s: any) => s.id !== modalData.id);
    localStorage.setItem('safari_pending_students', JSON.stringify(updatedPending));
    setPendingStudents(updatedPending.filter((s: any) => s.schoolId === schoolId));

    // Build success message
    let successMsg = `✅ Student ${newStudent.name} enrolled successfully in ${newStudent.grade} Section ${newStudent.classSection}!`;

    if (createdUsers.length > 0) {
      successMsg += `\n\n🔑 Login credentials created:\n`;
      createdUsers.forEach((u: any) => {
        const status = u.updated ? ' (updated)' : '';
        successMsg += `\n${u.type}: ${u.email} / Password: ${u.password}${status}`;
      });
    } else {
      successMsg += `\n\n⚠️ No new login credentials created. Existing accounts were updated.`;
    }

    // FIXED: Save credentials for modal display - store the actual passwords
    const studentCred = createdUsers.find((u: any) => u.type === 'Student');
    const parentCred = createdUsers.find((u: any) => u.type === 'Parent');

    // FIXED: Set credentials data with the actual passwords from the created users
    setCredentialsData({
      student: studentCred ? {
        name: studentCred.name,
        email: studentCred.email,
        password: studentCred.password // Use the actual password from createdUsers
      } : (newStudent.email ? {
        name: newStudent.name,
        email: newStudent.email,
        password: studentPassword // Fallback to generated password
      } : null),
      parent: parentCred ? {
        name: parentCred.name,
        email: parentCred.email,
        password: parentCred.password // Use the actual password from createdUsers
      } : (newStudent.parentEmail ? {
        name: newStudent.parentName || `${newStudent.name}'s Parent`,
        email: newStudent.parentEmail,
        password: parentPassword // Fallback to generated password
      } : null),
      // FIXED: Add student name for the modal title
      studentName: newStudent.name,
      grade: newStudent.grade
    });

    showNotification(successMsg, 'success');

    // FIXED: Show credentials modal if we have credentials to display
    if (createdUsers.length > 0 || newStudent.email || newStudent.parentEmail) {
      console.log('📋 Showing credentials modal with data:', credentialsData);
      setShowCredentialsModal(true);
    }

    setShowModal(false);
    setModalData({});
  };

  // ============ FILTERS ============
  const getFilteredTeachers = () => {
    const schoolTeachers = teachers.filter((t: any) => {
      if (t.schoolId) {
        return t.schoolId === schoolId;
      }
      if (t.schoolName) {
        return t.schoolName === schoolName;
      }
      return true;
    });

    if (!searchQuery) return schoolTeachers;
    return schoolTeachers.filter((t: any) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredStaff = () => {
    const schoolStaff = staffMembers.filter((s: any) => s.schoolId === schoolId || !s.schoolId);
    if (!searchQuery) return schoolStaff;
    return schoolStaff.filter((s: any) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredParents = () => {
    const allParents = getSchoolParents();
    if (!parentSearchQuery) return allParents;
    return allParents.filter((p: any) =>
      p.name?.toLowerCase().includes(parentSearchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(parentSearchQuery.toLowerCase()) ||
      p.studentNames?.toLowerCase().includes(parentSearchQuery.toLowerCase())
    );
  };

  const schoolStudents = students.filter((s: any) => s.schoolId === schoolId || !s.schoolId);
  const pendingTeacherCount = pendingTeacherRequests.length;
  const approvedTeacherCount = approvedTeachers.length;
  const rejectedTeacherCount = rejectedTeachers.length;

  const manualRefresh = () => {
    loadPendingTeacherRequests();
    loadApprovedRejectedTeachers();
    showNotification('Queue refreshed!', 'info');
  };

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Principal Dashboard</h2>
            <p className="text-blue-200 mt-1">Welcome back, {userName}</p>
            {schoolName && (
              <p className="text-blue-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {schoolName}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Enrolled Students</p>
                <p className="font-bold">{schoolStudents.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Pending Enrollment</p>
                <p className="font-bold text-yellow-300">{pendingStudents.length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Teachers</p>
                <p className="font-bold">{getFilteredTeachers().length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-200">Staff</p>
                <p className="font-bold">{getFilteredStaff().length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl relative">
                <p className="text-sm text-blue-200">Pending Teachers</p>
                <p className="font-bold text-yellow-300">{pendingTeacherCount}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddTeacher}
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Add Teacher
            </button>
            <button
              onClick={handleAddStaff}
              className="bg-purple-500/30 hover:bg-purple-500/40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Enrollment</p>
              <p className="text-xl font-bold text-yellow-600">{pendingStudents.length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Enrolled Students</p>
              <p className="text-xl font-bold text-slate-900">{schoolStudents.length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Teachers</p>
              <p className="text-xl font-bold text-slate-900">{getFilteredTeachers().filter((t: any) => t.approvalStatus === 'approved').length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('staff')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Staff</p>
              <p className="text-xl font-bold text-slate-900">{getFilteredStaff().length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('parents')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Parents</p>
              <p className="text-xl font-bold text-slate-900">{getSchoolParents().length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => { setActiveTab('teacher queue'); manualRefresh(); }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Teachers</p>
              <p className="text-xl font-bold text-yellow-600">{pendingTeacherCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Pending', 'Students', 'Teachers', 'Staff', 'Parents', 'Teacher Queue', 'Approved', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab.toLowerCase());
              if (tab.toLowerCase() === 'teacher queue') {
                manualRefresh();
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
            {tab === 'Parents' && getSchoolParents().length > 0 && (
              <span className="ml-1 bg-indigo-400 text-indigo-900 px-1.5 py-0.5 rounded-full text-xs">
                {getSchoolParents().length}
              </span>
            )}
            {tab === 'Teacher Queue' && pendingTeacherCount > 0 && (
              <span className="ml-1 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-xs">
                {pendingTeacherCount}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={manualRefresh}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer ml-auto"
          title="Manually refresh queue"
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <UserPlus className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Teacher Management</h4>
                  <p className="text-xs text-slate-500">{getFilteredTeachers().length} teachers</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">Add teachers (they will go to queue for approval) or manage existing teachers.</p>
              <button
                onClick={() => { setActiveTab('teachers'); }}
                className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Manage Teachers
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Staff Management</h4>
                  <p className="text-xs text-slate-500">{getFilteredStaff().length} staff</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">Add staff members like Finance Officers, Registrars, etc.</p>
              <button
                onClick={() => { setActiveTab('staff'); }}
                className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Manage Staff
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Parent Management</h4>
                  <p className="text-xs text-slate-500">{getSchoolParents().length} parents</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">View and manage parent accounts linked to your school.</p>
              <button
                onClick={() => { setActiveTab('parents'); }}
                className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Manage Parents
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Pending Approvals</h4>
                  <p className="text-xs text-slate-500">{pendingTeacherCount} teachers pending</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">Review and approve teachers who are waiting for activation.</p>
              <button
                onClick={() => { setActiveTab('teacher queue'); manualRefresh(); }}
                className="w-full px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-semibold hover:bg-yellow-100 transition-colors cursor-pointer"
              >
                Review Pending Teachers
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> School Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-700">{schoolStudents.length}</p>
                <p className="text-xs text-blue-600 mt-1">Total Students</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-700">{getFilteredTeachers().filter((t: any) => t.approvalStatus === 'approved').length}</p>
                <p className="text-xs text-emerald-600 mt-1">Active Teachers</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-700">{getFilteredStaff().length}</p>
                <p className="text-xs text-purple-600 mt-1">Staff Members</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <p className="text-2xl font-bold text-indigo-700">{getSchoolParents().length}</p>
                <p className="text-xs text-indigo-600 mt-1">Parents</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-700">{pendingTeacherCount}</p>
                <p className="text-xs text-yellow-600 mt-1">Pending Teachers</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-700">{approvedTeacherCount}</p>
                <p className="text-xs text-green-600 mt-1">Approved Teachers</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-700">{rejectedTeacherCount}</p>
                <p className="text-xs text-red-600 mt-1">Rejected Teachers</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-700">{pendingStudents.length}</p>
                <p className="text-xs text-amber-600 mt-1">Pending Enrollment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENDING STUDENTS TAB */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClockIcon className="h-4 w-4" /> Pending Enrollment ({pendingStudents.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pending..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Grade Applied</th>
                  <th className="px-4 py-2 text-left">Fee Paid</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No pending enrollments. Students will appear here after finance approval.
                    </td>
                  </tr>
                ) : (
                  pendingStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{student.candidateName || student.name}</td>
                      <td className="px-4 py-3">{student.parentName || 'N/A'}</td>
                      <td className="px-4 py-3">{student.gradeApplied || student.grade || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-600 font-semibold">${student.feePaid || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          Approved
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEnrollStudent(student)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="h-3 w-3" /> Enroll
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

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Enrolled Students ({schoolStudents.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Admission</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Section</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No students enrolled yet. Enroll from the Pending tab.
                    </td>
                  </tr>
                ) : (
                  schoolStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">{student.admissionNo || 'N/A'}</td>
                      <td className="px-4 py-3">{student.grade || 'N/A'}</td>
                      <td className="px-4 py-3">{student.classSection || 'N/A'}</td>
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

      {/* TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> All Teachers ({getFilteredTeachers().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={handleAddTeacher}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Teacher
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Subjects</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Approval</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredTeachers().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No teachers found for this school.
                    </td>
                  </tr>
                ) : (
                  getFilteredTeachers().map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{teacher.name}</td>
                      <td className="px-4 py-3 text-sm">{teacher.email}</td>
                      <td className="px-4 py-3">{teacher.department || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.subjects || []).slice(0, 2).map((sub: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{sub}</span>
                          ))}
                          {(teacher.subjects || []).length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{(teacher.subjects || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          teacher.status === 'Active' ? 'bg-green-100 text-green-700' :
                          teacher.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {teacher.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          teacher.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          teacher.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {teacher.approvalStatus === 'approved' ? 'Approved' :
                           teacher.approvalStatus === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewTeacherDetails(teacher)}
                            className="p-1 rounded transition-colors text-blue-500 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {teacher.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  const request = pendingTeacherRequests.find((r: any) => r.teacherData.id === teacher.id);
                                  if (request) {
                                    handleApproveTeacher(request);
                                  } else {
                                    showNotification('Error: Request not found in queue. Try refreshing.', 'error');
                                    manualRefresh();
                                  }
                                }}
                                className="p-1 rounded transition-colors text-emerald-500 hover:bg-emerald-50"
                                title="Approve"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const request = pendingTeacherRequests.find((r: any) => r.teacherData.id === teacher.id);
                                  if (request) handleRejectTeacher(request);
                                }}
                                className="p-1 rounded transition-colors text-red-500 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleTeacherStatus(teacher.id, teacher.status)}
                            className={`p-1 rounded transition-colors ${
                              teacher.status === 'Active'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={teacher.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {teacher.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleResetTeacherPassword(teacher.id, teacher.name)}
                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1 rounded transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* STAFF TAB */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Staff ({getFilteredStaff().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={handleAddStaff}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Staff
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredStaff().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No staff members found for this school.
                    </td>
                  </tr>
                ) : (
                  getFilteredStaff().map((staff: any) => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{staff.name}</td>
                      <td className="px-4 py-3 text-sm">{staff.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {staff.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{staff.department || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {staff.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleToggleStaffStatus(staff.id, staff.status)}
                            className={`p-1 rounded transition-colors ${
                              staff.status === 'Active'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {staff.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleResetStaffPassword(staff.id, staff.name)}
                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1 rounded transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* PARENTS TAB */}
      {activeTab === 'parents' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" /> Parents Directory ({getSchoolParents().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parents..."
                  value={parentSearchQuery}
                  onChange={(e) => setParentSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
              <span className="text-sm text-slate-500">{getSchoolParents().length} parents</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Linked Students</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredParents().length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      {parentSearchQuery ? 'No parents match your search.' : 'No parents found for this school.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredParents().map((parent: any) => (
                    <tr key={parent.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{parent.name}</td>
                      <td className="px-4 py-3 text-sm">{parent.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {parent.linkedStudents && parent.linkedStudents.length > 0 ? (
                            parent.linkedStudents.map((s: any, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {s.name} ({s.grade})
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">No students linked</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          parent.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {parent.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewParent(parent)}
                            className="p-1 rounded transition-colors text-blue-500 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCommunicateParent(parent)}
                            className="p-1 rounded transition-colors text-indigo-500 hover:bg-indigo-50"
                            title="Send Message"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetParentPassword(parent)}
                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1 rounded transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleParentStatus(parent)}
                            className={`p-1 rounded transition-colors ${
                              parent.isActive !== false
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={parent.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {parent.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteParent(parent)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* TEACHER QUEUE TAB */}
      {activeTab === 'teacher queue' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-yellow-500" />
              Pending Teacher Approvals ({pendingTeacherRequests.length})
            </h3>
            <div className="flex gap-2 items-center flex-wrap">
              {pendingTeacherRequests.length > 0 && (
                <div className="flex gap-1">
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircleIcon className="h-3 w-3" /> Approve Selected
                  </button>
                  <button
                    onClick={handleBulkReject}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <XCircleIcon className="h-3 w-3" /> Reject Selected
                  </button>
                  {selectedTeachers.size > 0 && (
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 cursor-pointer"
                    >
                      Clear ({selectedTeachers.size})
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={manualRefresh}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Teacher</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Requested By</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTeacherRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                        <p className="font-medium">No pending teacher requests!</p>
                        <p className="text-sm">All teachers have been processed.</p>
                        <button
                          onClick={manualRefresh}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold cursor-pointer"
                        >
                          Refresh Queue
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingTeacherRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{request.teacherData.name}</td>
                      <td className="px-4 py-3">{request.teacherData.email}</td>
                      <td className="px-4 py-3">{request.teacherData.department || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-blue-600 font-medium">
                          {request.requestedBy} ({request.requestedByRole})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(request.requestedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1 w-fit">
                          <ClockIcon className="h-3 w-3" /> Pending
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewRequestDetails(request)}
                            className="p-1 rounded transition-colors text-blue-500 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApproveTeacher(request)}
                            className="p-1 rounded transition-colors text-emerald-500 hover:bg-emerald-50"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTeacher(request)}
                            className="p-1 rounded transition-colors text-red-500 hover:bg-red-50"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
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

      {/* APPROVED TEACHERS TAB */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              Approved Teachers ({approvedTeachers.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search approved..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
              {pendingTeacherRequests.length > 0 && (
                <button
                  onClick={() => setActiveTab('teacher queue')}
                  className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-semibold hover:bg-yellow-200 cursor-pointer flex items-center gap-1"
                >
                  <ClockIcon className="h-3 w-3" />
                  {pendingTeacherRequests.length} in Queue
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Approved By</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-slate-300 mx-auto" />
                        <p className="font-medium">No approved teachers yet</p>
                        <p className="text-sm">Teachers will appear here after you approve them.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  approvedTeachers.map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{teacher.name}</td>
                      <td className="px-4 py-3 text-sm">{teacher.email}</td>
                      <td className="px-4 py-3">{teacher.department || 'N/A'}</td>
                      <td className="px-4 py-3">{teacher.approvedBy || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {teacher.approvedDate ? new Date(teacher.approvedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          Active
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

      {/* REJECTED TEACHERS TAB */}
      {activeTab === 'rejected' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              Rejected Teachers ({rejectedTeachers.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rejected..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
                />
              </div>
              {pendingTeacherRequests.length > 0 && (
                <button
                  onClick={() => setActiveTab('teacher queue')}
                  className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-semibold hover:bg-yellow-200 cursor-pointer flex items-center gap-1"
                >
                  <ClockIcon className="h-3 w-3" />
                  {pendingTeacherRequests.length} in Queue
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Rejection Reason</th>
                  <th className="px-4 py-2 text-left">Rejected By</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rejectedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                        <p className="font-medium">No rejected teachers</p>
                        <p className="text-sm">All teachers have been approved or are pending.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rejectedTeachers.map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{teacher.name}</td>
                      <td className="px-4 py-3 text-sm">{teacher.email}</td>
                      <td className="px-4 py-3">{teacher.department || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 text-sm">
                          {teacher.rejectionReason || 'No reason provided'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {teacher.rejectedBy || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleResubmitTeacher(teacher)}
                            className="p-1 rounded transition-colors text-amber-500 hover:bg-amber-50"
                            title="Re-submit for approval"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePermanentlyRemoveTeacher(teacher)}
                            className="p-1 rounded transition-colors text-red-500 hover:bg-red-50"
                            title="Permanently remove"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
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

      {/* ============ MODALS ============ */}

      {/* ADD STAFF MODAL */}
      {showModal && modalType === 'addStaff' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" /> Add Staff & Create Login
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
              <p className="text-xs text-blue-600 mt-1 ml-6">
                <Shield className="h-3 w-3 inline mr-1" />
                A login account will be automatically created for this staff member.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Admin"
                  value={modalData.name || ''}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. sarah@school.com"
                  value={modalData.email || ''}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Login Password <span className="text-red-500">*</span>
                  <span className="text-slate-400 font-normal ml-1">(min 6 characters)</span>
                </label>
                <input
                  type="password"
                  placeholder="Set initial password"
                  value={modalData.password || ''}
                  onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select
                  required
                  value={modalData.role || 'Administrative'}
                  onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {modalData.role === 'Finance Officer' && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✅ This will grant Finance Officer access to the Finance Dashboard.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Department"
                  value={modalData.department || ''}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +971 50 123 4567"
                  value={modalData.phone || ''}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  value={modalData.hireDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setModalData({ ...modalData, hireDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                />
              </div>
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
                onClick={handleSaveStaff}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" /> Add Staff & Create Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showModal && modalType === 'addTeacher' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" /> Add Teacher (Queue)
              </h3>
              <button
                onClick={() => { setShowModal(false); setModalData({}); setIsSubmitting(false); }}
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
              <p className="text-xs text-amber-600 mt-1 ml-6 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>This teacher will be placed in the queue for approval before they can login.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  value={modalData.name || ''}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. john.smith@school.com"
                  value={modalData.email || ''}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Login Password <span className="text-red-500">*</span>
                  <span className="text-slate-400 font-normal ml-1">(min 6 characters)</span>
                </label>
                <input
                  type="password"
                  placeholder="Set initial password"
                  value={modalData.password || ''}
                  onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Password will be active only after approval.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={modalData.department || ''}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  value={modalData.subjects || ''}
                  onChange={(e) => setModalData({ ...modalData, subjects: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. B.Ed, M.Sc, PhD"
                  value={modalData.qualifications || ''}
                  onChange={(e) => setModalData({ ...modalData, qualifications: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +971 50 123 4567"
                  value={modalData.phone || ''}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  value={modalData.hireDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setModalData({ ...modalData, hireDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowModal(false); setModalData({}); setIsSubmitting(false); }}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeacher}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Add Teacher (Pending Approval)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL - FIXED with proper credentials saving */}
      {showModal && modalType === 'enrollStudent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" /> Enroll Student
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

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Fee paid: <strong>${modalData.feePaid || 0}</strong>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                <User className="h-3 w-3 inline mr-1" />
                Student and Parent login accounts will be created automatically with passwords.
              </p>
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Default password: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">STU{modalData.id?.slice(-6) || 'XXXXXX'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grade *</label>
                    <select
                      value={modalData.grade || 'PreKG'}
                      onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    >
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section *</label>
                    <select
                      value={modalData.section || 'A'}
                      onChange={(e) => setModalData({ ...modalData, section: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    >
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={modalData.phone || ''}
                    onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Default password: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">PAR{modalData.id?.slice(-6) || 'XXXXXX'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
              <p className="text-sm text-amber-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Login credentials will be automatically created:</strong><br />
                  Student: <span className="font-mono">{modalData.email || 'student@email.com'}</span> / Password: <span className="font-mono">STU{modalData.id?.slice(-6) || 'XXXXXX'}</span><br />
                  Parent: <span className="font-mono">{modalData.parentEmail || 'parent@email.com'}</span> / Password: <span className="font-mono">PAR{modalData.id?.slice(-6) || 'XXXXXX'}</span>
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
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <GraduationCap className="h-4 w-4" /> Enroll & Create Logins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL - FIXED with copy functionality and correct credential display */}
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

      {/* APPROVE TEACHER MODAL */}
      {showModal && modalType === 'approveTeacher' && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                Approve Teacher
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-medium">{selectedRequest.teacherData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium">{selectedRequest.teacherData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium">{selectedRequest.teacherData.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">School:</span>
                  <span className="font-medium">{selectedRequest.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested By:</span>
                  <span className="font-medium">{selectedRequest.requestedBy} ({selectedRequest.requestedByRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Date:</span>
                  <span className="font-medium">{new Date(selectedRequest.requestedDate).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  value={modalData.notes || ''}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={3}
                  placeholder="Add any notes about this approval..."
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-sm text-emerald-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Approving this teacher will create their login account and allow them to access the system.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmApproval}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircleIcon className="h-4 w-4" /> Approve Teacher
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT TEACHER MODAL */}
      {showModal && modalType === 'rejectTeacher' && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                Reject Teacher
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-medium">{selectedRequest.teacherData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium">{selectedRequest.teacherData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium">{selectedRequest.teacherData.department || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  rows={4}
                  placeholder="Please provide a detailed reason for rejecting this teacher..."
                />
                <p className="text-xs text-slate-400 mt-1">
                  {rejectionReason.length}/500 characters
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>This teacher will be moved to the rejected list. They can be re-submitted later.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmRejection}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircleIcon className="h-4 w-4" /> Reject Teacher
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK APPROVE MODAL */}
      {showModal && modalType === 'bulkApprove' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                Bulk Approve Teachers
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setBulkActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  You are about to approve <strong>{selectedTeachers.size}</strong> teacher(s).
                </p>
                <ul className="mt-2 text-sm text-blue-600 max-h-32 overflow-y-auto">
                  {pendingTeacherRequests
                    .filter(r => selectedTeachers.has(r.id))
                    .map(r => (
                      <li key={r.id} className="py-0.5">• {r.teacherData.name}</li>
                    ))}
                </ul>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-sm text-emerald-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>All selected teachers will receive login credentials and be moved to the approved list.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmBulkApproval}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircleIcon className="h-4 w-4" /> Approve All ({selectedTeachers.size})
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setBulkActionType(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK REJECT MODAL */}
      {showModal && modalType === 'bulkReject' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                Bulk Reject Teachers
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setBulkActionType(null);
                  setRejectionReason('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  You are about to reject <strong>{selectedTeachers.size}</strong> teacher(s).
                </p>
                <ul className="mt-2 text-sm text-blue-600 max-h-32 overflow-y-auto">
                  {pendingTeacherRequests
                    .filter(r => selectedTeachers.has(r.id))
                    .map(r => (
                      <li key={r.id} className="py-0.5">• {r.teacherData.name}</li>
                    ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  rows={3}
                  placeholder="Provide a reason for rejecting these teachers..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>All selected teachers will be moved to the rejected list with the reason provided above.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmBulkRejection}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircleIcon className="h-4 w-4" /> Reject All ({selectedTeachers.size})
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setBulkActionType(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REQUEST DETAILS MODAL */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Teacher Request Details</h3>
              <button
                onClick={() => { setShowRequestModal(false); setSelectedRequest(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-bold">{selectedRequest.teacherData.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-bold text-sm">{selectedRequest.teacherData.email}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="font-bold">{selectedRequest.teacherData.department || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Subjects</p>
                  <p className="font-bold">{(selectedRequest.teacherData.subjects || []).join(', ') || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-slate-500">Requested By</p>
                  <p className="font-bold">{selectedRequest.requestedBy} ({selectedRequest.requestedByRole})</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-slate-500">Requested Date</p>
                  <p className="font-bold">{new Date(selectedRequest.requestedDate).toLocaleString()}</p>
                </div>
                {selectedRequest.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    handleApproveTeacher(selectedRequest);
                  }}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircleIcon className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    handleRejectTeacher(selectedRequest);
                  }}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircleIcon className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => { setShowRequestModal(false); setSelectedRequest(null); }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TEACHER DETAILS MODAL */}
      {showTeacherDetailsModal && selectedTeacherDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Teacher Details</h3>
              <button
                onClick={() => { setShowTeacherDetailsModal(false); setSelectedTeacherDetails(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-bold">{selectedTeacherDetails.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-bold text-sm">{selectedTeacherDetails.email}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="font-bold">{selectedTeacherDetails.department || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTeacherDetails.status === 'Active' ? 'bg-green-100 text-green-700' :
                    selectedTeacherDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedTeacherDetails.status || 'Active'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Approval Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTeacherDetails.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedTeacherDetails.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedTeacherDetails.approvalStatus || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500">School</p>
                  <p className="font-bold">{selectedTeacherDetails.schoolName || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-slate-500">Subjects</p>
                  <p className="font-bold">{(selectedTeacherDetails.subjects || []).join(', ') || 'N/A'}</p>
                </div>
                {selectedTeacherDetails.qualifications && selectedTeacherDetails.qualifications.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Qualifications</p>
                    <p className="font-bold">{(selectedTeacherDetails.qualifications || []).join(', ')}</p>
                  </div>
                )}
                {selectedTeacherDetails.hireDate && (
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500">Hire Date</p>
                    <p className="font-bold">{new Date(selectedTeacherDetails.hireDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setShowTeacherDetailsModal(false); setSelectedTeacherDetails(null); }}
                className="w-full bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
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