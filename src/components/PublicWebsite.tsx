import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Lock,
  Shield,
  Sparkles,
  X,
  Send,
  FileText,
  School,
  ChevronDown,
  AlertCircle,
  Upload,
  File,
  Image,
  Paperclip,
  Building2
} from 'lucide-react';

interface PublicWebsiteProps {
  onLoginClick: () => void;
  studentsList: any[];
  onAddTransaction: (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => void;
  onAddAdmission: (app: any) => void;
  admissionsList: any[];
  schoolConfig: any;
  principals: any[];
  schools?: any[];
}

// All grade levels from PreKG to Grade 12
const GRADE_LEVELS = [
  'PreKG',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

export default function PublicWebsite({
  onLoginClick,
  studentsList,
  onAddTransaction,
  onAddAdmission,
  admissionsList,
  schoolConfig,
  principals,
  schools = []
}: PublicWebsiteProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'admissions' | 'contact'>('home');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    candidateName: '',
    gradeApplied: 'PreKG',
    parentName: '',
    email: '',
    phone: '',
    schoolId: '',
    notes: '',
    receiptFile: null as File | null,
    receiptFileName: ''
  });

  const activeSchools = schools.filter((s: any) => s.status === 'active');

  // Get fee for a specific grade and school
  const getFeeForGrade = (grade: string, schoolId: string) => {
    try {
      const feeStructures = JSON.parse(localStorage.getItem('safari_fee_structures') || '[]');
      const fee = feeStructures.find((f: any) =>
        f.grade === grade &&
        (f.schoolId === schoolId || !f.schoolId)
      );
      return fee ? fee.totalAmount : 0;
    } catch {
      return 0;
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount > 0) {
      onAddTransaction(paymentAmount, 'Income', 'Tuition', 'Online Tuition Payment', 'Card');
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
      setPaymentAmount(0);
      setShowPayment(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or PDF file');
        return;
      }

      setApplicationData({
        ...applicationData,
        receiptFile: file,
        receiptFileName: file.name
      });

      // Add to uploaded files list
      setUploadedFiles([...uploadedFiles, file]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setApplicationData({
        ...applicationData,
        receiptFile: null,
        receiptFileName: ''
      });
    }
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationData.candidateName || !applicationData.email || !applicationData.parentName) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!applicationData.schoolId) {
      alert('Please select a school.');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload a payment receipt.');
      return;
    }

    const school = schools.find((s: any) => s.id === applicationData.schoolId);
    const schoolName = school ? school.name : '';

    // Get the actual fee amount for this grade
    const feeAmount = getFeeForGrade(applicationData.gradeApplied, applicationData.schoolId);

    // Store actual file data with data URL for display
    const fileData = uploadedFiles.map(file => {
      // Create a data URL for image files
      let dataUrl = null;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        // We need to use a synchronous approach here, but since we're in a form submit,
        // we'll store the file directly and handle reading later
        // For now, we store the file reference
      }
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        // Store the file object itself for later use
        file: file
      };
    });

    const newApplication = {
      ...applicationData,
      schoolId: applicationData.schoolId,
      schoolName: schoolName,
      submittedDate: new Date().toLocaleDateString('en-US'),
      status: 'PaymentPending' as const,
      feePaid: 0,
      feeAmount: feeAmount, // Store the actual fee amount
      feePaidDate: null,
      processedDate: null,
      approvedByFinance: false,
      receiptFiles: fileData,
      hasReceipt: true,
      // Store the actual files in a separate field for later retrieval
      _files: uploadedFiles.map(f => f)
    };

    onAddAdmission(newApplication);

    setApplicationSuccess(true);
    setTimeout(() => {
      setApplicationSuccess(false);
      setShowApplicationForm(false);
      setApplicationData({
        candidateName: '',
        gradeApplied: 'PreKG',
        parentName: '',
        email: '',
        phone: '',
        schoolId: '',
        notes: '',
        receiptFile: null,
        receiptFileName: ''
      });
      setUploadedFiles([]);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-sm px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> {schoolConfig.location}</span>
          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-400" /> {schoolConfig.phone}</span>
          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-400" /> {schoolConfig.email}</span>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" /> Portal Login
        </button>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl">
            <GraduationCap className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{schoolConfig.name}</h1>
            <p className="text-xs text-emerald-600 font-semibold">Excellence in Education</p>
          </div>
        </div>
        <nav className="flex gap-6">
          {['home', 'about', 'admissions', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {activeTab === 'home' && (
          <div>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-12 mb-12">
              <h2 className="text-4xl font-bold mb-4">{schoolConfig.heroTitle}</h2>
              <p className="text-slate-300 text-lg max-w-2xl">{schoolConfig.heroSubtitle}</p>
              <div className="mt-6 flex gap-4 flex-wrap">
                <button
                  onClick={() => setActiveTab('admissions')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setShowPayment(true);
                  }}
                  className="border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Pay Tuition <DollarSign className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <BookOpen className="h-8 w-8 text-indigo-500 mb-3" />
                <h3 className="font-bold text-lg">Academic Excellence</h3>
                <p className="text-slate-500 text-sm">Rigorous curriculum preparing students for global success.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <Users className="h-8 w-8 text-emerald-500 mb-3" />
                <h3 className="font-bold text-lg">Expert Faculty</h3>
                <p className="text-slate-500 text-sm">Dedicated teachers committed to student growth.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <Award className="h-8 w-8 text-amber-500 mb-3" />
                <h3 className="font-bold text-lg">Holistic Development</h3>
                <p className="text-slate-500 text-sm">Building character, leadership, and life skills.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">About {schoolConfig.name}</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-600 leading-relaxed mb-6">
                {schoolConfig.name} is a premier educational institution dedicated to nurturing the leaders of tomorrow.
                Our commitment to academic excellence, character development, and innovation sets us apart.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {principals.map((p: any) => (
                  <div key={p.id} className="bg-slate-50 p-6 rounded-xl">
                    <h4 className="font-bold text-slate-900">{p.letterTitle}</h4>
                    <p className="text-sm text-slate-600 mt-2">{p.letterBody}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-3">- {p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admissions' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Admissions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-slate-600 mb-6">Join our community of learners. Apply now for the upcoming academic year.</p>

                  {applicationSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-emerald-700">Application Submitted!</h3>
                      <p className="text-slate-600 mt-2">
                        Your application has been submitted successfully with your receipt.
                        You will receive a confirmation email shortly.
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        The Registrar will review your application and contact you for the next steps.
                      </p>
                    </div>
                  ) : showApplicationForm ? (
                    <form onSubmit={handleApplicationSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Candidate Name *</label>
                          <input
                            type="text"
                            required
                            value={applicationData.candidateName}
                            onChange={(e) => setApplicationData({ ...applicationData, candidateName: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Grade Applying For *</label>
                          <select
                            required
                            value={applicationData.gradeApplied}
                            onChange={(e) => setApplicationData({ ...applicationData, gradeApplied: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            {GRADE_LEVELS.map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Parent/Guardian Name *</label>
                        <input
                          type="text"
                          required
                          value={applicationData.parentName}
                          onChange={(e) => setApplicationData({ ...applicationData, parentName: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Parent/Guardian full name"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Email *</label>
                          <input
                            type="email"
                            required
                            value={applicationData.email}
                            onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Phone</label>
                          <input
                            type="tel"
                            value={applicationData.phone}
                            onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="+251 9XX XXX XXX"
                          />
                        </div>
                      </div>

                      {/* SCHOOL DROPDOWN */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Select School *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none flex items-center justify-between bg-white"
                          >
                            <span className={applicationData.schoolId ? 'text-slate-900' : 'text-slate-400'}>
                              {applicationData.schoolId
                                ? schools.find((s: any) => s.id === applicationData.schoolId)?.name || 'Select a school'
                                : 'Select a school...'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isSchoolDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSchoolDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {activeSchools.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                  No active schools available
                                </div>
                              ) : (
                                activeSchools.map((school: any) => (
                                  <button
                                    key={school.id}
                                    type="button"
                                    onClick={() => {
                                      setApplicationData({ ...applicationData, schoolId: school.id });
                                      setIsSchoolDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 ${
                                      applicationData.schoolId === school.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                                    }`}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: school.colors?.primary || '#4F46E5' }}
                                    />
                                    {school.name}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RECEIPT UPLOAD */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Upload Payment Receipt *
                          <span className="text-xs text-slate-400 ml-2">(JPEG, PNG, PDF - Max 5MB)</span>
                        </label>
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                            uploadedFiles.length > 0 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />

                          {uploadedFiles.length === 0 ? (
                            <div>
                              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                              <p className="text-sm text-slate-600">Click or drag to upload your payment receipt</p>
                              <p className="text-xs text-slate-400 mt-1">Supported formats: JPEG, PNG, PDF</p>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                              >
                                Choose File
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-3">
                                    {file.type.startsWith('image/') ? (
                                      <Image className="h-5 w-5 text-indigo-500" />
                                    ) : (
                                      <File className="h-5 w-5 text-indigo-500" />
                                    )}
                                    <div className="text-left">
                                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                              >
                                <Paperclip className="h-4 w-4" /> Add another file
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Fee amount for {applicationData.gradeApplied}: <span className="font-semibold text-emerald-600">{getFeeForGrade(applicationData.gradeApplied, applicationData.schoolId)} Birr</span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">Additional Notes</label>
                        <textarea
                          rows={3}
                          value={applicationData.notes}
                          onChange={(e) => setApplicationData({ ...applicationData, notes: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Any additional information..."
                        />
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-700 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>Please ensure you upload a clear copy of your payment receipt.
                          Your application will not be processed without a valid receipt.</span>
                        </p>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="h-4 w-4" /> Submit Application
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplicationForm(false)}
                          className="border border-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        By submitting this application, you agree to our privacy policy.
                        Your application will be reviewed by the Registrar after payment verification.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-900">Ready to Apply?</h3>
                      <p className="text-slate-500 mt-2">
                        Complete our online application form to get started.
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Make sure you have your payment receipt ready to upload.
                      </p>
                      {activeSchools.length > 0 ? (
                        <button
                          onClick={() => setShowApplicationForm(true)}
                          className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                        >
                          <FileText className="h-4 w-4" /> Start Application
                        </button>
                      ) : (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <p className="text-sm text-amber-700">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            No schools are currently accepting applications. Please check back later.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-4">Grade Levels</h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      PreKG (Pre-Kindergarten)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      LKG (Lower Kindergarten)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      UKG (Upper Kindergarten)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Grade 1 - 12 (Primary to High School)
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-4">Application Requirements</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      Previous academic records
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      Birth certificate
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      Parent/Guardian ID
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Payment receipt <span className="text-xs text-slate-400">(required for application)</span></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-4">Application Process</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      Submit online application with receipt
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      Finance verifies payment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      Registrar reviews application
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      Principal enrolls student
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> Applications are processed within 3-5 business days after payment verification.
                    You will receive a confirmation email once your application is reviewed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-sm text-slate-600">{schoolConfig.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-sm text-slate-600">{schoolConfig.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm text-slate-600">{schoolConfig.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Send a Message</h3>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal - Updated to show login prompt */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tuition Payment</h3>
              <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">Payment Successful!</p>
                <p className="text-sm text-slate-500">Thank you for your payment.</p>
                <p className="text-xs text-slate-400 mt-2">Please keep your receipt for application submission.</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                  <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Login Required</h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Please login to your parent account to make tuition payments.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    You can view fee structures and make secure payments after login.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPayment(false);
                    onLoginClick();
                  }}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" /> Login to Pay
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full mt-2 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 px-8 py-12 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4">{schoolConfig.name}</h4>
            <p className="text-sm">Excellence in Education</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-white cursor-pointer">About</button></li>
              <li><button onClick={() => setActiveTab('admissions')} className="hover:text-white cursor-pointer">Admissions</button></li>
              <li><button onClick={() => setActiveTab('contact')} className="hover:text-white cursor-pointer">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm">{schoolConfig.phone}</p>
            <p className="text-sm">{schoolConfig.email}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Follow Us</h4>
            <p className="text-sm">Stay connected for updates</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          © 2024 {schoolConfig.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}