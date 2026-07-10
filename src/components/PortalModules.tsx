// PortalModules.tsx - Complete Updated Version

import React from 'react';
import { User } from 'lucide-react';
import { UserRole } from '../types';
import {
  SuperAdminModule,
  SchoolAdminModule,
  PrincipalModule,
  VicePrincipalModule,
  StudentModule,
  ParentModule,
  TeacherModule,
  RegistrarModule,
  FinanceModule,
  LibrarianModule,
  ClinicModule,
  CounselorModule,
  TransportModule,
  DriverModule,
  CafeteriaModule,
  AlumniModule
} from './modules';

interface PortalModulesProps {
  role: UserRole;
  userName: string;
  students: any[];
  teachers: any[];
  grades: any[];
  timetable: any[];
  books: any[];
  borrowRecords: any[];
  clinicVisits: any[];
  counselingSessions: any[];
  routes: any[];
  checklists: any[];
  cafeteriaMenus: any[];
  inventory: any[];
  transactions: any[];
  alumni: any[];
  admissions: any[];
  auditLogs: any[];
  setStudents: any;
  setTeachers: any;
  setGrades: any;
  setBooks: any;
  setBorrowRecords: any;
  setClinicVisits: any;
  setCounselingSessions: any;
  setRoutes: any;
  setChecklists: any;
  setInventory: any;
  setTransactions: any;
  setAdmissions: any;
  setAuditLogs: any;
  schoolConfig: any;
  setSchoolConfig: any;
  registeredUsers: any[];
  setRegisteredUsers: any;
  allowedRolesToRegister: any[];
  setAllowedRolesToRegister: any;
  principals: any[];
  setPrincipals: any;
  schools?: any[];
  setSchools?: any;
  onAddStudent?: (student: any) => void;
  onAddTransaction?: (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => void;
  subjects?: any[];
}

export default function PortalModules(props: PortalModulesProps) {
  const {
    role,
    userName,
    students,
    teachers,
    grades,
    timetable,
    books,
    borrowRecords,
    clinicVisits,
    counselingSessions,
    routes,
    checklists,
    cafeteriaMenus,
    inventory,
    transactions,
    alumni,
    admissions,
    auditLogs,
    setStudents,
    setTeachers,
    setGrades,
    setBooks,
    setBorrowRecords,
    setClinicVisits,
    setCounselingSessions,
    setRoutes,
    setChecklists,
    setInventory,
    setTransactions,
    setAdmissions,
    setAuditLogs,
    schoolConfig,
    setSchoolConfig,
    registeredUsers,
    setRegisteredUsers,
    allowedRolesToRegister,
    setAllowedRolesToRegister,
    principals,
    setPrincipals,
    schools,
    setSchools,
    onAddStudent,
    onAddTransaction,
    subjects = []
  } = props;

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    console.log(`[${type}] ${message}`);
  };

  // Get current user's school ID and name from registered users
  const getCurrentUserSchool = () => {
    try {
      const users = registeredUsers || JSON.parse(localStorage.getItem('safari_registered_users') || '[]');
      const user = users.find((u: any) => u.name === userName || u.email === userName);
      return {
        schoolId: user?.schoolId || '',
        schoolName: user?.schoolName || ''
      };
    } catch {
      return { schoolId: '', schoolName: '' };
    }
  };

  const { schoolId, schoolName } = getCurrentUserSchool();

  // Filter data based on user's school
  const filterBySchool = (data: any[]) => {
    if (!data) return [];
    if (role === 'super_admin' || !schoolId) {
      return data;
    }
    return data.filter((item: any) =>
      item.schoolId === schoolId ||
      !item.schoolId ||
      item.schoolId === '' ||
      item.schoolName === schoolName
    );
  };

  // Get available schools for this user
  const availableSchools = role === 'super_admin'
    ? schools || []
    : (schools || []).filter((s: any) => s.id === schoolId);

  // Handle adding a new transaction
  const handleAddTransaction = (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => {
    const newTransaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      amount,
      type,
      category,
      description: desc,
      paymentMethod: method,
      schoolId: schoolId || '',
      schoolName: schoolName || '',
      date: new Date().toLocaleDateString('en-US'),
      status: 'Paid' as const
    };

    if (onAddTransaction) {
      onAddTransaction(amount, type, category, desc, method);
    } else {
      setTransactions((prev: any[]) => [...prev, newTransaction]);
    }
  };

  // Handle adding a new student
  const handleAddStudent = (studentData: any) => {
    const newStudent = {
      ...studentData,
      id: `STU-${Date.now().toString().slice(-6)}`,
      admissionNo: `ADM${Date.now().toString().slice(-6)}`,
      schoolId: schoolId || studentData.schoolId || '',
      schoolName: schoolName || studentData.schoolName || '',
      status: studentData.status || 'Active',
      createdAt: new Date().toISOString()
    };

    if (onAddStudent) {
      onAddStudent(newStudent);
    } else {
      setStudents((prev: any[]) => [...prev, newStudent]);
    }
    return newStudent;
  };

  // Get the staff member record for a user
  const getStaffMember = (email: string) => {
    try {
      const staffRecords = JSON.parse(localStorage.getItem('safari_staff') || '[]');
      return staffRecords.find((s: any) => s.email === email);
    } catch {
      return null;
    }
  };

  // Map staff role to system role
  const staffRoleMap: Record<string, string> = {
    'Finance Officer': 'finance',
    'Finance': 'finance',
    'Registrar': 'registrar',
    'Librarian': 'librarian',
    'Clinic Nurse': 'clinic',
    'Counselor': 'counselor',
    'Transport Manager': 'transport',
    'Driver': 'driver',
    'Cafeteria Manager': 'cafeteria',
    'Alumni Coordinator': 'alumni'
  };

  // Switch case for rendering the appropriate module
  switch (role) {
    case 'super_admin':
      return (
        <SuperAdminModule
          userName={userName}
          students={students}
          teachers={teachers}
          transactions={transactions}
          registeredUsers={registeredUsers}
          auditLogs={auditLogs}
          schoolConfig={schoolConfig}
          setSchoolConfig={setSchoolConfig}
          setRegisteredUsers={setRegisteredUsers}
          showNotification={showNotification}
          schools={schools || []}
          setSchools={setSchools || (() => {})}
        />
      );

    case 'admin':
      return (
        <SchoolAdminModule
          userName={userName}
          students={filterBySchool(students)}
          teachers={filterBySchool(teachers)}
          grades={filterBySchool(grades)}
          transactions={filterBySchool(transactions)}
          showNotification={showNotification}
        />
      );

    case 'principal':
      return (
        <PrincipalModule
          userName={userName}
          students={filterBySchool(students)}
          teachers={filterBySchool(teachers)}
          grades={filterBySchool(grades)}
          transactions={filterBySchool(transactions)}
          showNotification={showNotification}
          onAddStudent={handleAddStudent}
          setStudents={setStudents}
          setTeachers={setTeachers}
          schoolId={schoolId}
          schoolName={schoolName}
          registeredUsers={registeredUsers}
          setRegisteredUsers={setRegisteredUsers}
          schools={availableSchools}
        />
      );

    case 'vice_principal':
      return (
        <VicePrincipalModule
          userName={userName}
          students={filterBySchool(students)}
          teachers={filterBySchool(teachers)}
          grades={filterBySchool(grades)}
          showNotification={showNotification}
          onAddStudent={handleAddStudent}
          setStudents={setStudents}
          setTeachers={setTeachers}
          schoolId={schoolId}
          schoolName={schoolName}
          registeredUsers={registeredUsers}
          setRegisteredUsers={setRegisteredUsers}
        />
      );

    case 'finance':
      // Get the current user's school info
      const financeUser = registeredUsers.find((u: any) =>
        u.email === userName || u.name === userName
      );

      const financeSchoolId = financeUser?.schoolId || schoolId || '';
      const financeSchoolName = financeUser?.schoolName || schoolName || '';

      // Filter schools for this finance officer
      const financeSchools = (schools || []).filter((s: any) => s.id === financeSchoolId);

      // Filter transactions for this finance officer's school
      const financeTransactions = transactions.filter((t: any) => {
        if (!financeSchoolId) return true;
        return t.schoolId === financeSchoolId || !t.schoolId;
      });

      // Filter students for this finance officer's school
      const financeStudents = students.filter((s: any) => {
        if (!financeSchoolId) return true;
        return s.schoolId === financeSchoolId || !s.schoolId;
      });

      return (
        <FinanceModule
          userName={userName}
          transactions={financeTransactions}
          students={financeStudents}
          showNotification={showNotification}
          schools={financeSchools}
          onAddTransaction={handleAddTransaction}
          schoolId={financeSchoolId}
          schoolName={financeSchoolName}
        />
      );

    case 'student':
      return (
        <StudentModule
          userName={userName}
          students={filterBySchool(students)}
          grades={filterBySchool(grades)}
          timetable={timetable}
          transactions={filterBySchool(transactions)}
          showNotification={showNotification}
        />
      );

    case 'parent':
      return (
        <ParentModule
          userName={userName}
          students={filterBySchool(students)}
          grades={filterBySchool(grades)}
          transactions={filterBySchool(transactions)}
          showNotification={showNotification}
          registeredUsers={registeredUsers}
          setRegisteredUsers={setRegisteredUsers}
          schoolId={schoolId}
          schoolName={schoolName}
          teachers={filterBySchool(teachers)}
          subjects={filterBySchool(subjects)}
        />
      );

    case 'teacher':
      return (
        <TeacherModule
          userName={userName}
          students={filterBySchool(students)}
          teachers={filterBySchool(teachers)}
          grades={filterBySchool(grades)}
          showNotification={showNotification}
          registeredUsers={registeredUsers}
          setRegisteredUsers={setRegisteredUsers}
        />
      );

    case 'registrar':
      return (
        <RegistrarModule
          userName={userName}
          students={filterBySchool(students)}
          admissions={filterBySchool(admissions)}
          transactions={filterBySchool(transactions)}
          showNotification={showNotification}
          onAddTransaction={handleAddTransaction}
          onAddStudent={handleAddStudent}
        />
      );

    case 'librarian':
      return (
        <LibrarianModule
          userName={userName}
          books={filterBySchool(books)}
          borrowRecords={filterBySchool(borrowRecords)}
          showNotification={showNotification}
        />
      );

    case 'clinic':
      return (
        <ClinicModule
          userName={userName}
          clinicVisits={filterBySchool(clinicVisits)}
          students={filterBySchool(students)}
          showNotification={showNotification}
        />
      );

    case 'counselor':
      return (
        <CounselorModule
          userName={userName}
          counselingSessions={filterBySchool(counselingSessions)}
          students={filterBySchool(students)}
          showNotification={showNotification}
        />
      );

    case 'transport':
      return (
        <TransportModule
          userName={userName}
          routes={filterBySchool(routes)}
          showNotification={showNotification}
        />
      );

    case 'driver':
      return (
        <DriverModule
          userName={userName}
          routes={filterBySchool(routes)}
          checklists={filterBySchool(checklists)}
          showNotification={showNotification}
        />
      );

    case 'cafeteria':
      return (
        <CafeteriaModule
          userName={userName}
          cafeteriaMenus={filterBySchool(cafeteriaMenus)}
          showNotification={showNotification}
        />
      );

    case 'alumni':
      return (
        <AlumniModule
          userName={userName}
          alumni={filterBySchool(alumni)}
          showNotification={showNotification}
        />
      );

    case 'staff':
      // Find the staff member record
      const staffUser = registeredUsers.find((u: any) =>
        u.email === userName || u.name === userName
      );

      // Find their staff record to determine their actual role
      const staffMember = getStaffMember(staffUser?.email || '');

      // Map staff role to system role
      const actualRole = staffMember ? staffRoleMap[staffMember.role] || 'staff' : 'staff';

      // If the staff member has a specific role, redirect to that module
      if (actualRole !== 'staff' && actualRole !== undefined) {
        // Update the user's role in registeredUsers
        if (setRegisteredUsers && staffUser) {
          setRegisteredUsers(registeredUsers.map((u: any) =>
            u.id === staffUser.id ? { ...u, role: actualRole } : u
          ));
        }

        // Recursively render with the correct role
        const updatedProps = { ...props, role: actualRole as UserRole };
        return PortalModules(updatedProps);
      }

      // Fallback for generic staff
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Staff Portal</h2>
          <p className="text-slate-500 mt-2">Welcome, {userName}</p>
          {schoolName && (
            <p className="text-sm text-indigo-600 mt-1">School: {schoolName}</p>
          )}
          <p className="text-sm text-slate-400 mt-1">Your role: {staffMember?.role || 'Staff'}</p>
        </div>
      );

    default:
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Welcome, {userName}</h2>
          <p className="text-slate-500 mt-2">You are logged in as <strong>{role?.replace('_', ' ').toUpperCase() || 'User'}</strong></p>
          {schoolName && (
            <p className="text-sm text-indigo-600 mt-1">School: {schoolName}</p>
          )}
          <p className="text-sm text-slate-400 mt-1">This portal is being configured for your role.</p>
        </div>
      );
  }
}