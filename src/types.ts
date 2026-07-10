/**
 * School Management System - Complete Type Definitions
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'vice_principal'
  | 'dept_head'
  | 'student'
  | 'parent'
  | 'teacher'
  | 'registrar'
  | 'finance'
  | 'hr'
  | 'librarian'
  | 'clinic'
  | 'counselor'
  | 'security'
  | 'transport'
  | 'driver'
  | 'cafeteria'
  | 'inventory'
  | 'alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  associatedId?: string;
  schoolId?: string;
  permissions?: string[];
}

export interface School {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  subscription: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  updatedAt: string;
  config: SchoolConfig;
}

export interface SchoolConfig {
  name: string;
  location: string;
  phone: string;
  email: string;
  heroTitle: string;
  heroSubtitle: string;
  principalLetterTitle: string;
  principalLetterBody: string;
  vicePrincipalLetterTitle: string;
  vicePrincipalLetterBody: string;
  heroImageUrl: string;
  secondaryImageUrl: string;
  latestAnnouncement: string;
  academicYears?: AcademicYear[];
  terms?: Term[];
  departments?: Department[];
  programs?: Program[];
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Term {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string;
  description?: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  duration: number;
  description?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  departmentId: string;
  programId: string;
  prerequisites: string[];
  semester: number;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  departmentId: string;
  teacherId?: string;
  classId?: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  grade: string;
  section: string;
  academicYearId: string;
  classTeacherId?: string;
  roomNumber?: string;
  capacity: number;
  students: string[];
  subjects: string[];
  timetable: TimetableSlot[];
}

export interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  classId: string;
  teacherId: string;
  classroom: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  grade: string;
  classId?: string;
  classSection: string;
  email: string;
  phone: string;
  parentName: string;
  parentEmail: string;
  attendanceRate: number;
  tuitionTotal: number;
  tuitionPaid: number;
  tuitionBalance: number;
  status: 'Active' | 'OnLeave' | 'Graduated' | 'Suspended';
  schoolId?: string;
  schoolName?: string;
  dormitory?: string;
  transportRoute?: string;
  disciplinaryRecords: DisciplinaryRecord[];
  medicalRecords?: MedicalRecord[];
  hostelInfo?: HostelInfo;
  emergencyContacts?: EmergencyContact[];
  createdAt: string;
  updatedAt: string;
}

export interface DisciplinaryRecord {
  id: string;
  date: string;
  incident: string;
  actionTaken: string;
  status: 'Resolved' | 'Pending' | 'Escalated';
  reportedBy: string;
  description?: string;
}

export interface MedicalRecord {
  id: string;
  studentId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  doctorName: string;
  notes?: string;
  followUpDate?: string;
}

export interface HostelInfo {
  roomNumber: string;
  hostelName: string;
  roommate?: string;
  checkInDate: string;
  checkOutDate?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedClasses: string[];
  subjects: string[];
  salary: number;
  attendanceRate: number;
  performanceScore: number;
  status: 'Active' | 'OnLeave' | 'Suspended';
  qualifications?: string[];
  hireDate: string;
  contractEnd?: string;
  payrollInfo?: PayrollInfo;
  schoolId?: string;
  schoolName?: string;
}

export interface PayrollInfo {
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  bankName: string;
  accountNumber: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  grade: string;
  numericScore: number;
  term: string;
  assessmentType: 'Assignment' | 'Quiz' | 'Midterm' | 'Final' | 'Practical' | 'Exam';
  date: string;
  teacherId?: string;
  classId?: string;
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  subject: string;
  dueDate: string;
  createdDate: string;
  attachments: string[];
  maxScore: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  fileUrl: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'not_submitted';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  classId: string;
  subject: string;
  questions: QuizQuestion[];
  timeLimit: number;
  maxScore: number;
  startDate: string;
  endDate: string;
  attempts: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  score: number;
  answers: number[];
}

export interface Exam {
  id: string;
  name: string;
  type: 'midterm' | 'final' | 'quarterly' | 'semester';
  classId: string;
  subject: string;
  date: string;
  duration: number;
  maxScore: number;
  results: ExamResult[];
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  grade: string;
  rank?: number;
  remarks?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  shelfLocation: string;
  digitalUrl?: string;
  publisher?: string;
  year?: string;
  description?: string;
}

export interface LibraryBorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerRole: 'Student' | 'Teacher' | 'Staff';
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'Borrowed' | 'Returned' | 'Overdue' | 'Reserved';
}

export interface ClinicVisit {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  complaint: string;
  treatment: string;
  medicationGiven: string;
  status: 'Dismissed' | 'Resting' | 'SentHome' | 'ReferredToHospital';
  alertSentToParent: boolean;
  temperature?: number;
  bloodPressure?: string;
  weight?: number;
  height?: number;
}

export interface CounselingSession {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  wellbeingScore: number;
  counselorNotes: string;
  referralRequired: boolean;
  status: 'Scheduled' | 'Completed' | 'FollowUpRequired' | 'Cancelled';
  confidentiality: boolean;
  parentConsent: boolean;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  driverName: string;
  vehicleNo: string;
  stops: string[];
  capacity: number;
  assignedStudents: number;
  status: 'InTransit' | 'Completed' | 'Idle' | 'Delayed' | 'Maintenance';
  currentStop?: string;
  gpsCoordinates?: string;
  estimatedArrival?: string;
}

export interface DriverChecklist {
  id: string;
  driverName: string;
  vehicleNo: string;
  date: string;
  brakesCheck: boolean;
  tiresCheck: boolean;
  fuelLevel: number;
  engineLights: boolean;
  emergencyKit: boolean;
  submitted: boolean;
  notes?: string;
}

export interface CafeteriaMenu {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  itemName: string;
  calories: number;
  allergens: string[];
  nutritionValue: string;
  price: number;
  isAvailable: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Lab Equipment' | 'ICT Equipment' | 'Consumables' | 'Office Supplies' | 'Sports' | 'Medical';
  quantity: number;
  unit: string;
  location: string;
  lastInspectionDate: string;
  supplier: string;
  status: 'InStock' | 'LowStock' | 'Reordered' | 'Discontinued';
  purchaseDate?: string;
  warranty?: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'Income' | 'Expense';
  category: 'Tuition' | 'Salary' | 'Procurement' | 'Utility' | 'Cafeteria' | 'Donation' | 'Library' | 'Transport' | 'Maintenance' | 'Event' | 'Scholarship';
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Card' | 'BankTransfer' | 'MobileMoney' | 'Cash' | 'Cheque';
  receiptNo: string;
  reference?: string;
  studentId?: string;
  teacherId?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  schoolId?: string;
  schoolName?: string;
}

export interface FeeStructure {
  id: string;
  grade: string;
  academicYearId: string;
  tuitionFee: number;
  registrationFee: number;
  libraryFee: number;
  sportsFee: number;
  transportFee: number;
  boardingFee: number;
  otherFees: OtherFee[];
  totalAmount: number;
}

export interface OtherFee {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  dueDate: string;
  issueDate: string;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  type: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'Card' | 'BankTransfer' | 'MobileMoney' | 'Cash' | 'Cheque';
  reference: string;
  receiptNo: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface AlumniRecord {
  id: string;
  name: string;
  graduationYear: number;
  degree: string;
  currentCompany: string;
  jobTitle: string;
  email: string;
  donationsTotal: number;
  verified: boolean;
  linkedin?: string;
  twitter?: string;
  phone?: string;
}

export interface AdmissionApplication {
  id: string;
  candidateName: string;
  gradeApplied: string;
  parentName: string;
  email: string;
  phone: string;
  submittedDate: string;
  status: 'Pending' | 'InterviewScheduled' | 'Accepted' | 'Waitlisted' | 'Declined' | 'Enrolled';
  interviewDate?: string;
  campus?: string;
  documents?: string[];
  notes?: string;
  schoolId?: string;
  schoolName?: string;
  feePaid?: number;
  feePaidDate?: string;
  approvedByFinance?: boolean;
}

export interface PrincipalRecord {
  id: string;
  name: string;
  email: string;
  campus: string;
  letterTitle: string;
  letterBody: string;
  status: 'Active' | 'OnLeave' | 'Retired';
  schoolId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  ipAddress: string;
  details?: string;
  targetId?: string;
  targetType?: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  associatedId?: string;
  schoolId?: string;
  permissions?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'Annual' | 'Sick' | 'Study' | 'Maternity' | 'Paternity' | 'Compassionate';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approverId?: string;
  approverName?: string;
  approvedDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Administrative' | 'Event' | 'Emergency' | 'General';
  targetAudience: UserRole[];
  schoolId: string;
  postedBy: string;
  postedDate: string;
  expiryDate?: string;
  isPinned: boolean;
  attachments?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'Academic' | 'Sports' | 'Cultural' | 'Meeting' | 'Workshop' | 'Other';
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  targetAudience: UserRole[];
}

// Storage Keys
export const STORAGE_KEYS = {
  SCHOOLS: 'safari_schools',
  STUDENTS: 'safari_students',
  TEACHERS: 'safari_teachers',
  GRADES: 'safari_grades',
  TIMETABLE: 'safari_timetable',
  BOOKS: 'safari_books',
  BORROW_RECORDS: 'safari_borrow_records',
  CLINIC_VISITS: 'safari_clinic_visits',
  COUNSELING_SESSIONS: 'safari_counseling_sessions',
  ROUTES: 'safari_routes',
  CHECKLISTS: 'safari_checklists',
  CAFETERIA_MENUS: 'safari_cafeteria_menus',
  INVENTORY: 'safari_inventory',
  TRANSACTIONS: 'safari_transactions',
  ALUMNI: 'safari_alumni',
  ADMISSIONS: 'safari_admissions',
  AUDIT_LOGS: 'safari_audit_logs',
  SCHOOL_CONFIG: 'safari_school_config',
  REGISTERED_USERS: 'safari_registered_users',
  ALLOWED_ROLES: 'safari_allowed_roles',
  PRINCIPALS: 'safari_principals',
  FEES: 'safari_fees',
  INVOICES: 'safari_invoices',
  ANNOUNCEMENTS: 'safari_announcements',
  EVENTS: 'safari_events',
  ASSIGNMENTS: 'safari_assignments',
  QUIZZES: 'safari_quizzes',
  EXAMS: 'safari_exams',
  LEAVE_REQUESTS: 'safari_leave_requests',
};