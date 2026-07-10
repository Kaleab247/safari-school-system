// VicePrincipalModule.tsx - Updated with staff management and profile

import React, { useState } from 'react';
import {
  Users, GraduationCap, BookOpen, Calendar, Clock, AlertTriangle,
  CheckCircle, XCircle, UserCheck, FileText, BarChart3,
  Plus, Edit, Trash2, Eye, Search, Filter, ChevronRight,
  Shield, Award, Medal, Trophy, Star, TrendingUp, TrendingDown, X,
  UserPlus, Mail, Phone, MapPin, Briefcase, BookMarked,
  UserCog, KeyRound, Save, Lock, UserX
} from 'lucide-react';

interface VicePrincipalModuleProps {
  userName: string;
  students: any[];
  teachers: any[];
  grades: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onAddStudent?: (student: any) => void;
  setStudents?: any;
  setTeachers?: any;
  schoolId?: string;
  schoolName?: string;
  registeredUsers?: any[];
  setRegisteredUsers?: any;
}

export default function VicePrincipalModule({
  userName,
  students = [],
  teachers = [],
  grades = [],
  showNotification,
  onAddStudent,
  setStudents,
  setTeachers,
  schoolId = '',
  schoolName = '',
  registeredUsers = [],
  setRegisteredUsers
}: VicePrincipalModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Subjects state - stored in localStorage or local state
  const [subjects, setSubjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('safari_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Staff members (non-teaching staff)
  const [staffMembers, setStaffMembers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('safari_staff');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pendingDiscipline = students.flatMap((s: any) =>
    (s.disciplinaryRecords || []).filter((r: any) => r.status === 'Pending')
  ).length;

  const resolvedDiscipline = students.flatMap((s: any) =>
    (s.disciplinaryRecords || []).filter((r: any) => r.status === 'Resolved')
  ).length;

  // Save subjects to localStorage
  const saveSubjects = (newSubjects: any[]) => {
    setSubjects(newSubjects);
    localStorage.setItem('safari_subjects', JSON.stringify(newSubjects));
  };

  // Save staff to localStorage
  const saveStaff = (newStaff: any[]) => {
    setStaffMembers(newStaff);
    localStorage.setItem('safari_staff', JSON.stringify(newStaff));
  };

  // ============ STUDENT HANDLERS ============
  const handleAddStudent = () => {
    setModalType('addStudent');
    setModalData({ name: '', email: '', grade: 'Grade 9', parentName: '', parentEmail: '', phone: '' });
    setShowModal(true);
  };

  const handleSaveStudent = () => {
    if (!modalData.name?.trim() || !modalData.email?.trim()) {
      showNotification('Name and Email are required!', 'error');
      return;
    }

    const newStudent = {
      id: `STU-${Date.now().toString().slice(-6)}`,
      admissionNo: `ADM${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      grade: modalData.grade || 'Grade 9',
      classSection: modalData.classSection || 'A',
      email: modalData.email.trim(),
      phone: modalData.phone || '',
      parentName: modalData.parentName || '',
      parentEmail: modalData.parentEmail || '',
      attendanceRate: 0,
      tuitionTotal: 0,
      tuitionPaid: 0,
      tuitionBalance: 0,
      status: 'Active',
      schoolId: schoolId,
      schoolName: schoolName,
      disciplinaryRecords: [],
      createdAt: new Date().toISOString()
    };

    if (onAddStudent) {
      onAddStudent(newStudent);
    } else if (setStudents) {
      setStudents((prev: any[]) => [...prev, newStudent]);
    }

    showNotification(`Student ${newStudent.name} enrolled successfully!`, 'success');
    setShowModal(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      if (setStudents) {
        setStudents((prev: any[]) => prev.filter((s: any) => s.id !== id));
      }
      showNotification(`Student ${name} deleted successfully!`, 'success');
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
      subjects: [],
      phone: '',
      hireDate: '',
      schoolId: schoolId,
      schoolName: schoolName,
      role: 'teacher'
    });
    setShowModal(true);
  };

  const handleSaveTeacher = () => {
    if (!modalData.name?.trim() || !modalData.email?.trim() || !modalData.password?.trim()) {
      showNotification('Name, Email and Password are required!', 'error');
      return;
    }

    // Check if email already exists in registered users
    if (registeredUsers.some((u: any) => u.email.toLowerCase() === modalData.email.trim().toLowerCase())) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    const newTeacher = {
      id: `TCH-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      email: modalData.email.trim(),
      password: modalData.password.trim(),
      department: modalData.department || 'General',
      subjects: modalData.subjects || [],
      phone: modalData.phone || '',
      hireDate: modalData.hireDate || new Date().toISOString().split('T')[0],
      salary: modalData.salary || 0,
      attendanceRate: 0,
      performanceScore: 0,
      status: 'Active',
      schoolId: schoolId,
      schoolName: schoolName,
      qualifications: modalData.qualifications?.split(',').map((q: string) => q.trim()) || [],
      createdAt: new Date().toISOString()
    };

    if (setTeachers) {
      setTeachers((prev: any[]) => [...prev, newTeacher]);
    }

    // Register as a user
    if (setRegisteredUsers) {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: newTeacher.name,
        email: newTeacher.email,
        password: newTeacher.password,
        role: 'teacher',
        schoolId: schoolId,
        schoolName: schoolName,
        isActive: true,
        createdAt: new Date().toISOString(),
        associatedId: newTeacher.id
      };
      setRegisteredUsers([...registeredUsers, newUser]);
    }

    showNotification(`Teacher ${newTeacher.name} added successfully! Login credentials created.`, 'success');
    setShowModal(false);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also remove their login access.`)) {
      if (setTeachers) {
        setTeachers((prev: any[]) => prev.filter((t: any) => t.id !== id));
      }

      // Remove from registered users
      if (setRegisteredUsers) {
        const teacher = teachers.find((t: any) => t.id === id);
        if (teacher) {
          setRegisteredUsers(registeredUsers.filter((u: any) => u.email !== teacher.email));
        }
      }

      showNotification(`Teacher ${name} deleted successfully!`, 'success');
    }
  };

  const handleResetTeacherPassword = (id: string, name: string) => {
    const newPassword = prompt(`Enter new password for ${name}:`, 'password123');
    if (newPassword && newPassword.trim()) {
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
          setRegisteredUsers(registeredUsers.map((u: any) =>
            u.email === teacher.email ? { ...u, password: newPassword.trim() } : u
          ));
        }
      }

      showNotification(`Password reset for ${name} successfully!`, 'success');
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
          setRegisteredUsers(registeredUsers.map((u: any) =>
            u.email === teacher.email ? { ...u, isActive: newStatus === 'Active' } : u
          ));
        }
      }

      showNotification(`Teacher ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
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
      hireDate: '',
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

    // Check if email already exists in registered users
    if (registeredUsers.some((u: any) => u.email.toLowerCase() === modalData.email.trim().toLowerCase())) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      email: modalData.email.trim(),
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

    if (setRegisteredUsers) {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: newStaff.name,
        email: newStaff.email,
        password: newStaff.password,
        role: 'staff',
        schoolId: schoolId,
        schoolName: schoolName,
        isActive: true,
        createdAt: new Date().toISOString(),
        associatedId: newStaff.id
      };
      setRegisteredUsers([...registeredUsers, newUser]);
    }

    showNotification(`Staff ${newStaff.name} added successfully! Login credentials created.`, 'success');
    setShowModal(false);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also remove their login access.`)) {
      const staff = staffMembers.find((s: any) => s.id === id);
      saveStaff(staffMembers.filter((s: any) => s.id !== id));

      if (setRegisteredUsers && staff) {
        setRegisteredUsers(registeredUsers.filter((u: any) => u.email !== staff.email));
      }

      showNotification(`Staff ${name} deleted successfully!`, 'success');
    }
  };

  const handleResetStaffPassword = (id: string, name: string) => {
    const newPassword = prompt(`Enter new password for ${name}:`, 'password123');
    if (newPassword && newPassword.trim()) {
      const updatedStaff = staffMembers.map((s: any) =>
        s.id === id ? { ...s, password: newPassword.trim() } : s
      );
      saveStaff(updatedStaff);

      const staff = staffMembers.find((s: any) => s.id === id);
      if (setRegisteredUsers && staff) {
        setRegisteredUsers(registeredUsers.map((u: any) =>
          u.email === staff.email ? { ...u, password: newPassword.trim() } : u
        ));
      }

      showNotification(`Password reset for ${name} successfully!`, 'success');
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
        setRegisteredUsers(registeredUsers.map((u: any) =>
          u.email === staff.email ? { ...u, isActive: newStatus === 'Active' } : u
        ));
      }

      showNotification(`Staff ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
  };

  // ============ SUBJECT HANDLERS ============
  const handleAddSubject = () => {
    setModalType('addSubject');
    setModalData({ name: '', code: '', description: '', teacherId: '', department: '', schoolId: schoolId, schoolName: schoolName });
    setShowModal(true);
  };

  const handleSaveSubject = () => {
    if (!modalData.name?.trim() || !modalData.code?.trim()) {
      showNotification('Subject name and code are required!', 'error');
      return;
    }

    const newSubject = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      code: modalData.code.trim().toUpperCase(),
      description: modalData.description || '',
      teacherId: modalData.teacherId || '',
      teacherName: modalData.teacherId ? getFilteredTeachers().find((t: any) => t.id === modalData.teacherId)?.name : '',
      department: modalData.department || 'General',
      schoolId: schoolId,
      schoolName: schoolName,
      createdAt: new Date().toISOString()
    };

    saveSubjects([...subjects, newSubject]);

    if (modalData.teacherId && setTeachers) {
      setTeachers((prev: any[]) =>
        prev.map((t: any) =>
          t.id === modalData.teacherId
            ? { ...t, subjects: [...(t.subjects || []), modalData.name.trim()] }
            : t
        )
      );
    }

    showNotification(`Subject "${newSubject.name}" added successfully!`, 'success');
    setShowModal(false);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete subject "${name}"?`)) {
      saveSubjects(subjects.filter((s: any) => s.id !== id));
      showNotification(`Subject "${name}" deleted successfully!`, 'success');
    }
  };

  const handleAssignTeacherToSubject = (subjectId: string, teacherId: string) => {
    const subject = subjects.find((s: any) => s.id === subjectId);
    if (!subject) return;

    const teacher = getFilteredTeachers().find((t: any) => t.id === teacherId);
    if (!teacher) {
      showNotification('Selected teacher not found!', 'error');
      return;
    }

    const updatedSubjects = subjects.map((s: any) =>
      s.id === subjectId
        ? { ...s, teacherId: teacher.id, teacherName: teacher.name }
        : s
    );
    saveSubjects(updatedSubjects);

    if (setTeachers) {
      setTeachers((prev: any[]) =>
        prev.map((t: any) =>
          t.id === teacherId
            ? { ...t, subjects: [...new Set([...(t.subjects || []), subject.name])] }
            : t
        )
      );
    }

    showNotification(`Teacher ${teacher.name} assigned to ${subject.name}`, 'success');
  };

  // ============ DISCIPLINE HANDLERS ============
  const handleAddDiscipline = () => {
    setModalType('addDiscipline');
    setModalData({ studentId: '', incident: '', actionTaken: '' });
    setShowModal(true);
  };

  const handleSaveDiscipline = () => {
    showNotification('Discipline case recorded successfully!', 'success');
    setShowModal(false);
  };

  const handleResolveCase = (record: any) => {
    showNotification(`Case for ${record.studentName} resolved!`, 'success');
  };

  // ============ FILTERS ============
  const getFilteredStudents = () => {
    const schoolStudents = students.filter((s: any) => s.schoolId === schoolId || !s.schoolId);
    if (!searchQuery) return schoolStudents;
    return schoolStudents.filter((s: any) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredTeachers = () => {
    const schoolTeachers = teachers.filter((t: any) => t.schoolId === schoolId || !t.schoolId);
    if (!searchQuery) return schoolTeachers;
    return schoolTeachers.filter((t: any) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredSubjects = () => {
    const schoolSubjects = subjects.filter((s: any) => s.schoolId === schoolId || !s.schoolId);
    if (!searchQuery) return schoolSubjects;
    return schoolSubjects.filter((s: any) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Get school-specific registered users
  const getSchoolUsers = () => {
    return registeredUsers.filter((u: any) => u.schoolId === schoolId || !u.schoolId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Vice Principal Dashboard</h2>
            <p className="text-purple-200 mt-1">Academic & Disciplinary Management</p>
            {schoolName && (
              <p className="text-purple-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {schoolName}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-200">Total Students</p>
                <p className="font-bold">{getFilteredStudents().length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-200">Pending Cases</p>
                <p className="font-bold text-yellow-300">{pendingDiscipline}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-200">Resolved Cases</p>
                <p className="font-bold text-green-300">{resolvedDiscipline}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-200">Teachers</p>
                <p className="font-bold">{getFilteredTeachers().length}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddStudent}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Enroll Student
            </button>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('discipline')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Resolved</p>
              <p className="text-xl font-bold text-green-600">{resolvedDiscipline}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('discipline')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{pendingDiscipline}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Teachers</p>
              <p className="text-xl font-bold text-slate-900">{getFilteredTeachers().length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('subjects')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <BookOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Subjects</p>
              <p className="text-xl font-bold text-slate-900">{getFilteredSubjects().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Discipline', 'Students', 'Teachers', 'Staff', 'Subjects'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase()
                ? 'bg-purple-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Discipline Cases */}
      {activeTab === 'discipline' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> All Discipline Cases
            </h3>
            <button
              onClick={handleAddDiscipline}
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Case
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Incident</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredStudents().flatMap((s: any) =>
                  (s.disciplinaryRecords || []).map((r: any) => ({ ...r, studentName: s.name, studentId: s.id }))
                ).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No discipline cases recorded yet.
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().flatMap((s: any) =>
                    (s.disciplinaryRecords || []).map((r: any) => ({ ...r, studentName: s.name, studentId: s.id }))
                  ).map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{record.studentName}</td>
                      <td className="px-4 py-3">{record.incident}</td>
                      <td className="px-4 py-3 text-slate-500">{record.date}</td>
                      <td className="px-4 py-3">{record.actionTaken || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          record.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          record.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleResolveCase(record)}
                          className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                          title="Resolve Case"
                        >
                          <CheckCircle className="h-4 w-4" />
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
              <GraduationCap className="h-4 w-4" /> Student Directory
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={handleAddStudent}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Enroll
              </button>
            </div>
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
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No students match your search.' : 'No students enrolled yet.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map((student: any) => (
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

      {/* TEACHERS TAB - Enhanced */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> Teachers Directory ({getFilteredTeachers().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm w-48"
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
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredTeachers().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No teachers match your search.' : 'No teachers found for this school.'}
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
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{sub}</span>
                          ))}
                          {(teacher.subjects || []).length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">+{(teacher.subjects || []).length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          teacher.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {teacher.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
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

      {/* STAFF TAB - Enhanced */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Staff Directory ({getFilteredStaff().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm w-48"
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
                      {searchQuery ? 'No staff match your search.' : 'No staff members found for this school.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredStaff().map((staff: any) => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{staff.name}</td>
                      <td className="px-4 py-3 text-sm">{staff.email}</td>
                      <td className="px-4 py-3">{staff.role || 'N/A'}</td>
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

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Subjects ({getFilteredSubjects().length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={handleAddSubject}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Subject
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Teacher</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredSubjects().length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No subjects match your search.' : 'No subjects found. Click "Add Subject" to get started.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredSubjects().map((subject: any) => (
                    <tr key={subject.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{subject.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-mono">{subject.code}</span>
                      </td>
                      <td className="px-4 py-3">{subject.department || 'General'}</td>
                      <td className="px-4 py-3">
                        {subject.teacherName ? (
                          <span className="text-emerald-600 font-medium">{subject.teacherName}</span>
                        ) : (
                          <select
                            onChange={(e) => handleAssignTeacherToSubject(subject.id, e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            value=""
                          >
                            <option value="">Assign Teacher</option>
                            {getFilteredTeachers().map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteSubject(subject.id, subject.name)}
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

      {/* Add Discipline Modal */}
      {showModal && modalType === 'addDiscipline' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Record Discipline Case</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveDiscipline(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select
                  required
                  value={modalData.studentId}
                  onChange={(e) => setModalData({ ...modalData, studentId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select Student</option>
                  {getFilteredStudents().map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade || 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Incident *</label>
                <input
                  type="text"
                  required
                  value={modalData.incident}
                  onChange={(e) => setModalData({ ...modalData, incident: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Describe the incident"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Action Taken *</label>
                <textarea
                  required
                  rows={3}
                  value={modalData.actionTaken}
                  onChange={(e) => setModalData({ ...modalData, actionTaken: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="What action was taken?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Record Case
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && modalType === 'addStudent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="student@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade</label>
                <select
                  value={modalData.grade}
                  onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
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
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Parent/Guardian name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Parent Email</label>
                <input
                  type="email"
                  value={modalData.parentEmail}
                  onChange={(e) => setModalData({ ...modalData, parentEmail: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="parent@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Phone number"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Enroll Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showModal && modalType === 'addTeacher' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  placeholder="Enter teacher name"
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
                  placeholder="teacher@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  value={modalData.password}
                  onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Minimum 6 characters"
                />
                <p className="text-xs text-slate-400 mt-1">This password will be used for login access.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <input
                  type="text"
                  value={modalData.department}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Mathematics, Sciences"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Subjects (comma separated)</label>
                <input
                  type="text"
                  value={modalData.subjects?.join(', ')}
                  onChange={(e) => setModalData({ ...modalData, subjects: e.target.value.split(',').map((s: string) => s.trim()) })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Phone number"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>This teacher will automatically get login access to the teacher portal with the credentials provided above.</span>
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Add Teacher & Create Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && modalType === 'addStaff' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveStaff(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="staff@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  value={modalData.password}
                  onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Minimum 6 characters"
                />
                <p className="text-xs text-slate-400 mt-1">This password will be used for login access.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={modalData.role}
                  onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Administrative">Administrative</option>
                  <option value="Finance">Finance</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Security">Security</option>
                  <option value="Cafeteria">Cafeteria</option>
                  <option value="Library">Library</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Counselor">Counselor</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <input
                  type="text"
                  value={modalData.department}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Phone number"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>This staff member will automatically get login access with the credentials provided above.</span>
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Add Staff & Create Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && modalType === 'addSubject' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Subject</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSubject(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={modalData.code}
                  onChange={(e) => setModalData({ ...modalData, code: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g., MATH101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <input
                  type="text"
                  value={modalData.department}
                  onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Subject description"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Add Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}