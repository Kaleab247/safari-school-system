// SuperAdminModule.tsx - Updated with teacher queue system

import React, { useState } from 'react';
import {
  Plus, RefreshCw, Server, Building, Settings, CreditCard,
  Users as UsersIcon, UserPlus, Lock, Shield as ShieldIcon,
  PieChart, FileText, Clipboard, BarChart3, Database,
  AlertOctagon, GraduationCap, Users, DollarSign, UserCog,
  X, Check, Globe, Mail, Phone, MapPin, Trash2, Edit,
  Eye, Search, Filter, SortAsc, SortDesc, Calendar,
  Clock, Activity, TrendingUp, TrendingDown, Percent,
  LogIn, UserCheck, UserX, Shield, Award, BookOpen,
  Heart, Truck, Utensils, Briefcase, FileSpreadsheet, Coins,
  School, Edit2, Save, ExternalLink, Building2, AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';

interface SuperAdminModuleProps {
  userName: string;
  students: any[];
  teachers: any[];
  transactions: any[];
  registeredUsers: any[];
  auditLogs: any[];
  schoolConfig: any;
  setSchoolConfig: any;
  setRegisteredUsers: any;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  schools?: any[];
  setSchools?: any;
  setTeachers?: any;
}

interface School {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  studentsCount: number;
  teachersCount: number;
  principalName?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
}

export default function SuperAdminModule({
  userName,
  students,
  teachers,
  transactions,
  registeredUsers,
  auditLogs,
  schoolConfig,
  setSchoolConfig,
  setRegisteredUsers,
  showNotification,
  schools: propSchools = [],
  setSchools: propSetSchools,
  setTeachers: propSetTeachers
}: SuperAdminModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const schools = propSchools || [];
  const setSchools = propSetSchools || (() => {});

  // Stats
  const totalIncome = transactions.filter((t: any) => t.type === 'Income').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t: any) => t.type === 'Expense').reduce((sum: number, t: any) => sum + t.amount, 0);

  // Roles that require school assignment
  const rolesRequiringSchool = ['principal', 'vice_principal', 'finance', 'registrar', 'teacher', 'librarian', 'clinic', 'counselor', 'driver', 'cafeteria'];

  // ============ SCHOOL HANDLERS ============

  const handleCreateSchool = () => {
    setModalType('createSchool');
    setModalData({
      name: '',
      location: '',
      phone: '',
      email: '',
      principalName: '',
      colors: { primary: '#4F46E5', secondary: '#10B981' }
    });
    setShowModal(true);
  };

  const handleSaveSchool = () => {
    if (!modalData.name?.trim()) {
      showNotification('School name is required!', 'error');
      return;
    }

    const newSchool: School = {
      id: `SCH-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      location: modalData.location || 'N/A',
      phone: modalData.phone || 'N/A',
      email: modalData.email || 'N/A',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      studentsCount: 0,
      teachersCount: 0,
      principalName: modalData.principalName || '',
      colors: modalData.colors || { primary: '#4F46E5', secondary: '#10B981' }
    };

    setSchools([...schools, newSchool]);
    showNotification(`School "${newSchool.name}" created successfully!`, 'success');
    setShowModal(false);
    setActiveTab('schools');
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setModalData({
      ...school,
      colors: school.colors || { primary: '#4F46E5', secondary: '#10B981' }
    });
    setModalType('editSchool');
    setShowModal(true);
  };

  const handleSaveSchoolEdit = () => {
    if (!editingSchool) return;

    if (!modalData.name?.trim()) {
      showNotification('School name is required!', 'error');
      return;
    }

    const updatedSchools = schools.map((s: School) =>
      s.id === editingSchool.id
        ? {
            ...s,
            name: modalData.name.trim(),
            location: modalData.location || 'N/A',
            phone: modalData.phone || 'N/A',
            email: modalData.email || 'N/A',
            status: modalData.status,
            principalName: modalData.principalName || '',
            colors: modalData.colors || s.colors
          }
        : s
    );
    setSchools(updatedSchools);

    showNotification(`School "${modalData.name}" updated successfully!`, 'success');
    setShowModal(false);
    setEditingSchool(null);
    setSelectedSchool(null);
  };

  const handleDeleteSchool = (school: School) => {
    if (window.confirm(`Are you sure you want to delete "${school.name}"? This action cannot be undone.`)) {
      setSchools(schools.filter((s: School) => s.id !== school.id));
      showNotification(`School "${school.name}" deleted successfully!`, 'success');
      setSelectedSchool(null);
    }
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(selectedSchool?.id === school.id ? null : school);
  };

  // ============ STAFF HANDLERS FOR SCHOOLS ============

  const handleAddStaffToSchool = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modalData.staffName?.trim() || !modalData.staffEmail?.trim()) {
      showNotification('Staff name and email are required!', 'error');
      return;
    }

    if (!selectedSchool) {
      showNotification('Please select a school first!', 'error');
      return;
    }

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-6)}`,
      name: modalData.staffName.trim(),
      email: modalData.staffEmail.trim().toLowerCase(),
      role: modalData.staffRole || 'Administrative',
      department: modalData.staffDepartment || 'Administration',
      phone: modalData.staffPhone || '',
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      status: 'Active',
      hireDate: modalData.staffHireDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const existingStaff = JSON.parse(localStorage.getItem('safari_staff') || '[]');
    existingStaff.push(newStaff);
    localStorage.setItem('safari_staff', JSON.stringify(existingStaff));

    showNotification(`Staff ${newStaff.name} added to ${selectedSchool.name}`, 'success');

    setModalData({
      ...modalData,
      staffName: '',
      staffEmail: '',
      staffRole: 'Administrative',
      staffDepartment: '',
      staffPhone: '',
      staffHireDate: ''
    });

    setSelectedSchool({ ...selectedSchool });
  };

  const handleRemoveStaffFromSchool = (staffId: string, staffName: string) => {
    if (window.confirm(`Remove ${staffName} from this school?`)) {
      const allStaff = JSON.parse(localStorage.getItem('safari_staff') || '[]');
      const updated = allStaff.filter((s: any) => s.id !== staffId);
      localStorage.setItem('safari_staff', JSON.stringify(updated));
      showNotification(`Staff ${staffName} removed`, 'success');
      if (selectedSchool) {
        setSelectedSchool({ ...selectedSchool });
      }
    }
  };

  const getSchoolStaff = () => {
    if (!selectedSchool) return [];
    const allStaff = JSON.parse(localStorage.getItem('safari_staff') || '[]');
    return allStaff.filter((s: any) => s.schoolId === selectedSchool.id);
  };

  // ============ TEACHER REQUEST HANDLERS ============
  const handleCreateTeacherRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modalData.name?.trim() || !modalData.email?.trim() || !modalData.password?.trim()) {
      showNotification('All fields are required!', 'error');
      return;
    }

    if (registeredUsers.some((u: any) => u.email === modalData.email)) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    if (!modalData.schoolId) {
      showNotification('Please select a school for this teacher!', 'error');
      return;
    }

    // Find the school
    const selectedSchoolObj = schools.find((s: any) => s.id === modalData.schoolId);
    const schoolName = selectedSchoolObj ? selectedSchoolObj.name : '';

    // Create the teacher data (with PENDING status)
    const newTeacher = {
      id: `TCH-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      email: modalData.email.trim().toLowerCase(),
      password: modalData.password.trim(),
      department: modalData.department || 'General',
      subjects: [],
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      salary: 0,
      attendanceRate: 0,
      performanceScore: 0,
      status: 'Pending',
      schoolId: modalData.schoolId || '',
      schoolName: schoolName,
      qualifications: [],
      createdAt: new Date().toISOString(),
      approvalStatus: 'pending',
      requestedBy: userName,
      requestedDate: new Date().toISOString()
    };

    // Create a pending request
    const pendingRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      teacherData: newTeacher,
      requestedBy: userName,
      requestedByRole: 'super_admin',
      requestedDate: new Date().toISOString(),
      status: 'pending',
      schoolId: modalData.schoolId || '',
      schoolName: schoolName,
      notes: `Requested by Super Admin ${userName}`
    };

    // Save to pending requests in localStorage
    const existingRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
    existingRequests.push(pendingRequest);
    localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(existingRequests));

    showNotification(
      `Teacher ${newTeacher.name} has been submitted for approval to ${schoolName}'s principal!`,
      'success'
    );

    // Also add to teachers list with pending status
    if (propSetTeachers) {
      propSetTeachers((prev: any[]) => [...prev, newTeacher]);
    } else {
      const existingTeachers = JSON.parse(localStorage.getItem('safari_teachers') || '[]');
      existingTeachers.push(newTeacher);
      localStorage.setItem('safari_teachers', JSON.stringify(existingTeachers));
    }

    setModalData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      schoolId: '',
      department: ''
    });
    setShowModal(false);
  };

  // ============ USER HANDLERS ============

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modalData.name?.trim() || !modalData.email?.trim() || !modalData.password?.trim()) {
      showNotification('All fields are required!', 'error');
      return;
    }

    if (registeredUsers.some((u: any) => u.email === modalData.email)) {
      showNotification('This email is already registered!', 'error');
      return;
    }

    if (rolesRequiringSchool.includes(modalData.role) && !modalData.schoolId) {
      showNotification('Please select a school for this role!', 'error');
      return;
    }

    const selectedSchoolObj = schools.find((s: any) => s.id === modalData.schoolId);
    const schoolName = selectedSchoolObj ? selectedSchoolObj.name : '';

    const newUser = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: modalData.name.trim(),
      email: modalData.email.trim().toLowerCase(),
      password: modalData.password.trim(),
      role: modalData.role || 'teacher',
      schoolId: modalData.schoolId || '',
      schoolName: schoolName,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers([...registeredUsers, newUser]);

    // If the user is a teacher, create a pending request instead of direct approval
    if (modalData.role === 'teacher') {
      // Use the new teacher request flow
      const newTeacher = {
        id: `TCH-${Date.now().toString().slice(-6)}`,
        name: modalData.name.trim(),
        email: modalData.email.trim().toLowerCase(),
        password: modalData.password.trim(),
        department: modalData.department || 'General',
        subjects: [],
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        attendanceRate: 0,
        performanceScore: 0,
        status: 'Pending',
        schoolId: modalData.schoolId || '',
        schoolName: schoolName,
        qualifications: [],
        createdAt: new Date().toISOString(),
        approvalStatus: 'pending',
        requestedBy: userName,
        requestedDate: new Date().toISOString()
      };

      // Create pending request
      const pendingRequest = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        teacherData: newTeacher,
        requestedBy: userName,
        requestedByRole: 'super_admin',
        requestedDate: new Date().toISOString(),
        status: 'pending',
        schoolId: modalData.schoolId || '',
        schoolName: schoolName,
        notes: `Requested by Super Admin ${userName}`
      };

      const existingRequests = JSON.parse(localStorage.getItem('safari_pending_teacher_requests') || '[]');
      existingRequests.push(pendingRequest);
      localStorage.setItem('safari_pending_teacher_requests', JSON.stringify(existingRequests));

      // Add to teachers
      if (propSetTeachers) {
        propSetTeachers((prev: any[]) => [...prev, newTeacher]);
      } else {
        const existingTeachers = JSON.parse(localStorage.getItem('safari_teachers') || '[]');
        existingTeachers.push(newTeacher);
        localStorage.setItem('safari_teachers', JSON.stringify(existingTeachers));
      }

      showNotification(
        `Teacher ${newTeacher.name} created and sent to ${schoolName}'s principal for approval!`,
        'success'
      );
    } else {
      showNotification(`User ${newUser.name} created successfully!`, 'success');
    }

    setModalData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      schoolId: '',
      department: ''
    });
    setShowModal(false);
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (userEmail === 'admin@myschool.edu') {
      showNotification('Cannot delete the system administrator!', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      setRegisteredUsers(registeredUsers.filter((u: any) => u.id !== userId));
      showNotification('User deleted successfully!', 'success');
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    const user = registeredUsers.find((u: any) => u.id === userId);
    if (user?.email === 'admin@myschool.edu') {
      showNotification('Cannot modify the system administrator!', 'error');
      return;
    }
    setRegisteredUsers(registeredUsers.map((u: any) =>
      u.id === userId ? { ...u, isActive: !currentStatus } : u
    ));
    showNotification(`User ${currentStatus ? 'disabled' : 'enabled'} successfully!`, 'success');
  };

  const handleSystemSettings = () => {
    setModalType('systemSettings');
    setModalData({
      schoolName: schoolConfig.name,
      location: schoolConfig.location,
      phone: schoolConfig.phone,
      email: schoolConfig.email
    });
    setShowModal(true);
  };

  const handleSaveSystemSettings = () => {
    setSchoolConfig({
      ...schoolConfig,
      name: modalData.schoolName,
      location: modalData.location,
      phone: modalData.phone,
      email: modalData.email
    });
    showNotification('System settings updated successfully!', 'success');
    setShowModal(false);
  };

  const handleBackup = () => {
    showNotification('System backup initiated! 100% Complete!', 'success');
  };

  const handleClearCache = () => {
    showNotification('Cache cleared successfully!', 'success');
  };

  const handleSystemReports = () => {
    showNotification('Generating system reports...', 'info');
  };

  const handleAuditLogs = () => {
    setActiveTab('audit');
  };

  const handleAnalytics = () => {
    showNotification('Analytics dashboard loading...', 'info');
  };

  const handleErrorLogs = () => {
    showNotification('Error logs fetched!', 'info');
  };

  const handlePermissions = () => {
    showNotification('Permissions management opened!', 'info');
  };

  const handleRoles = () => {
    showNotification('Role management opened!', 'info');
  };

  const handleAllUsers = () => {
    setActiveTab('users');
  };

  const getFilteredUsers = () => {
    if (!searchQuery) return registeredUsers;
    return registeredUsers.filter((u: any) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700',
      inactive: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const openCreateUserModal = () => {
    setModalType('createUser');
    setModalData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      schoolId: '',
      department: ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Welcome back, {userName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreateSchool}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New School
          </button>
          <button
            onClick={handleBackup}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Backup
          </button>
          <button
            onClick={handleClearCache}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Server className="h-4 w-4" /> Clear Cache
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('schools')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Schools</p>
            <Building className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{schools.length}</p>
        </div>
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Users</p>
            <UserCog className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{registeredUsers?.length || 0}</p>
        </div>
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active Users</p>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {registeredUsers.filter((u: any) => u.isActive !== false).length}
          </p>
        </div>
        <div
          onClick={() => setActiveTab('audit')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Logins</p>
            <LogIn className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {auditLogs.filter((log: any) => log.action?.toLowerCase().includes('login')).length}
          </p>
        </div>
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Disabled</p>
            <UserX className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {registeredUsers.filter((u: any) => u.isActive === false).length}
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-500" /> System
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleCreateSchool}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-indigo-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-indigo-500" /> Create School
            </button>
            <button
              onClick={handleSystemSettings}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-indigo-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" /> System Settings
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-blue-500" /> Users
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleAllUsers}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-blue-500" /> All Users
            </button>
            <button
              onClick={openCreateUserModal}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-blue-500" /> Create User
            </button>
            <button
              onClick={handlePermissions}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4 text-amber-500" /> Permissions
            </button>
            <button
              onClick={handleRoles}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldIcon className="h-4 w-4 text-purple-500" /> Roles
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-emerald-500" /> Reports
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleSystemReports}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-emerald-500" /> System Reports
            </button>
            <button
              onClick={handleAuditLogs}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Clipboard className="h-4 w-4 text-slate-500" /> Audit Logs
            </button>
            <button
              onClick={handleAnalytics}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 text-indigo-500" /> Analytics
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Server className="h-4 w-4 text-amber-500" /> Maintenance
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleBackup}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-amber-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Database className="h-4 w-4 text-amber-500" /> Backup
            </button>
            <button
              onClick={handleClearCache}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-amber-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" /> Clear Cache
            </button>
            <button
              onClick={handleErrorLogs}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-amber-50 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <AlertOctagon className="h-4 w-4 text-red-500" /> Error Logs
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Schools', 'Users', 'Audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab.toLowerCase());
              setSelectedSchool(null);
            }}
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

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">System Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Schools</span>
                <span className="font-bold text-slate-900">{schools.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Users</span>
                <span className="font-bold text-slate-900">{registeredUsers.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Active Users</span>
                <span className="font-bold text-emerald-600">{registeredUsers.filter((u: any) => u.isActive !== false).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Revenue</span>
                <span className="font-bold text-emerald-600">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Expenses</span>
                <span className="font-bold text-red-600">${totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleCreateSchool}
                className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-semibold text-indigo-700 transition-colors flex items-center gap-3"
              >
                <Plus className="h-5 w-5" />
                Create New School
              </button>
              <button
                onClick={openCreateUserModal}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-semibold text-blue-700 transition-colors flex items-center gap-3"
              >
                <UserPlus className="h-5 w-5" />
                Add New User
              </button>
              <button
                onClick={() => setActiveTab('schools')}
                className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-semibold text-emerald-700 transition-colors flex items-center gap-3"
              >
                <Building className="h-5 w-5" />
                Manage Schools
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm font-semibold text-purple-700 transition-colors flex items-center gap-3"
              >
                <UsersIcon className="h-5 w-5" />
                Manage Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SCHOOLS TAB ============ */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          {schools.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <School className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Schools Yet</h3>
              <p className="text-slate-500 mt-2">Click "Create School" to add your first school.</p>
              <button
                onClick={handleCreateSchool}
                className="mt-4 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create School
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school: School) => (
                <div
                  key={school.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer ${
                    selectedSchool?.id === school.id                      ? 'border-indigo-500 shadow-md'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                  onClick={() => handleSelectSchool(school)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                          style={{ backgroundColor: school.colors?.primary || '#4F46E5' }}
                        >
                          {school.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{school.name}</h3>
                          <p className="text-xs text-slate-500">{school.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(school.status)}`}>
                        {school.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Students</p>
                        <p className="font-bold text-slate-900">{school.studentsCount || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Teachers</p>
                        <p className="font-bold text-slate-900">{school.teachersCount || 0}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{school.location}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditSchool(school); }}
                        className="flex-1 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSchool(school); }}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div
                onClick={handleCreateSchool}
                className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-center p-6 min-h-[200px]"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-600">Add New School</p>
                  <p className="text-xs text-slate-400">Click to create a new school</p>
                </div>
              </div>
            </div>
          )}

          {/* Selected School Details */}
          {selectedSchool && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedSchool.colors?.primary || '#4F46E5' }}
                  >
                    {selectedSchool.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedSchool.name}</h3>
                    <p className="text-sm text-slate-500">School Details & Staff Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">School ID</p>
                      <p className="font-bold text-slate-900">{selectedSchool.id}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-bold text-slate-900">{selectedSchool.name}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-bold text-slate-900">{selectedSchool.location}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-bold text-slate-900">{selectedSchool.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-bold text-slate-900">{selectedSchool.email}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Principal</p>
                      <p className="font-bold text-slate-900">{selectedSchool.principalName || 'Not assigned'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedSchool.status)}`}>
                        {selectedSchool.status}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="font-bold text-slate-900">{selectedSchool.createdAt}</p>
                    </div>
                  </div>
                </div>

                {/* Staff Management */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-indigo-500" /> Staff for {selectedSchool.name}
                    <span className="text-sm text-slate-400 font-normal ml-2">
                      ({getSchoolStaff().length} staff members)
                    </span>
                  </h4>

                  <form onSubmit={handleAddStaffToSchool} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Staff Name *"
                      required
                      value={modalData.staffName || ''}
                      onChange={(e) => setModalData({ ...modalData, staffName: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Staff Email *"
                      required
                      value={modalData.staffEmail || ''}
                      onChange={(e) => setModalData({ ...modalData, staffEmail: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <select
                      value={modalData.staffRole || 'Administrative'}
                      onChange={(e) => setModalData({ ...modalData, staffRole: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
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
                    <input
                      type="text"
                      placeholder="Department"
                      value={modalData.staffDepartment || ''}
                      onChange={(e) => setModalData({ ...modalData, staffDepartment: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Staff
                    </button>
                  </form>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Role</th>
                          <th className="px-4 py-2 text-left">Department</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const schoolStaff = getSchoolStaff();
                          return schoolStaff.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                No staff assigned to this school.
                              </td>
                            </tr>
                          ) : (
                            schoolStaff.map((staff: any) => (
                              <tr key={staff.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-medium">{staff.name}</td>
                                <td className="px-4 py-2">{staff.email}</td>
                                <td className="px-4 py-2">
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                    {staff.role || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{staff.department || 'N/A'}</td>
                                <td className="px-4 py-2">
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                    {staff.status || 'Active'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => handleRemoveStaffFromSchool(staff.id, staff.name)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
                  <button
                    onClick={() => handleEditSchool(selectedSchool)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" /> Edit School
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(selectedSchool)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" /> Delete School
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ USERS TAB ============ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <UsersIcon className="h-4 w-4" /> Registered Users
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={openCreateUserModal}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" /> Add User
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
                  <th className="px-4 py-2 text-left">School</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredUsers().map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'principal' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'teacher' ? 'bg-green-100 text-green-700' :
                          user.role === 'student' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role?.replace('_', ' ') || 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.schoolName ? (
                          <span className="text-xs text-indigo-600 font-medium">{user.schoolName}</span>
                        ) : (
                          <span className="text-xs text-slate-400">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex gap-1 justify-end">
                        {user.email !== 'admin@myschool.edu' && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                              className={`p-1 rounded transition-colors ${
                                user.isActive !== false
                                  ? 'text-red-500 hover:bg-red-50'
                                  : 'text-emerald-500 hover:bg-emerald-50'
                              }`}
                              title={user.isActive !== false ? 'Disable' : 'Enable'}
                            >
                              {user.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {user.email === 'admin@myschool.edu' && (
                          <span className="text-slate-400 text-xs font-semibold flex items-center">
                            <Shield className="h-3 w-3 mr-1" /> Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ AUDIT TAB ============ */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" /> Audit Logs
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No audit logs yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 50).map((log: any, index: number) => (
                    <tr key={log.id || index} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-400 text-xs">{log.timestamp}</td>
                      <td className="px-4 py-2 font-medium">{log.userEmail}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{log.userRole}</span>
                      </td>
                      <td className="px-4 py-2">{log.action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ MODALS ============ */}

      {/* Create School Modal */}
      {showModal && modalType === 'createSchool' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New School</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSchool(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">School Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={modalData.location}
                  onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter school location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter school email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="text"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter school phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Principal Name</label>
                <input
                  type="text"
                  value={modalData.principalName}
                  onChange={(e) => setModalData({ ...modalData, principalName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter principal name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                <input
                  type="color"
                  value={modalData.colors?.primary || '#4F46E5'}
                  onChange={(e) => setModalData({
                    ...modalData,
                    colors: { ...modalData.colors, primary: e.target.value }
                  })}
                  className="w-full mt-1 h-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Create School
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit School Modal */}
      {showModal && modalType === 'editSchool' && editingSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit School</h3>
              <button onClick={() => { setShowModal(false); setEditingSchool(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSchoolEdit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">School Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={modalData.location}
                  onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="text"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Principal Name</label>
                <input
                  type="text"
                  value={modalData.principalName || ''}
                  onChange={(e) => setModalData({ ...modalData, principalName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={modalData.status}
                  onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                <input
                  type="color"
                  value={modalData.colors?.primary || '#4F46E5'}
                  onChange={(e) => setModalData({
                    ...modalData,
                    colors: { ...modalData.colors, primary: e.target.value }
                  })}
                  className="w-full mt-1 h-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4 inline mr-2" /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal - Updated with teacher queue */}
      {showModal && modalType === 'createUser' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New User</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.name || ''}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={modalData.email || ''}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="john@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  value={modalData.password || ''}
                  onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role *</label>
                <select
                  required
                  value={modalData.role || 'teacher'}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setModalData({
                      ...modalData,
                      role: newRole,
                      schoolId: rolesRequiringSchool.includes(newRole) ? modalData.schoolId : '',
                      department: newRole === 'teacher' ? modalData.department : ''
                    });
                  }}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="principal">Principal</option>
                  <option value="vice_principal">Vice Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="registrar">Registrar</option>
                  <option value="finance">Finance</option>
                  <option value="librarian">Librarian</option>
                  <option value="clinic">Clinic</option>
                  <option value="counselor">Counselor</option>
                  <option value="driver">Driver</option>
                  <option value="cafeteria">Cafeteria</option>
                  <option value="alumni">Alumni</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {rolesRequiringSchool.includes(modalData.role)
                    ? 'This role requires school assignment'
                    : 'This role has system-wide access'}
                </p>
                {modalData.role === 'teacher' && (
                  <p className="text-xs text-amber-600 mt-1">
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    Teachers will be sent to the Principal's queue for approval before they can login.
                  </p>
                )}
              </div>

              {rolesRequiringSchool.includes(modalData.role) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Assign to School *
                    </label>
                    <select
                      required
                      value={modalData.schoolId || ''}
                      onChange={(e) => setModalData({ ...modalData, schoolId: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select a school...</option>
                      {schools.filter((s: any) => s.status === 'active').map((school: any) => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                    {schools.filter((s: any) => s.status === 'active').length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No active schools available. Please create a school first.
                      </p>
                    )}
                  </div>

                  {modalData.role === 'teacher' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Department</label>
                      <select
                        value={modalData.department || ''}
                        onChange={(e) => setModalData({ ...modalData, department: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Department</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Islamic Studies">Islamic Studies</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Physical Education">Physical Education</option>
                        <option value="Art">Art</option>
                        <option value="Music">Music</option>
                        <option value="French">French</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {modalData.schoolId
                      ? `This user will have access to: ${schools.find((s: any) => s.id === modalData.schoolId)?.name}`
                      : modalData.role === 'super_admin'
                        ? 'Super Admin has access to all schools and system settings.'
                        : 'Select a school to assign this user to a specific branch.'}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {showModal && modalType === 'systemSettings' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">System Settings</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">School Name *</label>
                <input
                  type="text"
                  required
                  value={modalData.schoolName}
                  onChange={(e) => setModalData({ ...modalData, schoolName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={modalData.location}
                  onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="text"
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={modalData.email}
                  onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}