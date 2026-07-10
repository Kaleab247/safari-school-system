import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Heart,
  Coins,
  Clock,
  Shield,
  Database,
  Truck,
  Utensils,
  FileSpreadsheet,
  Briefcase,
  UserCheck2,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
  KeyRound,
  Plus,
  X,
  UserPlus,
  Mail,
  Lock,
  UserCog,
  Trash2,
  Eye
} from 'lucide-react';
import { User, UserRole, STORAGE_KEYS } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/idGenerator';
import {
  defaultSchoolConfig,
  defaultRegisteredUsers,
  defaultPrincipals,
  defaultAllowedRoles,
} from './data/defaultData';

import PublicWebsite from './components/PublicWebsite';
import PortalModules from './components/PortalModules';
import AIHelper from './components/AIHelper';

// School type definition
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

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'portal'>('website');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);

  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('teacher');
  const [userManagementError, setUserManagementError] = useState('');
  const [userManagementSuccess, setUserManagementSuccess] = useState('');

  // All state with localStorage persistence
  const [schoolConfig, setSchoolConfig] = useLocalStorage(
    STORAGE_KEYS.SCHOOL_CONFIG,
    defaultSchoolConfig
  );

  const [registeredUsers, setRegisteredUsers] = useLocalStorage(
    STORAGE_KEYS.REGISTERED_USERS,
    defaultRegisteredUsers
  );

  const [principals, setPrincipals] = useLocalStorage(
    STORAGE_KEYS.PRINCIPALS,
    defaultPrincipals
  );

  const [allowedRolesToRegister, setAllowedRolesToRegister] = useLocalStorage<string[]>(
    STORAGE_KEYS.ALLOWED_ROLES,
    defaultAllowedRoles
  );

  // Schools data - starts empty
  const [schools, setSchools] = useLocalStorage<School[]>(STORAGE_KEYS.SCHOOLS || 'safari_schools', []);

  const [students, setStudents] = useLocalStorage(STORAGE_KEYS.STUDENTS, []);
  const [teachers, setTeachers] = useLocalStorage(STORAGE_KEYS.TEACHERS, []);
  const [grades, setGrades] = useLocalStorage(STORAGE_KEYS.GRADES, []);
  const [timetable, setTimetable] = useLocalStorage(STORAGE_KEYS.TIMETABLE, []);
  const [books, setBooks] = useLocalStorage(STORAGE_KEYS.BOOKS, []);
  const [borrowRecords, setBorrowRecords] = useLocalStorage(STORAGE_KEYS.BORROW_RECORDS, []);
  const [clinicVisits, setClinicVisits] = useLocalStorage(STORAGE_KEYS.CLINIC_VISITS, []);
  const [counselingSessions, setCounselingSessions] = useLocalStorage(STORAGE_KEYS.COUNSELING_SESSIONS, []);
  const [routes, setRoutes] = useLocalStorage(STORAGE_KEYS.ROUTES, []);
  const [checklists, setChecklists] = useLocalStorage(STORAGE_KEYS.CHECKLISTS, []);
  const [cafeteriaMenus, setCafeteriaMenus] = useLocalStorage(STORAGE_KEYS.CAFETERIA_MENUS, []);
  const [inventory, setInventory] = useLocalStorage(STORAGE_KEYS.INVENTORY, []);
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEYS.TRANSACTIONS, []);
  const [alumni, setAlumni] = useLocalStorage(STORAGE_KEYS.ALUMNI, []);
  const [admissions, setAdmissions] = useLocalStorage(STORAGE_KEYS.ADMISSIONS, []);
  const [auditLogs, setAuditLogs] = useLocalStorage(STORAGE_KEYS.AUDIT_LOGS, []);

  // Audit logging helper
  const logAudit = (action: string, userEmail: string = currentUser?.email || 'system', userRole: string = currentUser?.role || 'system') => {
    const newLog = {
      id: generateId('AUD-'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userEmail,
      userRole,
      action,
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev: any[]) => [newLog, ...prev]);
  };

  // User Management - Create New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserManagementError('');
    setUserManagementSuccess('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserManagementError('All fields are required');
      return;
    }

    if (registeredUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      setUserManagementError('This email is already registered');
      return;
    }

    const newUser = {
      id: generateId('USR-'),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword.trim(),
      role: newUserRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers([...registeredUsers, newUser]);
    logAudit(`Created new user: ${newUser.name} (${newUser.role})`);

    setUserManagementSuccess(`User ${newUser.name} created successfully!`);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('teacher');

    setTimeout(() => {
      setUserManagementSuccess('');
      setShowUserManagement(false);
    }, 3000);
  };

  // Delete User (except admin)
  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (userEmail === 'admin@myschool.edu') {
      alert('Cannot delete the system administrator');
      return;
    }
    const user = registeredUsers.find(u => u.id === userId);
    setRegisteredUsers(registeredUsers.filter(u => u.id !== userId));
    logAudit(`Deleted user: ${user?.name || userEmail}`);
  };

  // Login handler with teacher approval check
  const handleLogin = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = registeredUsers.find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === normalizedPassword
    );

    if (user) {
      // Check if the user is a teacher and needs approval
      if (user.role === 'teacher') {
        // Find the teacher record
        const teacher = teachers.find((t: any) =>
          t.id === user.associatedId || t.email === user.email
        );

        // If teacher exists and is not approved
        if (teacher && teacher.approvalStatus !== 'approved') {
          setLoginError('Your account is pending approval by the Principal. Please wait for approval.');
          return false;
        }

        // If teacher doesn't exist in teachers list (shouldn't happen)
        if (!teacher) {
          setLoginError('Teacher account not found. Please contact the administrator.');
          return false;
        }
      }

      const currentUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        associatedId: user.associatedId,
      };
      setCurrentUser(currentUser);
      setPreviewRole(null);
      setViewMode('portal');
      setLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      logAudit('User logged in', normalizedEmail, user.role);
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit('User logged out', currentUser.email, currentUser.role);
    }
    setCurrentUser(null);
    setPreviewRole(null);
    setViewMode('website');
  };

  const handlePreviewRole = (role: UserRole) => {
    if (currentUser?.role === 'super_admin') {
      setPreviewRole(role);
    }
  };

  const getEffectiveRole = (): UserRole => {
    if (currentUser?.role === 'super_admin' && previewRole) {
      return previewRole;
    }
    return currentUser?.role || 'super_admin';
  };

  const getEffectiveUserName = (): string => {
    if (currentUser?.role === 'super_admin' && previewRole) {
      const sampleUser = registeredUsers.find(u => u.role === previewRole);
      if (sampleUser) {
        return sampleUser.name;
      }
      const roleNames: Record<string, string> = {
        student: 'Student User',
        teacher: 'Teacher User',
        parent: 'Parent User',
        registrar: 'Registrar User',
        finance: 'Finance User',
        librarian: 'Librarian User',
        clinic: 'Clinic User',
        counselor: 'Counselor User',
        driver: 'Driver User',
        cafeteria: 'Cafeteria User',
        alumni: 'Alumni User',
        principal: 'Principal User',
        vice_principal: 'Vice Principal User',
        super_admin: 'System Administrator',
        admin: 'Administrator'
      };
      return roleNames[previewRole] || `${previewRole.replace('_', ' ').toUpperCase()} User`;
    }
    return currentUser?.name || 'User';
  };

  // Admission handler - UPDATED to store fee amount
  const handleAddAdmission = (appData: any) => {
    const newApp = {
      ...appData,
      id: generateId('ADM-'),
      submittedDate: new Date().toLocaleDateString('en-US'),
      status: 'PaymentPending' as const,
      feeAmount: appData.feeAmount || 0, // Store the fee amount
    };
    setAdmissions((prev: any[]) => [newApp, ...prev]);
    logAudit(`Admission application submitted for: ${appData.candidateName} (School: ${appData.schoolName || 'N/A'})`);
  };

  // Transaction handler
  const handleAddTransaction = (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => {
    const newTx = {
      id: generateId('TXN-'),
      type,
      category: category as any,
      amount,
      date: new Date().toLocaleDateString('en-US'),
      description: desc,
      paymentMethod: method as any,
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      status: 'Paid' as const,
    };
    setTransactions((prev: any[]) => [newTx, ...prev]);
    logAudit(`Transaction: ${desc} (Birr ${amount})`);
  };

  // Add student handler - UPDATED to create student and parent user accounts
  const handleAddStudent = (studentData: any) => {
    const newStudent = {
      ...studentData,
      id: generateId('STU-'),
      admissionNo: `ADM${Date.now().toString().slice(-6)}`,
      status: 'Active',
      gpa: 0,
      cgpa: 0,
      attendanceRate: 0,
      tuitionTotal: 0,
      tuitionPaid: 0,
      tuitionBalance: 0,
      disciplinaryRecords: [],
      createdAt: new Date().toISOString()
    };

    setStudents((prev: any[]) => [newStudent, ...prev]);

    // Create student user account if email is provided
    if (newStudent.email) {
      const studentUserExists = registeredUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.email.toLowerCase()
      );

      if (!studentUserExists) {
        const studentPassword = `STU${newStudent.id.slice(-6)}`;
        const studentUser = {
          id: generateId('USR-'),
          name: newStudent.name,
          email: newStudent.email.toLowerCase(),
          password: studentPassword,
          role: 'student' as UserRole,
          schoolId: newStudent.schoolId || '',
          schoolName: newStudent.schoolName || '',
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };
        setRegisteredUsers((prev: any[]) => [...prev, studentUser]);
        logAudit(`Student user account created: ${newStudent.email} (${studentPassword})`);
      }
    }

    // Create parent user account if parent email is provided
    if (newStudent.parentEmail) {
      const parentUserExists = registeredUsers.some(
        (u: any) => u.email.toLowerCase() === newStudent.parentEmail.toLowerCase()
      );

      if (!parentUserExists) {
        const parentPassword = `PAR${newStudent.id.slice(-6)}`;
        const parentUser = {
          id: generateId('USR-'),
          name: newStudent.parentName || `${newStudent.name}'s Parent`,
          email: newStudent.parentEmail.toLowerCase(),
          password: parentPassword,
          role: 'parent' as UserRole,
          schoolId: newStudent.schoolId || '',
          schoolName: newStudent.schoolName || '',
          isActive: true,
          associatedId: newStudent.id,
          createdAt: new Date().toISOString()
        };
        setRegisteredUsers((prev: any[]) => [...prev, parentUser]);
        logAudit(`Parent user account created: ${newStudent.parentEmail} (${parentPassword})`);
      }
    }

    logAudit(`Student enrolled: ${studentData.name}`);
    return newStudent;
  };

  // Get sidebar roles
  const getSidebarRoles = () => {
    if (currentUser?.role === 'super_admin') {
      return [
        { role: 'super_admin' as UserRole, label: 'Super Admin', icon: Database },
        { role: 'student' as UserRole, label: 'Student Portal', icon: GraduationCap },
        { role: 'teacher' as UserRole, label: 'Teacher Portal', icon: Users },
        { role: 'parent' as UserRole, label: 'Parent Portal', icon: Clock },
        { role: 'registrar' as UserRole, label: 'Registrar Dept', icon: FileSpreadsheet },
        { role: 'finance' as UserRole, label: 'Finance Operations', icon: Coins },
        { role: 'librarian' as UserRole, label: 'Library Catalog', icon: BookOpen },
        { role: 'clinic' as UserRole, label: 'Clinic', icon: Heart },
        { role: 'counselor' as UserRole, label: 'Counseling', icon: UserCheck2 },
        { role: 'driver' as UserRole, label: 'Driver Transit', icon: Truck },
        { role: 'cafeteria' as UserRole, label: 'Cafeteria', icon: Utensils },
        { role: 'alumni' as UserRole, label: 'Alumni Directory', icon: Briefcase },
      ];
    }
    return [
      { role: currentUser?.role || 'super_admin', label: currentUser?.role?.replace('_', ' ').toUpperCase() || 'Dashboard', icon: Database }
    ];
  };

  const sidebarRoles = getSidebarRoles();
  const effectiveRole = getEffectiveRole();
  const effectiveUserName = getEffectiveUserName();
  const isPreviewMode = currentUser?.role === 'super_admin' && previewRole !== null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {viewMode === 'website' && (
        <div className="flex-1">
          <PublicWebsite
            onLoginClick={() => setLoginModalOpen(true)}
            studentsList={students as any[]}
            onAddTransaction={handleAddTransaction}
            onAddAdmission={handleAddAdmission}
            admissionsList={admissions as any[]}
            schoolConfig={schoolConfig as any}
            principals={principals as any[]}
            schools={schools}
          />
        </div>
      )}

      {viewMode === 'portal' && currentUser && (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-all duration-300 shrink-0 ${
              sidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            <div className="p-5 flex items-center gap-3 border-b border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              {sidebarOpen && (
                <div className="leading-none">
                  <span className="text-sm font-bold block tracking-tight">{(schoolConfig as any).name}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 block tracking-wider mt-1">Campus Portal</span>
                </div>
              )}
            </div>

            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate capitalize">
                    {currentUser.role.replace('_', ' ')}
                    {isPreviewMode && <span className="text-emerald-400 ml-1">(Previewing)</span>}
                  </span>
                </div>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {currentUser.role === 'super_admin' ? 'Role Preview (Click to switch)' : 'Console'}
              </p>
              {sidebarRoles.map((item) => {
                const isActive = effectiveRole === item.role;
                const isClickable = currentUser?.role === 'super_admin';

                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      if (isClickable) {
                        handlePreviewRole(item.role);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    title={isClickable ? `Switch to ${item.label} view` : ''}
                  >
                    <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {sidebarOpen && (
                      <span className="truncate flex items-center gap-1">
                        {item.label}
                        {isActive && <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>}
                        {currentUser?.role === 'super_admin' && !isActive && (
                          <Eye className="h-3 w-3 text-slate-500" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              {currentUser.role === 'super_admin' && (
                <>
                  <button
                    onClick={() => {
                      setPreviewRole(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                      previewRole === null ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Database className="h-4.5 w-4.5 shrink-0" />
                    {sidebarOpen && <span className="truncate">Admin View</span>}
                  </button>
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all text-xs font-semibold cursor-pointer"
                  >
                    <UserPlus className="h-4.5 w-4.5 shrink-0" />
                    {sidebarOpen && <span className="truncate">Manage Users</span>}
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition-all text-xs font-semibold cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                {sidebarOpen && <span>Exit to Website</span>}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-900">Workspace</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="capitalize font-medium text-slate-500">
                    {isPreviewMode ? `Preview: ${previewRole?.replace('_', ' ')}` : currentUser.role.replace('_', ' ')} Portal
                  </span>
                  {isPreviewMode && (
                    <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      Preview Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  {isPreviewMode ? `Viewing as ${previewRole?.replace('_', ' ')}` : currentUser.role === 'super_admin' ? 'Admin' : 'Authorized'}
                </div>
                <div className="h-5 w-px bg-slate-200" />
                <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50/50">
              <PortalModules
                role={effectiveRole}
                userName={effectiveUserName}
                students={students as any[]}
                teachers={teachers as any[]}
                grades={grades as any[]}
                timetable={timetable as any[]}
                books={books as any[]}
                borrowRecords={borrowRecords as any[]}
                clinicVisits={clinicVisits as any[]}
                counselingSessions={counselingSessions as any[]}
                routes={routes as any[]}
                checklists={checklists as any[]}
                cafeteriaMenus={cafeteriaMenus as any[]}
                inventory={inventory as any[]}
                transactions={transactions as any[]}
                alumni={alumni as any[]}
                admissions={admissions as any[]}
                auditLogs={auditLogs as any[]}
                setStudents={setStudents}
                setTeachers={setTeachers}
                setGrades={setGrades}
                setBooks={setBooks}
                setBorrowRecords={setBorrowRecords}
                setClinicVisits={setClinicVisits}
                setCounselingSessions={setCounselingSessions}
                setRoutes={setRoutes}
                setChecklists={setChecklists}
                setInventory={setInventory}
                setTransactions={setTransactions}
                setAdmissions={setAdmissions}
                setAuditLogs={setAuditLogs}
                schoolConfig={schoolConfig as any}
                setSchoolConfig={setSchoolConfig}
                registeredUsers={registeredUsers as any[]}
                setRegisteredUsers={setRegisteredUsers}
                allowedRolesToRegister={allowedRolesToRegister as any}
                setAllowedRolesToRegister={setAllowedRolesToRegister as any}
                principals={principals as any[]}
                setPrincipals={setPrincipals}
                schools={schools}
                setSchools={setSchools}
                onAddStudent={handleAddStudent}
                onAddTransaction={handleAddTransaction}
              />
            </div>

            <AIHelper
              currentRole={effectiveRole}
              userName={effectiveUserName}
              schoolName={(schoolConfig as any).name}
            />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/65">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-emerald-400" /> Secure Login
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{(schoolConfig as any).name}</p>
              </div>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsSigningIn(true);
                setLoginError('');
                setTimeout(() => {
                  setIsSigningIn(false);
                  const success = handleLogin(loginEmail.trim(), loginPassword.trim());
                  if (!success) {
                    setLoginError('Invalid email or password. Please try again.');
                  }
                }, 800);
              }}
              className="p-6 space-y-4"
            >
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your-email@school.edu"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSigningIn ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 text-emerald-400" /> Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserManagement && currentUser?.role === 'super_admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/65">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <UserCog className="h-4.5 w-4.5 text-emerald-400" /> User Management
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Create and manage system users</p>
              </div>
              <button
                onClick={() => {
                  setShowUserManagement(false);
                  setUserManagementError('');
                  setUserManagementSuccess('');
                }}
                className="text-slate-400 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleCreateUser} className="space-y-4 mb-6">
                <h4 className="font-bold text-sm text-slate-900">Create New User</h4>

                {userManagementError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                    {userManagementError}
                  </div>
                )}

                {userManagementSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs font-semibold">
                    {userManagementSuccess}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="john@school.edu"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Create User
                </button>
              </form>

              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Registered Users</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-slate-500 font-semibold">Name</th>
                        <th className="px-4 py-2 text-left text-slate-500 font-semibold">Email</th>
                        <th className="px-4 py-2 text-left text-slate-500 font-semibold">Role</th>
                        <th className="px-4 py-2 text-right text-slate-500 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registeredUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{user.name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{user.email}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'principal' ? 'bg-blue-100 text-blue-700' :
                              user.role === 'teacher' ? 'bg-green-100 text-green-700' :
                              user.role === 'student' ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {user.email !== 'admin@myschool.edu' && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            {user.email === 'admin@myschool.edu' && (
                              <span className="text-slate-400 text-[9px] font-semibold">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Total users: {registeredUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}