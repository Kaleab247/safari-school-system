// PublicWebsite.tsx - Complete Updated Version with Server File Upload

import React, { useState, useRef, useEffect } from 'react';
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
  Building2,
  Loader2
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

const GRADE_LEVELS = [
  'PreKG', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

export default function PublicWebsite({
  onLoginClick,
  onAddAdmission,
  schoolConfig,
  principals = [],
  schools = []
}: PublicWebsiteProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [selectedGradeFee, setSelectedGradeFee] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const [admissionForm, setAdmissionForm] = useState<any>({
    candidateName: '',
    parentName: '',
    email: '',
    phone: '',
    gradeApplied: 'Grade 1',
    schoolId: '',
    receiptFiles: [],
    notes: ''
  });

  // Load fee structures on mount and when grade or school changes
  useEffect(() => {
    loadFeeStructures();
  }, []);

  useEffect(() => {
    calculateFee();
  }, [admissionForm.gradeApplied, admissionForm.schoolId, feeStructures]);

  const loadFeeStructures = () => {
    try {
      const saved = localStorage.getItem('safari_fee_structures');
      const allFees = saved ? JSON.parse(saved) : [];
      setFeeStructures(allFees);
    } catch (error) {
      console.error('Error loading fee structures:', error);
      setFeeStructures([]);
    }
  };

  const calculateFee = () => {
    try {
      const fee = feeStructures.find((f: any) => {
        const matchesGrade = f.grade === admissionForm.gradeApplied;
        const matchesSchool = !admissionForm.schoolId || f.schoolId === admissionForm.schoolId || !f.schoolId;
        return matchesGrade && matchesSchool;
      });

      const amount = fee ? fee.totalAmount : 0;
      setSelectedGradeFee(amount);

      setAdmissionForm((prev: any) => ({
        ...prev,
        feeAmount: amount
      }));
    } catch (error) {
      console.error('Error calculating fee:', error);
      setSelectedGradeFee(0);
    }
  };

  // ============ FILE UPLOAD TO SERVER ============
  const uploadReceiptsToServer = async (files: File[]): Promise<any[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('receipts', file);
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);
      return result.files || [];
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // ============ FILE UPLOAD HANDLER ============
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Validate file size (max 5MB each)
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 5MB limit.`);
          return false;
        }
        return true;
      });

      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const validTypes = validFiles.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not supported. Please upload JPEG, PNG, or PDF.`);
          return false;
        }
        return true;
      });

      const fileObjects = validTypes.map(file => ({
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        file: file,
        dataUrl: null,
        uploadStatus: 'pending' as 'pending' | 'uploading' | 'uploaded' | 'error'
      }));

      setAdmissionForm((prev: any) => ({
        ...prev,
        receiptFiles: [...(prev.receiptFiles || []), ...fileObjects]
      }));

      // Auto-upload files to server
      if (validTypes.length > 0) {
        uploadFilesToServer(validTypes);
      }
    }
  };

  // ============ UPLOAD FILES TO SERVER ============
  const uploadFilesToServer = async (files: File[]) => {
    try {
      setIsUploading(true);
      const uploaded = await uploadReceiptsToServer(files);

      // Update receipt files with server response
      setAdmissionForm((prev: any) => ({
        ...prev,
        receiptFiles: prev.receiptFiles.map((f: any) => {
          const uploadedFile = uploaded.find((u: any) =>
            u.originalName === f.originalName || u.originalName === f.name
          );
          if (uploadedFile) {
            return {
              ...f,
              storedName: uploadedFile.storedName,
              url: uploadedFile.url,
              uploadStatus: 'uploaded' as const
            };
          }
          return { ...f, uploadStatus: 'error' as const };
        })
      }));

      setUploadedFiles([...uploaded]);
      showNotification('Files uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
      setAdmissionForm((prev: any) => ({
        ...prev,
        receiptFiles: prev.receiptFiles.map((f: any) => ({
          ...f,
          uploadStatus: 'error' as const
        }))
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // ============ REMOVE FILE ============
  const removeFile = (index: number) => {
    const fileToRemove = admissionForm.receiptFiles[index];

    // If file was uploaded to server, delete it
    if (fileToRemove && fileToRemove.storedName) {
      fetch(`/api/receipts/file/${fileToRemove.storedName}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error deleting file:', err));
    }

    setAdmissionForm((prev: any) => ({
      ...prev,
      receiptFiles: prev.receiptFiles.filter((_: any, i: number) => i !== index)
    }));
  };

  // ============ SUBMIT ADMISSION ============
  const submitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!admissionForm.candidateName.trim()) {
      alert('Candidate name is required!');
      setIsSubmitting(false);
      return;
    }
    if (!admissionForm.parentName.trim()) {
      alert('Parent name is required!');
      setIsSubmitting(false);
      return;
    }
    if (!admissionForm.email.trim()) {
      alert('Email is required!');
      setIsSubmitting(false);
      return;
    }
    if (!admissionForm.schoolId) {
      alert('Please select a school!');
      setIsSubmitting(false);
      return;
    }

    // Check if files are uploaded
    const hasUploadedFiles = admissionForm.receiptFiles.some((f: any) =>
      f.uploadStatus === 'uploaded' || f.storedName || f.url
    );

    if (admissionForm.receiptFiles.length === 0 || !hasUploadedFiles) {
      alert('Please upload at least one payment receipt and wait for it to be uploaded!');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get fee amount
      let feeAmount = 0;
      try {
        const fee = feeStructures.find((f: any) => {
          const matchesGrade = f.grade === admissionForm.gradeApplied;
          const matchesSchool = f.schoolId === admissionForm.schoolId || !f.schoolId;
          return matchesGrade && matchesSchool;
        });
        feeAmount = fee ? fee.totalAmount : 0;
      } catch (error) {
        console.error('Error getting fee amount:', error);
      }

      const selectedSchool = schools.find((s: any) => s.id === admissionForm.schoolId);
      const schoolName = selectedSchool ? selectedSchool.name : '';

      // Prepare file data for storage
      const fileData = admissionForm.receiptFiles
        .filter((f: any) => f.uploadStatus === 'uploaded' || f.storedName)
        .map((f: any) => ({
          originalName: f.originalName || f.name,
          storedName: f.storedName,
          url: f.url,
          size: f.size,
          type: f.type,
          uploadedAt: new Date().toISOString()
        }));

      const newAdmission = {
        id: `ADM-${Date.now().toString().slice(-6)}`,
        candidateName: admissionForm.candidateName.trim(),
        parentName: admissionForm.parentName.trim(),
        email: admissionForm.email.trim(),
        phone: admissionForm.phone || '',
        gradeApplied: admissionForm.gradeApplied,
        schoolId: admissionForm.schoolId || '',
        schoolName: schoolName,
        receiptFiles: fileData,
        hasReceipt: fileData.length > 0,
        status: 'PaymentPending',
        feeAmount: feeAmount,
        submittedDate: new Date().toLocaleDateString(),
        notes: admissionForm.notes || '',
        approvedByFinance: false
      };

      // Save admission
      onAddAdmission(newAdmission);
      setAdmissionSuccess(true);

      // Reset form
      setAdmissionForm({
        candidateName: '',
        parentName: '',
        email: '',
        phone: '',
        gradeApplied: 'Grade 1',
        schoolId: '',
        receiptFiles: [],
        notes: ''
      });
      setSelectedGradeFee(0);
      setUploadedFiles([]);

      setTimeout(() => {
        setAdmissionSuccess(false);
        setShowAdmissionModal(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting admission:', error);
      alert('There was an error submitting your application. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ============ SHOW NOTIFICATION ============
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`[${type}] ${message}`);
    // You can implement a proper notification system here
  };

  // Get active schools
  const activeSchools = schools.filter((s: any) => s.status === 'active');

  // ============ GET FILE ICON ============
  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-indigo-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-indigo-500" />;
  };

  const getUploadStatusBadge = (status: string) => {
    switch(status) {
      case 'uploaded':
        return <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Uploaded</span>;
      case 'uploading':
        return <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">⏳ Uploading...</span>;
      case 'error':
        return <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">✗ Error</span>;
      default:
        return <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-sm px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" /> {schoolConfig.location}
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400" /> {schoolConfig.phone}
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-400" /> {schoolConfig.email}
          </span>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" /> Portal Login
        </button>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl">
              <GraduationCap className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{schoolConfig.name}</h1>
              <p className="text-xs text-emerald-600 font-semibold">Excellence in Education</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            {['Home', 'About', 'Admissions', 'Contact'].map(item => (
              <button
                key={item}
                onClick={() => setActiveTab(item.toLowerCase())}
                className={`${
                  activeTab === item.toLowerCase()
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                } transition-colors cursor-pointer pb-1`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdmissionModal(true)}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      {activeTab === 'home' && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                  {schoolConfig.heroTitle || 'Empowering Future Leaders'}
                </h1>
                <p className="text-slate-300 text-lg mb-8">
                  {schoolConfig.heroSubtitle || 'Welcome to our school, where academic excellence meets holistic development.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowAdmissionModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Pay Tuition <DollarSign className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-emerald-400 mb-3" />
                  <h3 className="font-bold">Academic Excellence</h3>
                  <p className="text-sm text-slate-300">Rigorous curriculum preparing students for global success.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-indigo-400 mb-3" />
                  <h3 className="font-bold">Expert Faculty</h3>
                  <p className="text-sm text-slate-300">Dedicated teachers committed to student growth.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <Award className="h-8 w-8 text-amber-400 mb-3" />
                  <h3 className="font-bold">Holistic Development</h3>
                  <p className="text-sm text-slate-300">Building character, leadership, and life skills.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-rose-400 mb-3" />
                  <h3 className="font-bold">Community</h3>
                  <p className="text-sm text-slate-300">A supportive environment for every student.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      {activeTab === 'about' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">About {schoolConfig.name}</h2>
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
              {principals.length === 0 && (
                <div className="bg-slate-50 p-6 rounded-xl">
                  <p className="text-slate-500">Principal's message coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Contact Us</h2>
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

      {/* Admissions Section */}
      {activeTab === 'admissions' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Admissions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-600 mb-6">Join our community of learners. Apply now for the upcoming academic year.</p>

              {admissionSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-emerald-700">Application Submitted!</h3>
                  <p className="text-slate-600 mt-2">
                    Your application has been submitted successfully.
                    You will receive a confirmation email shortly.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdmissionModal(true)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Start Application
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4">Grade Levels</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> PreKG - UKG
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Grade 1 - 12
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4">Requirements</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Academic records
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Birth certificate
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Payment receipt
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMISSION MODAL - WITH SERVER FILE UPLOAD */}
      {/* ============================================================ */}
      {showAdmissionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Admission Application</h2>
              <button
                onClick={() => {
                  setShowAdmissionModal(false);
                  setAdmissionSuccess(false);
                  setIsSubmitting(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {admissionSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-slate-500 mt-2">
                  Your application has been sent to finance for review.
                </p>
              </div>
            ) : (
              <form onSubmit={submitAdmission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Candidate Name *
                  </label>
                  <input
                    required
                    placeholder="Full name"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.candidateName}
                    onChange={(e) => setAdmissionForm({...admissionForm, candidateName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent/Guardian Name *
                  </label>
                  <input
                    required
                    placeholder="Parent/Guardian name"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.parentName}
                    onChange={(e) => setAdmissionForm({...admissionForm, parentName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.email}
                    onChange={(e) => setAdmissionForm({...admissionForm, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+251 9XX XXX XXX"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.phone}
                    onChange={(e) => setAdmissionForm({...admissionForm, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Grade Applying For *
                  </label>
                  <select
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.gradeApplied}
                    onChange={(e) => {
                      setAdmissionForm({...admissionForm, gradeApplied: e.target.value});
                    }}
                  >
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* School Selection */}
                {schools && schools.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select School *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={admissionForm.schoolId}
                      onChange={(e) => {
                        setAdmissionForm({...admissionForm, schoolId: e.target.value});
                      }}
                    >
                      <option value="">Select a school...</option>
                      {activeSchools.map((school: any) => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fee Amount Display */}
                {admissionForm.schoolId && (
                  <div className={`p-4 rounded-xl ${selectedGradeFee > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Fee Amount for {admissionForm.gradeApplied}:</span>
                      <span className={`text-xl font-bold ${selectedGradeFee > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {selectedGradeFee > 0 ? `${selectedGradeFee.toLocaleString()} Birr` : 'Not configured'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedGradeFee > 0
                        ? 'Based on the fee structure set by finance.'
                        : 'Please contact the school for fee information.'}
                    </p>
                  </div>
                )}

                {/* ============================================================ */}
                {/* FILE UPLOAD SECTION WITH SERVER STORAGE */}
                {/* ============================================================ */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Payment Receipt *
                    <span className="text-xs text-slate-400 ml-2">(JPEG, PNG, PDF - Max 5MB each)</span>
                  </label>

                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                      isUploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-indigo-400'
                    }`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={handleFileUpload}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      disabled={isUploading}
                    />

                    {isUploading ? (
                      <div className="py-4">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-blue-600">Uploading files to server...</p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click or drag to upload receipt</p>
                        <p className="text-xs text-slate-400 mt-1">Supported: JPEG, PNG, PDF (Max 5MB each)</p>
                      </>
                    )}
                  </div>

                  {/* File List with Status */}
                  {admissionForm.receiptFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {admissionForm.receiptFiles.map((f: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm border border-slate-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(f.type)}
                            <span className="truncate text-slate-700">{f.originalName || f.name}</span>
                            <span className="text-xs text-slate-400 shrink-0">
                              ({(f.size / 1024).toFixed(1)} KB)
                            </span>
                            {getUploadStatusBadge(f.uploadStatus || 'pending')}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-red-500 hover:text-red-700 transition-colors shrink-0 ml-2 p-1 hover:bg-red-50 rounded"
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Uploaded files summary */}
                      {uploadedFiles.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-700">
                          ✓ {uploadedFiles.length} file(s) uploaded to server successfully
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any additional information..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={admissionForm.notes}
                    onChange={(e) => setAdmissionForm({...admissionForm, notes: e.target.value})}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading files...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Application
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Tuition Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center py-6">
              <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-900">Login Required</h4>
              <p className="text-sm text-slate-600 mt-2">
                Please login to your parent account to make tuition payments.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                You can view fee structures and make secure payments after login.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  onLoginClick();
                }}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Login to Pay
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
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