// PublicWebsite.tsx - Complete Updated Version with All Images

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
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Heart,
  Star,
  Quote,
  Trophy,
  Briefcase,
  Target
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

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const slideshowInterval = useRef<NodeJS.Timeout | null>(null);

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

  // ============ IMAGES CONFIGURATION ============
  const images = {
    // Required - Non-replaceable
    logo: '/logo.jpeg',

    // Main Page Images
    mainPage: '/main page.png',
    scholarImage: '/scholar image.jpeg',
    twentyYears: '/20 years of excellence',
    ourStaff: '/our staff.jpeg',

    // Activity images (from previous)
    activity1: '/activity 1.jpeg',
    activity2: '/activity 2.jpeg',
    ourCommunity: '/our community.jpg',
  };

  // ============ SLIDESHOW IMAGES ============
  const slideshowImages = [
    {
      src: images.mainPage,
      alt: 'Main Campus',
      caption: 'Welcome to Our School',
      subCaption: 'Where Excellence Meets Opportunity'
    },
    {
      src: images.scholarImage,
      alt: 'Scholar Image',
      caption: 'Academic Excellence',
      subCaption: 'Nurturing Scholars, Building Futures'
    },
    {
      src: images.ourCommunity,
      alt: 'Our Community',
      caption: 'Our Community',
      subCaption: 'A Supportive Family of Learners'
    },
    {
      src: images.ourStaff,
      alt: 'Our Staff',
      caption: 'Meet Our Dedicated Staff',
      subCaption: 'Committed to Student Success'
    },
  ];

  // ============ STATS DATA ============
  const stats = [
    { value: '500+', label: 'Students', icon: Users },
    { value: '50+', label: 'Teachers', icon: Users },
    { value: '20+', label: 'Years of Excellence', icon: Trophy },
    { value: '15+', label: 'Programs', icon: BookOpen },
  ];

  // ============ FEATURES DATA ============
  const features = [
    {
      title: 'Academic Excellence',
      description: 'Rigorous curriculum preparing students for global success.',
      icon: BookOpen,
      color: 'emerald'
    },
    {
      title: 'Expert Faculty',
      description: 'Dedicated teachers committed to student growth and development.',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Holistic Development',
      description: 'Building character, leadership, and essential life skills.',
      icon: Award,
      color: 'amber'
    },
    {
      title: 'Community Spirit',
      description: 'A supportive environment where every student thrives.',
      icon: Heart,
      color: 'rose'
    },
  ];

  // ============ AUTO-PLAY SLIDESHOW ============
  useEffect(() => {
    if (isAutoPlaying) {
      slideshowInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
      }, 5000);
    }
    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
    }
    if (isAutoPlaying) {
      slideshowInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
      }, 5000);
    }
  };

  // ============ LOAD FEE STRUCTURES ============
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

  // ============ FILE UPLOAD FUNCTIONS ============
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 5MB limit.`);
          return false;
        }
        return true;
      });

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

      if (validTypes.length > 0) {
        uploadFilesToServer(validTypes);
      }
    }
  };

  const uploadFilesToServer = async (files: File[]) => {
    try {
      setIsUploading(true);
      const uploaded = await uploadReceiptsToServer(files);

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

  const removeFile = (index: number) => {
    const fileToRemove = admissionForm.receiptFiles[index];

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

    const hasUploadedFiles = admissionForm.receiptFiles.some((f: any) =>
      f.uploadStatus === 'uploaded' || f.storedName || f.url
    );

    if (admissionForm.receiptFiles.length === 0 || !hasUploadedFiles) {
      alert('Please upload at least one payment receipt and wait for it to be uploaded!');
      setIsSubmitting(false);
      return;
    }

    try {
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

      onAddAdmission(newAdmission);
      setAdmissionSuccess(true);

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

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`[${type}] ${message}`);
  };

  const activeSchools = schools.filter((s: any) => s.status === 'active');

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
      {/* ============================================================ */}
      {/* TOP BAR */}
      {/* ============================================================ */}
      <div className="bg-slate-900 text-slate-300 text-sm px-6 py-3 flex justify-between items-center flex-wrap gap-2">
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

      {/* ============================================================ */}
      {/* NAVBAR WITH LOGO */}
      {/* ============================================================ */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* Logo - MUST USE logo.jpeg */}
            <img
              src={images.logo}
              alt={`${schoolConfig.name} Logo`}
              className="h-12 w-12 object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="bg-slate-900 p-2 rounded-xl">
                      <svg class="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{schoolConfig.name}</h1>
              <p className="text-xs text-emerald-600 font-semibold">20 Years of Excellence</p>
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

      {/* ============================================================ */}
      {/* HERO SECTION WITH SLIDESHOW */}
      {/* ============================================================ */}
      {activeTab === 'home' && (
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="relative h-[550px] md:h-[650px] overflow-hidden">
            {slideshowImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
                          <div class="text-center p-8">
                            <GraduationCap class="h-20 w-20 text-emerald-400 mx-auto mb-4" />
                            <h2 class="text-3xl font-bold text-white">${image.caption}</h2>
                            <p class="text-slate-300 mt-2">${image.subCaption || schoolConfig.heroSubtitle || 'Excellence in Education'}</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-6xl mx-auto px-4 w-full">
                    <div className="max-w-2xl">
                      <div className="inline-block bg-emerald-500/20 backdrop-blur-sm px-4 py-1 rounded-full mb-4 border border-emerald-500/30">
                        <span className="text-emerald-300 text-sm font-semibold">20 Years of Excellence</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                        {image.caption}
                      </h2>
                      <p className="text-slate-200 text-lg mb-8">
                        {image.subCaption || schoolConfig.heroSubtitle || 'Welcome to our school, where academic excellence meets holistic development.'}
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
                  </div>
                </div>
              </div>
            ))}

            {/* Slideshow Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    resetAutoPlay();
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-emerald-500 w-8'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                if (isAutoPlaying && slideshowInterval.current) {
                  clearInterval(slideshowInterval.current);
                } else {
                  resetAutoPlay();
                }
              }}
              className="absolute bottom-6 right-6 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            >
              {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>

          {/* Stats Bar with 20 Years Banner */}
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/10 py-4">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <stat.icon className="h-5 w-5 text-emerald-400" />
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <p className="text-sm text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FEATURES SECTION - 20 Years Banner */}
      {/* ============================================================ */}
      {activeTab === 'home' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-8 mb-12 text-white text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="h-12 w-12 text-emerald-300" />
              <h2 className="text-3xl md:text-4xl font-bold">20 Years of Excellence</h2>
            </div>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              For two decades, we have been shaping minds, building character, and creating leaders.
              Our commitment to quality education remains unwavering.
            </p>
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-emerald-200">Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-emerald-200">Teachers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">20</p>
                <p className="text-sm text-emerald-200">Years</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const colorClasses = {
                emerald: 'bg-emerald-100 text-emerald-600',
                blue: 'bg-blue-100 text-blue-600',
                amber: 'bg-amber-100 text-amber-600',
                rose: 'bg-rose-100 text-rose-600'
              };
              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className={`p-3 rounded-xl w-fit ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mt-4">{feature.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTIVITY HIGHLIGHTS - Image Grid */}
      {/* ============================================================ */}
      {activeTab === 'home' && (
        <div className="max-w-6xl mx-auto px-4 py-16 bg-white rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Our School in Action
          </h2>
          <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">
            Explore the vibrant life and activities at our school
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img
                src={images.activity1}
                alt="School Activity 1"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-xl">Learning & Discovery</h3>
                  <p className="text-slate-200 text-sm">Hands-on activities that inspire curiosity</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img
                src={images.activity2}
                alt="School Activity 2"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588072432836-f100ac6f9e5a?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-xl">Community & Growth</h3>
                  <p className="text-slate-200 text-sm">Building character and lifelong skills</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img
                src={images.ourCommunity}
                alt="Our Community"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-xl">Our Community</h3>
                  <p className="text-slate-200 text-sm">A supportive family of learners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ABOUT SECTION */}
      {/* ============================================================ */}
      {activeTab === 'about' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">About {schoolConfig.name}</h2>

          {/* 20 Years Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl p-6 mb-8 text-white flex items-center gap-4">
            <Trophy className="h-12 w-12 text-amber-200" />
            <div>
              <h3 className="text-2xl font-bold">20 Years of Excellence</h3>
              <p className="text-amber-100">Celebrating two decades of shaping future leaders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <img
                src={images.scholarImage}
                alt="Scholar"
                className="w-full h-64 object-cover rounded-xl mb-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <p className="text-slate-600 leading-relaxed">
                {schoolConfig.name} is a premier educational institution dedicated to nurturing the leaders of tomorrow.
                Our commitment to academic excellence, character development, and innovation sets us apart.
              </p>
            </div>
            <div className="space-y-6">
              {/* Staff Image */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={images.ourStaff}
                  alt="Our Staff"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <h4 className="font-bold text-slate-900">Our Dedicated Staff</h4>
                <p className="text-sm text-slate-600">Committed to student success and well-being</p>
              </div>

              {principals.map((p: any) => (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Quote className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{p.letterTitle}</h4>
                      <p className="text-sm text-slate-600 mt-2">{p.letterBody}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-3">- {p.name}</p>
                    </div>
                  </div>
                </div>
              ))}
              {principals.length === 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-slate-500">Principal's message coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTACT SECTION */}
      {/* ============================================================ */}
      {activeTab === 'contact' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Contact Us</h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-sm text-slate-600">{schoolConfig.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-sm text-slate-600">{schoolConfig.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-slate-600">{schoolConfig.email}</p>
                  </div>
                </div>
                {/* 20 Years Badge */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="font-bold text-amber-700">20 Years of Excellence</p>
                    <p className="text-sm text-amber-600">Serving our community since 2004</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4">Send a Message</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMISSIONS SECTION */}
      {/* ============================================================ */}
      {activeTab === 'admissions' && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Admissions</h2>

          {/* 20 Years Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-4 mb-8 text-white flex items-center gap-4">
            <Target className="h-10 w-10 text-emerald-200" />
            <div>
              <h3 className="text-xl font-bold">Join Our Legacy of Excellence</h3>
              <p className="text-emerald-100">Be part of our 20-year journey of shaping future leaders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <img
                src={images.mainPage}
                alt="Admissions"
                className="w-full h-48 object-cover rounded-xl mb-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
                }}
              />
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
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
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

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="font-bold text-amber-700 text-sm">20 Years of Excellence</p>
                    <p className="text-xs text-amber-600">Join our legacy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMISSION MODAL */}
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
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={admissionForm.phone}
                    onChange={(e) => setAdmissionForm({...admissionForm, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Grade Applying For *
                  </label>
                  <select
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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

                {schools && schools.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select School *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Payment Receipt *
                    <span className="text-xs text-slate-400 ml-2">(JPEG, PNG, PDF - Max 5MB each)</span>
                  </label>

                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                      isUploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-emerald-400'
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
                        <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click or drag to upload receipt</p>
                        <p className="text-xs text-slate-400 mt-1">Supported: JPEG, PNG, PDF (Max 5MB each)</p>
                      </>
                    )}
                  </div>

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
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={admissionForm.notes}
                    onChange={(e) => setAdmissionForm({...admissionForm, notes: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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

      {/* ============================================================ */}
      {/* PAYMENT MODAL */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-slate-900 text-slate-400 px-8 py-12 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={images.logo}
                alt="Logo"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h4 className="text-white font-bold">{schoolConfig.name}</h4>
                <p className="text-xs text-emerald-400">20 Years of Excellence</p>
              </div>
            </div>
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
            <div className="mt-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-amber-400">20 Years Strong</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          © 2024 {schoolConfig.name}. All rights reserved. | 20 Years of Excellence
        </div>
      </footer>
    </div>
  );
}