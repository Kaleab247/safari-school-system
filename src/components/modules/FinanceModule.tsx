// FinanceModule.tsx - Complete Fixed Version with Server Receipt Handling

import React, { useState, useEffect } from 'react';
import {
  DollarSign, Coins, TrendingUp, TrendingDown,
  Plus, X, Wallet, CheckCircle, Clock, Search,
  Filter, Building2, UserCheck, CreditCard, Receipt,
  Eye, FileText, Printer, Download, AlertCircle,
  Image, File, Paperclip, ChevronDown, Trash2,
  EyeOff, Maximize2, Minimize2, Settings, Save,
  Edit2, Percent, Calendar, Users, BookOpen,
  School, Award, BarChart3, PieChart, User,
  AlertTriangle, RefreshCw, Upload, Loader2
} from 'lucide-react';

interface FinanceModuleProps {
  userName: string;
  transactions: any[];
  students: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  schools?: any[];
  onAddTransaction?: (amount: number, type: 'Income' | 'Expense', category: string, desc: string, method: string) => void;
  schoolId?: string;
  schoolName?: string;
}

// Grade levels
const GRADE_LEVELS = [
  'PreKG', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

interface FeeStructure {
  id: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  tuitionFee: number;
  registrationFee: number;
  libraryFee: number;
  sportsFee: number;
  transportFee: number;
  boardingFee: number;
  otherFees: { name: string; amount: number }[];
  totalAmount: number;
  updatedAt: string;
  updatedBy: string;
}

export default function FinanceModule({
  userName,
  transactions = [],
  students = [],
  showNotification,
  schools = [],
  onAddTransaction,
  schoolId: propSchoolId = '',
  schoolName: propSchoolName = ''
}: FinanceModuleProps) {

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>({});
  const [selectedSchool, setSelectedSchool] = useState<string>(propSchoolId || '');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [allReceiptFiles, setAllReceiptFiles] = useState<any[]>([]);
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);

  // If schoolId is passed, automatically select it
  useEffect(() => {
    if (propSchoolId) {
      setSelectedSchool(propSchoolId);
    }
  }, [propSchoolId]);

  // Load fee structures
  useEffect(() => {
    loadFeeStructures();
  }, [selectedSchool]);

  // Load pending payments
  useEffect(() => {
    loadPendingPayments();
  }, [selectedSchool]);

  const loadFeeStructures = () => {
    try {
      const saved = localStorage.getItem('safari_fee_structures');
      const allFees = saved ? JSON.parse(saved) : [];

      if (allFees.length === 0) {
        createDefaultFeeStructures();
        return;
      }

      let filteredFees = allFees;
      if (selectedSchool) {
        filteredFees = allFees.filter((f: any) => f.schoolId === selectedSchool);
      }

      setFeeStructures(filteredFees);
    } catch (error) {
      console.error('Error loading fee structures:', error);
      setFeeStructures([]);
    }
  };

  const createDefaultFeeStructures = () => {
    const defaultFees: FeeStructure[] = GRADE_LEVELS.map((grade, index) => {
      const baseFee = 5000 + (index * 500);
      return {
        id: `FEE-${Date.now().toString().slice(-6)}-${index}`,
        grade: grade,
        schoolId: selectedSchool || propSchoolId || '',
        schoolName: selectedSchool ? schools.find((s: any) => s.id === selectedSchool)?.name || '' : propSchoolName || '',
        tuitionFee: baseFee,
        registrationFee: 1000,
        libraryFee: 500,
        sportsFee: 300,
        transportFee: 800,
        boardingFee: 2000,
        otherFees: [],
        totalAmount: baseFee + 1000 + 500 + 300 + 800 + 2000,
        updatedAt: new Date().toISOString(),
        updatedBy: userName
      };
    });

    localStorage.setItem('safari_fee_structures', JSON.stringify(defaultFees));
    setFeeStructures(defaultFees.filter((f: any) => f.schoolId === selectedSchool || !f.schoolId));
  };

  const loadPendingPayments = () => {
    try {
      const saved = localStorage.getItem('safari_pending_payments');
      const allPending = saved ? JSON.parse(saved) : [];

      const admissions = JSON.parse(localStorage.getItem('safari_admissions') || '[]');
      const pendingAdmissions = admissions.filter((a: any) =>
        a.hasReceipt && a.status === 'PaymentPending' && !a.approvedByFinance
      );

      let allPayments = [...allPending, ...pendingAdmissions];

      if (selectedSchool) {
        allPayments = allPayments.filter((p: any) => p.schoolId === selectedSchool);
      }

      const uniquePayments = allPayments.filter((p: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.id === p.id)
      );

      setPendingPayments(uniquePayments);
    } catch (error) {
      console.error('Error loading pending payments:', error);
      setPendingPayments([]);
    }
  };

  // Get fee for a specific grade
  const getFeeForGrade = (grade: string) => {
    return feeStructures.find((f: any) => f.grade === grade);
  };

  const calculateTotalFee = (data: any) => {
    return (
      (Number(data.tuitionFee) || 0) +
      (Number(data.registrationFee) || 0) +
      (Number(data.libraryFee) || 0) +
      (Number(data.sportsFee) || 0) +
      (Number(data.transportFee) || 0) +
      (Number(data.boardingFee) || 0) +
      (data.otherFees || []).reduce((sum: number, fee: any) => sum + (Number(fee.amount) || 0), 0)
    );
  };

  // ============ RECEIPT HANDLING ============

  // Helper to check if an object is a File/Blob
  const isFileLike = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    return (
      typeof obj.size === 'number' &&
      typeof obj.type === 'string' &&
      obj.constructor &&
      (obj.constructor.name === 'File' || obj.constructor.name === 'Blob')
    );
  };

  // Helper to read a file as data URL
  const readFileAsDataURL = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Get receipt URL from server
  const getReceiptUrl = (filename: string) => {
    return `/api/receipts/file/${filename}`;
  };

  // View receipt modal
  const handleViewReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setSelectedReceiptFile(null);
    setReceiptDataUrl(null);
    setReceiptError(null);
    setSelectedReceiptIndex(0);
    setAllReceiptFiles([]);
    setShowReceiptModal(true);

    // Collect all receipt files
    let files: any[] = [];

    if (payment.receiptFiles && payment.receiptFiles.length > 0) {
      files = payment.receiptFiles;
    } else if (payment.receiptFile) {
      files = [payment.receiptFile];
    }

    setAllReceiptFiles(files);

    if (files.length > 0) {
      loadReceiptFile(files[0]);
    }
  };

  // Load the actual receipt file data
  const loadReceiptFile = async (file: any) => {
    console.log('Loading receipt file:', file);
    setIsLoadingReceipt(true);
    setReceiptError(null);

    try {
      // Case 1: File has a server URL (stored on server)
      if (file && file.url) {
        // Check if URL is a full URL or relative
        const fullUrl = file.url.startsWith('http') ? file.url : `/api/receipts/file/${file.storedName || file.url.split('/').pop()}`;
        setReceiptDataUrl(fullUrl);
        setSelectedReceiptFile({ ...file, dataUrl: fullUrl });
        setIsLoadingReceipt(false);
        return;
      }

      // Case 2: File has a storedName (server file)
      if (file && file.storedName) {
        const fileUrl = `/api/receipts/file/${file.storedName}`;
        // Verify the file exists
        try {
          const response = await fetch(fileUrl, { method: 'HEAD' });
          if (response.ok) {
            setReceiptDataUrl(fileUrl);
            setSelectedReceiptFile({ ...file, dataUrl: fileUrl });
            setIsLoadingReceipt(false);
            return;
          } else {
            throw new Error('File not found on server');
          }
        } catch (fetchError) {
          console.error('File not found on server:', fetchError);
          setReceiptError('File not found on server. It may have been deleted.');
          setIsLoadingReceipt(false);
          return;
        }
      }

      // Case 3: File has a filename (server file reference)
      if (file && file.filename) {
        const fileUrl = `/api/receipts/file/${file.filename}`;
        try {
          const response = await fetch(fileUrl, { method: 'HEAD' });
          if (response.ok) {
            setReceiptDataUrl(fileUrl);
            setSelectedReceiptFile({ ...file, dataUrl: fileUrl });
            setIsLoadingReceipt(false);
            return;
          }
        } catch {
          setReceiptError('File not found on server.');
          setIsLoadingReceipt(false);
          return;
        }
      }

      // Case 4: File has dataUrl already (base64)
      if (file && file.dataUrl) {
        setReceiptDataUrl(file.dataUrl);
        setSelectedReceiptFile(file);
        setIsLoadingReceipt(false);
        return;
      }

      // Case 5: File has a file object with actual data
      if (file && file.file) {
        if (isFileLike(file.file)) {
          const dataUrl = await readFileAsDataURL(file.file);
          setReceiptDataUrl(dataUrl);
          setSelectedReceiptFile({ ...file, dataUrl: dataUrl });
          setIsLoadingReceipt(false);
          return;
        }
        if (typeof file.file === 'string') {
          if (file.file.startsWith('data:')) {
            setReceiptDataUrl(file.file);
            setSelectedReceiptFile({ ...file, dataUrl: file.file });
            setIsLoadingReceipt(false);
            return;
          }
          // Try to fetch external URL
          try {
            const response = await fetch(file.file);
            const blob = await response.blob();
            const dataUrl = await readFileAsDataURL(blob);
            setReceiptDataUrl(dataUrl);
            setSelectedReceiptFile({ ...file, dataUrl: dataUrl });
            setIsLoadingReceipt(false);
            return;
          } catch {
            setSelectedReceiptFile(file);
            setIsLoadingReceipt(false);
            return;
          }
        }
      }

      // Case 6: File is directly a File/Blob object
      if (isFileLike(file)) {
        const dataUrl = await readFileAsDataURL(file);
        setReceiptDataUrl(dataUrl);
        setSelectedReceiptFile({ ...file, dataUrl: dataUrl });
        setIsLoadingReceipt(false);
        return;
      }

      // Case 7: File has a file path string
      if (typeof file === 'string') {
        if (file.startsWith('data:')) {
          setReceiptDataUrl(file);
          setSelectedReceiptFile({ dataUrl: file });
          setIsLoadingReceipt(false);
          return;
        }
        if (file.startsWith('http')) {
          setReceiptDataUrl(file);
          setSelectedReceiptFile({ dataUrl: file });
          setIsLoadingReceipt(false);
          return;
        }
        // Try as server file
        const fileUrl = `/api/receipts/file/${file}`;
        try {
          const response = await fetch(fileUrl, { method: 'HEAD' });
          if (response.ok) {
            setReceiptDataUrl(fileUrl);
            setSelectedReceiptFile({ dataUrl: fileUrl });
            setIsLoadingReceipt(false);
            return;
          }
        } catch {
          // Not found
        }
      }

      // Fallback: Show file info
      setSelectedReceiptFile(file);
      setReceiptError('Unable to preview this file. Try downloading it instead.');
      setIsLoadingReceipt(false);
    } catch (error) {
      console.error('Error loading receipt file:', error);
      setReceiptError('Error loading file. Please try again.');
      setIsLoadingReceipt(false);
    }
  };

  // Navigate through multiple receipt files
  const navigateReceipt = (direction: 'prev' | 'next') => {
    if (allReceiptFiles.length === 0) return;

    let newIndex = selectedReceiptIndex;
    if (direction === 'next') {
      newIndex = (newIndex + 1) % allReceiptFiles.length;
    } else {
      newIndex = (newIndex - 1 + allReceiptFiles.length) % allReceiptFiles.length;
    }
    setSelectedReceiptIndex(newIndex);
    loadReceiptFile(allReceiptFiles[newIndex]);
  };

  // Download Receipt
  const handleDownloadReceipt = (file: any) => {
    console.log('Downloading receipt file:', file);

    const triggerDownload = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showNotification(`File "${filename}" downloaded successfully!`, 'success');
    };

    try {
      // If file has a server URL or storedName, open in new tab
      if (file?.url) {
        window.open(file.url, '_blank');
        return;
      }

      if (file?.storedName) {
        const fileUrl = `/api/receipts/file/${file.storedName}`;
        window.open(fileUrl, '_blank');
        return;
      }

      if (file?.filename) {
        const fileUrl = `/api/receipts/file/${file.filename}`;
        window.open(fileUrl, '_blank');
        return;
      }

      // If we have a dataUrl, use it
      if (file?.dataUrl) {
        // If it's a server URL, open in new tab
        if (file.dataUrl.startsWith('/api/') || file.dataUrl.startsWith('http')) {
          window.open(file.dataUrl, '_blank');
          return;
        }

        fetch(file.dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const extension = file.type?.split('/')[1] || 'png';
            const filename = file.name || `receipt.${extension}`;
            triggerDownload(blob, filename);
          })
          .catch(() => {
            if (file.dataUrl.startsWith('blob:')) {
              fetch(file.dataUrl)
                .then(res => res.blob())
                .then(blob => triggerDownload(blob, file.name || 'receipt.png'))
                .catch(() => showNotification('Error downloading file', 'error'));
            } else if (file.dataUrl.startsWith('data:')) {
              // Convert data URL to blob
              fetch(file.dataUrl)
                .then(res => res.blob())
                .then(blob => triggerDownload(blob, file.name || 'receipt.png'))
                .catch(() => showNotification('Error downloading file', 'error'));
            } else {
              showNotification('Error downloading file', 'error');
            }
          });
        return;
      }

      // If file is a string URL
      if (typeof file === 'string') {
        if (file.startsWith('data:')) {
          fetch(file)
            .then(res => res.blob())
            .then(blob => triggerDownload(blob, 'receipt.png'))
            .catch(() => window.open(file, '_blank'));
        } else {
          window.open(file, '_blank');
        }
        return;
      }

      // Fallback: Generate text receipt
      const receiptData = {
        studentName: selectedPayment?.candidateName || selectedPayment?.studentName || selectedPayment?.name || 'Student',
        schoolName: selectedPayment?.schoolName || 'School',
        amount: selectedPayment?.feeAmount || selectedPayment?.amount || 0,
        date: selectedPayment?.submittedDate || new Date().toLocaleDateString(),
      };

      const content = `
========================================
PAYMENT RECEIPT
========================================

Student: ${receiptData.studentName}
School: ${receiptData.schoolName}
Amount: ${receiptData.amount} Birr
Date: ${receiptData.date}

========================================
Generated receipt for reference.
========================================
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      triggerDownload(blob, `receipt_${receiptData.studentName.replace(/\s+/g, '_')}_${Date.now()}.txt`);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Error downloading file', 'error');
    }
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Payment Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .receipt { max-width: 600px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .details { margin: 20px 0; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .total { font-size: 20px; font-weight: bold; color: #059669; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                img { max-width: 100%; }
                .file-list { margin: 20px 0; }
                .file-item { padding: 8px; background: #f8fafc; border-radius: 8px; margin: 4px 0; }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h2>Payment Receipt</h2>
                  <p>${selectedPayment?.schoolName || 'School'}</p>
                </div>
                <div class="details">
                  <div class="row"><span>Student:</span><span>${selectedPayment?.candidateName || selectedPayment?.studentName || selectedPayment?.name || 'N/A'}</span></div>
                  <div class="row"><span>Grade:</span><span>${selectedPayment?.gradeApplied || selectedPayment?.grade || 'N/A'}</span></div>
                  <div class="row"><span>Amount:</span><span>${selectedPayment?.feeAmount || selectedPayment?.amount || 0} Birr</span></div>
                  <div class="row"><span>Date:</span><span>${selectedPayment?.submittedDate || new Date().toLocaleDateString()}</span></div>
                  <div class="row"><span>Status:</span><span>${selectedPayment?.status || 'Pending'}</span></div>
                </div>
                ${receiptDataUrl ? `<div style="margin: 20px 0;"><img src="${receiptDataUrl}" alt="Receipt" style="max-width:100%;"/></div>` : ''}
                ${allReceiptFiles.length > 0 ? `
                  <div class="file-list">
                    <h4>Attached Files (${allReceiptFiles.length})</h4>
                    ${allReceiptFiles.map((f: any) => `
                      <div class="file-item">${f.originalName || f.name || 'Receipt file'}</div>
                    `).join('')}
                  </div>
                ` : ''}
                <div class="total">Total: ${selectedPayment?.feeAmount || selectedPayment?.amount || 0} Birr</div>
                <div class="footer">Printed on ${new Date().toLocaleString()}</div>
              </div>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        setTimeout(() => win.close(), 1000);
      }
    }
  };

  // ============ PAYMENT APPROVAL ============

  const handleApprovePayment = (payment: any) => {
    setModalType('approvePayment');
    setModalData({
      ...payment,
      amount: payment.feeAmount || payment.amount || 0
    });
    setShowModal(true);
  };

  const handleConfirmApproval = () => {
    const amount = modalData.feeAmount || modalData.amount || 0;
    const studentName = modalData.candidateName || modalData.studentName || modalData.name;
    const studentGrade = modalData.gradeApplied || modalData.grade || 'PreKG';
    const parentName = modalData.parentName || '';
    const parentEmail = modalData.email || modalData.parentEmail || '';
    const studentEmail = modalData.email || '';

    // 1. Record the transaction
    if (onAddTransaction) {
      onAddTransaction(
        amount,
        'Income',
        'Tuition',
        `Tuition payment for ${studentName} - ${modalData.schoolName || ''}`,
        'BankTransfer'
      );
    } else {
      const transactions = JSON.parse(localStorage.getItem('safari_transactions') || '[]');
      transactions.push({
        id: `TXN-${Date.now().toString().slice(-6)}`,
        type: 'Income',
        category: 'Tuition',
        amount: amount,
        date: new Date().toLocaleDateString(),
        description: `Tuition payment for ${studentName}`,
        paymentMethod: modalData.paymentMethod || 'BankTransfer',
        status: 'Paid',
        schoolId: selectedSchool || propSchoolId,
        schoolName: modalData.schoolName || propSchoolName
      });
      localStorage.setItem('safari_transactions', JSON.stringify(transactions));
    }

    // 2. Remove from pending payments
    const allPending = JSON.parse(localStorage.getItem('safari_pending_payments') || '[]');
    const updatedPending = allPending.filter((p: any) => p.id !== modalData.id);
    localStorage.setItem('safari_pending_payments', JSON.stringify(updatedPending));

    // 3. Update admissions
    const admissions = JSON.parse(localStorage.getItem('safari_admissions') || '[]');
    const updatedAdmissions = admissions.map((a: any) =>
      a.id === modalData.id ? {
        ...a,
        status: 'Accepted',
        approvedByFinance: true,
        feePaid: amount,
        feePaidDate: new Date().toLocaleDateString()
      } : a
    );
    localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));

    // 4. Create pending student record for Principal
    const pendingStudent = {
      id: `PEN-${Date.now().toString().slice(-6)}`,
      candidateName: studentName,
      name: studentName,
      email: studentEmail || parentEmail,
      parentName: parentName,
      parentEmail: parentEmail,
      gradeApplied: studentGrade,
      grade: studentGrade,
      phone: modalData.phone || '',
      schoolId: selectedSchool || propSchoolId || modalData.schoolId,
      schoolName: modalData.schoolName || propSchoolName || '',
      feePaid: amount,
      feePaidDate: new Date().toISOString(),
      status: 'Pending',
      approvedBy: userName,
      approvedDate: new Date().toISOString(),
      receiptFiles: modalData.receiptFiles || [],
      hasReceipt: true,
      submittedDate: modalData.submittedDate || new Date().toLocaleDateString()
    };

    // Save to pending students
    const existingPending = JSON.parse(localStorage.getItem('safari_pending_students') || '[]');
    const exists = existingPending.some((s: any) => s.candidateName === studentName && s.schoolId === pendingStudent.schoolId);
    if (!exists) {
      existingPending.push(pendingStudent);
      localStorage.setItem('safari_pending_students', JSON.stringify(existingPending));
    }

    // 5. Update pending payments state
    setPendingPayments(updatedPending.filter((p: any) => p.schoolId === selectedSchool));

    showNotification(
      `✅ Payment of ${amount} Birr approved for ${studentName}! Student has been sent to Principal for enrollment.`,
      'success'
    );
    setShowModal(false);
  };

  const handleRejectPayment = (payment: any) => {
    if (window.confirm(`Reject payment for ${payment.candidateName || payment.studentName || payment.name}?`)) {
      const allPending = JSON.parse(localStorage.getItem('safari_pending_payments') || '[]');
      const updatedPending = allPending.filter((p: any) => p.id !== payment.id);
      localStorage.setItem('safari_pending_payments', JSON.stringify(updatedPending));

      const admissions = JSON.parse(localStorage.getItem('safari_admissions') || '[]');
      const updatedAdmissions = admissions.map((a: any) =>
        a.id === payment.id ? { ...a, status: 'Declined' } : a
      );
      localStorage.setItem('safari_admissions', JSON.stringify(updatedAdmissions));

      setPendingPayments(updatedPending.filter((p: any) => p.schoolId === selectedSchool));
      showNotification(`❌ Payment rejected for ${payment.candidateName || payment.studentName || payment.name}`, 'error');
    }
  };

  // Get filtered pending payments
  const getFilteredPending = () => {
    if (!searchQuery) return pendingPayments;
    return pendingPayments.filter((p: any) =>
      p.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.parentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'PaymentPending': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-indigo-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-indigo-500" />;
  };

  const getFileColor = (fileType: string) => {
    if (fileType?.startsWith('image/')) return 'border-indigo-200 bg-indigo-50';
    if (fileType === 'application/pdf') return 'border-red-200 bg-red-50';
    return 'border-blue-200 bg-blue-50';
  };

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    loadFeeStructures();
    loadPendingPayments();
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Data refreshed successfully!', 'success');
    }, 500);
  };

  // Fee Structure Management
  const handleOpenFeeManager = () => {
    setModalType('feeManager');
    setModalData({ grade: '', schoolId: selectedSchool || propSchoolId || '' });
    setShowModal(true);
  };

  const handleEditFee = (fee: FeeStructure) => {
    setEditingFee(fee);
    setModalData({
      ...fee,
      otherFees: fee.otherFees || []
    });
    setModalType('editFee');
    setShowModal(true);
  };

  const handleSaveFeeStructure = () => {
    const allFees = JSON.parse(localStorage.getItem('safari_fee_structures') || '[]');

    const feeData = {
      id: editingFee?.id || `FEE-${Date.now().toString().slice(-6)}`,
      grade: modalData.grade,
      schoolId: selectedSchool || modalData.schoolId || propSchoolId || '',
      schoolName: selectedSchool ? schools.find((s: any) => s.id === (selectedSchool || modalData.schoolId))?.name || '' : propSchoolName || '',
      tuitionFee: Number(modalData.tuitionFee) || 0,
      registrationFee: Number(modalData.registrationFee) || 0,
      libraryFee: Number(modalData.libraryFee) || 0,
      sportsFee: Number(modalData.sportsFee) || 0,
      transportFee: Number(modalData.transportFee) || 0,
      boardingFee: Number(modalData.boardingFee) || 0,
      otherFees: modalData.otherFees || [],
      totalAmount: calculateTotalFee(modalData),
      updatedAt: new Date().toISOString(),
      updatedBy: userName
    };

    let updatedFees;
    if (editingFee) {
      updatedFees = allFees.map((f: any) =>
        f.id === editingFee.id ? feeData : f
      );
    } else {
      const existingIndex = allFees.findIndex((f: any) =>
        f.grade === feeData.grade && f.schoolId === feeData.schoolId
      );
      if (existingIndex >= 0) {
        updatedFees = allFees.map((f: any, i: number) =>
          i === existingIndex ? feeData : f
        );
      } else {
        updatedFees = [...allFees, feeData];
      }
    }

    localStorage.setItem('safari_fee_structures', JSON.stringify(updatedFees));
    setFeeStructures(updatedFees.filter((f: any) => f.schoolId === selectedSchool || !f.schoolId));

    showNotification(
      `Fee structure for ${feeData.grade} updated successfully! Total: ${feeData.totalAmount} Birr`,
      'success'
    );
    setShowModal(false);
    setEditingFee(null);
    setModalData({});
  };

  const handleAddOtherFee = () => {
    const otherFees = modalData.otherFees || [];
    otherFees.push({ name: '', amount: 0 });
    setModalData({ ...modalData, otherFees });
  };

  const handleRemoveOtherFee = (index: number) => {
    const otherFees = modalData.otherFees || [];
    otherFees.splice(index, 1);
    setModalData({ ...modalData, otherFees });
  };

  const handleUpdateOtherFee = (index: number, field: string, value: any) => {
    const otherFees = modalData.otherFees || [];
    otherFees[index] = { ...otherFees[index], [field]: value };
    setModalData({ ...modalData, otherFees });
  };

  const assignedSchools = schools.filter((s: any) => s.status === 'active');

  const totalIncome = transactions.filter((t: any) => t.type === 'Income').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t: any) => t.type === 'Expense').reduce((sum: number, t: any) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 rounded-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Finance Dashboard</h2>
            <p className="text-emerald-200 mt-1">Welcome back, {userName}</p>
            {propSchoolName && (
              <p className="text-emerald-300 text-sm mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {propSchoolName}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Revenue</p>
                <p className="font-bold">{totalIncome.toLocaleString()} Birr</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Expenses</p>
                <p className="font-bold">{totalExpenses.toLocaleString()} Birr</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Balance</p>
                <p className={`font-bold ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {balance.toLocaleString()} Birr
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <p className="text-sm text-emerald-200">Pending Approvals</p>
                <p className="font-bold text-yellow-300">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenFeeManager}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" /> Fee Structure
            </button>
          </div>
        </div>
      </div>

      {/* School Selector */}
      {assignedSchools.length > 1 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Select School Branch
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Schools</option>
            {assignedSchools.map((school: any) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="text-xl font-bold text-yellow-600">{pendingPayments.length}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('transactions')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="text-xl font-bold text-emerald-600">{totalIncome.toLocaleString()} Birr</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('transactions')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString()} Birr</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab('transactions')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Net Balance</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {balance.toLocaleString()} Birr
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Overview', 'Pending', 'Transactions', 'Fee Structure'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.toLowerCase().replace(' ', '_')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingPayments.length > 0 && (
              <span className="ml-1 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-xs">
                {pendingPayments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" /> Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Students</span>
                <span className="font-bold text-slate-900">{students.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Fee Structures</span>
                <span className="font-bold text-slate-900">{feeStructures.length} grades</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Pending Approvals</span>
                <span className="font-bold text-yellow-600">{pendingPayments.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Transactions</span>
                <span className="font-bold text-slate-900">{transactions.length}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-600" /> Fee Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Average Tuition Fee</span>
                <span className="font-bold text-slate-900">
                  {feeStructures.length > 0
                    ? Math.round(feeStructures.reduce((sum: number, f: any) => sum + f.tuitionFee, 0) / feeStructures.length).toLocaleString()
                    : 0} Birr
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Highest Fee</span>
                <span className="font-bold text-slate-900">
                  {feeStructures.length > 0
                    ? Math.max(...feeStructures.map((f: any) => f.totalAmount)).toLocaleString()
                    : 0} Birr
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Lowest Fee</span>
                <span className="font-bold text-slate-900">
                  {feeStructures.length > 0
                    ? Math.min(...feeStructures.map((f: any) => f.totalAmount)).toLocaleString()
                    : 0} Birr
                </span>
              </div>
              <button
                onClick={handleOpenFeeManager}
                className="w-full mt-2 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="h-4 w-4" /> Manage Fee Structures
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING PAYMENTS TAB */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending Fee Approvals ({pendingPayments.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-48"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">School</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Amount (Birr)</th>
                  <th className="px-4 py-2 text-left">Receipt</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredPending().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      {selectedSchool ? 'No pending payments for this school.' : 'No pending payments.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredPending().map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{payment.candidateName || payment.studentName || payment.name}</td>
                      <td className="px-4 py-3">{payment.schoolName || 'N/A'}</td>
                      <td className="px-4 py-3">{payment.gradeApplied || payment.grade || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        {payment.feeAmount || payment.amount || 0} Birr
                      </td>
                      <td className="px-4 py-3">
                        {payment.hasReceipt || payment.receiptFiles?.length > 0 ? (
                          <button
                            onClick={() => handleViewReceipt(payment)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="h-4 w-4" /> View Receipt ({payment.receiptFiles?.length || 1})
                          </button>
                        ) : payment.receiptFile ? (
                          <button
                            onClick={() => handleViewReceipt(payment)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="h-4 w-4" /> View Receipt
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">No receipt</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(payment.status || 'Pending')}`}>
                          {payment.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleApprovePayment(payment)}
                            className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment)}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-3 w-3" /> Reject
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

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Coins className="h-4 w-4" /> All Transactions ({transactions.length})
            </h3>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-48"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">School</th>
                  <th className="px-4 py-2 text-right">Amount (Birr)</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 50).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500">{tx.date}</td>
                      <td className="px-4 py-2 font-medium">{tx.description}</td>
                      <td className="px-4 py-2">{tx.schoolName || 'N/A'}</td>
                      <td className={`px-4 py-2 text-right font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'Income' ? '+' : '-'}{tx.amount.toLocaleString()} Birr
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500">
                        {tx.paymentMethod || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEE STRUCTURE TAB */}
      {activeTab === 'fee_structure' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="h-4 w-4" /> Fee Structure by Grade
              <span className="text-sm text-slate-400 font-normal ml-2">
                ({feeStructures.length} grades configured)
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleOpenFeeManager}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add/Edit Fee
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Tuition (Birr)</th>
                  <th className="px-4 py-2 text-left">Registration (Birr)</th>
                  <th className="px-4 py-2 text-left">Library (Birr)</th>
                  <th className="px-4 py-2 text-left">Sports (Birr)</th>
                  <th className="px-4 py-2 text-left">Transport (Birr)</th>
                  <th className="px-4 py-2 text-left">Boarding (Birr)</th>
                  <th className="px-4 py-2 text-left">Total (Birr)</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeStructures.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No fee structures configured. Click "Add/Edit Fee" to set up fees for each grade.
                    </td>
                  </tr>
                ) : (
                  feeStructures.map((fee: any) => (
                    <tr key={fee.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{fee.grade}</td>
                      <td className="px-4 py-3">{fee.tuitionFee.toLocaleString()}</td>
                      <td className="px-4 py-3">{fee.registrationFee.toLocaleString()}</td>
                      <td className="px-4 py-3">{fee.libraryFee.toLocaleString()}</td>
                      <td className="px-4 py-3">{fee.sportsFee.toLocaleString()}</td>
                      <td className="px-4 py-3">{fee.transportFee.toLocaleString()}</td>
                      <td className="px-4 py-3">{fee.boardingFee.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fee.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEditFee(fee)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Fee Structure"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              * Last updated: {feeStructures.length > 0 ? new Date(feeStructures[0].updatedAt).toLocaleString() : 'N/A'}
              {feeStructures.length > 0 && ` by ${feeStructures[0].updatedBy}`}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECEIPT VIEW MODAL - COMPLETE WITH SERVER FILE HANDLING */}
      {/* ============================================================ */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all ${isFullscreen ? 'max-w-7xl' : 'max-w-4xl'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                Payment Receipt
              </h3>
              <div className="flex items-center gap-2">
                {/* Navigation buttons for multiple files */}
                {allReceiptFiles.length > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    <button
                      onClick={() => navigateReceipt('prev')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
                      title="Previous file"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                    <span className="text-xs text-slate-500">
                      {selectedReceiptIndex + 1}/{allReceiptFiles.length}
                    </span>
                    <button
                      onClick={() => navigateReceipt('next')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
                      title="Next file"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Print Receipt"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedReceiptFile(null);
                    setReceiptDataUrl(null);
                    setReceiptError(null);
                    setIsFullscreen(false);
                    setAllReceiptFiles([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div id="receipt-content" className="space-y-4">
              {/* Payment Details */}
              <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between border-b border-slate-200 pb-2 md:border-b-0 md:pb-0">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-medium">{selectedPayment.candidateName || selectedPayment.studentName || selectedPayment.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2 md:border-b-0 md:pb-0">
                  <span className="text-slate-500">School:</span>
                  <span className="font-medium">{selectedPayment.schoolName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2 md:border-b-0 md:pb-0">
                  <span className="text-slate-500">Grade:</span>
                  <span className="font-medium">{selectedPayment.gradeApplied || selectedPayment.grade || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2 md:border-b-0 md:pb-0">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedPayment.feeAmount || selectedPayment.amount || 0} Birr
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2 md:border-b-0 md:pb-0">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(selectedPayment.status || 'Pending')}`}>
                    {selectedPayment.status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted:</span>
                  <span className="font-medium">{selectedPayment.submittedDate || selectedPayment.date || 'N/A'}</span>
                </div>
              </div>

              {/* Receipt Files Section */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Uploaded Receipts
                  <span className="text-sm text-slate-400 font-normal ml-2">
                    ({allReceiptFiles.length} files)
                  </span>
                </h4>

                {/* Loading State */}
                {isLoadingReceipt && (
                  <div className="flex items-center justify-center py-8 bg-slate-50 rounded-xl">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mr-3" />
                    <span className="text-slate-500">Loading receipt...</span>
                  </div>
                )}

                {/* Error State */}
                {receiptError && !isLoadingReceipt && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">{receiptError}</p>
                    <button
                      onClick={() => {
                        if (allReceiptFiles.length > 0) {
                          loadReceiptFile(allReceiptFiles[selectedReceiptIndex]);
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Display the actual receipt image */}
                {receiptDataUrl && !isLoadingReceipt && !receiptError && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border-2 border-indigo-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-slate-700">
                        {selectedReceiptFile?.originalName || selectedReceiptFile?.name || 'Receipt Image'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedReceiptFile) {
                              handleDownloadReceipt(selectedReceiptFile);
                            } else if (receiptDataUrl) {
                              const link = document.createElement('a');
                              link.href = receiptDataUrl;
                              link.download = 'receipt_image.png';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center bg-white rounded-lg p-2 min-h-[200px]">
                      {receiptDataUrl.startsWith('/api/') || receiptDataUrl.startsWith('http') ? (
                        <div className="w-full">
                          {receiptDataUrl.toLowerCase().includes('.pdf') ? (
                            <embed
                              src={receiptDataUrl}
                              type="application/pdf"
                              className="w-full h-[500px] rounded-lg"
                            />
                          ) : (
                            <img
                              src={receiptDataUrl}
                              alt="Payment Receipt"
                              className="max-w-full max-h-[500px] object-contain rounded-lg mx-auto"
                              onError={(e) => {
                                console.error('Image failed to load');
                                setReceiptError('Failed to load image. Please try downloading the file.');
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <img
                          src={receiptDataUrl}
                          alt="Payment Receipt"
                          className="max-w-full max-h-[500px] object-contain rounded-lg mx-auto"
                          onError={(e) => {
                            console.error('Image failed to load');
                            setReceiptError('Failed to load image. Please try downloading the file.');
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* File List */}
                {allReceiptFiles.length > 0 && !isLoadingReceipt && (
                  <div className="space-y-3">
                    {allReceiptFiles.map((file: any, index: number) => {
                      const isImage = file.type?.startsWith('image/');
                      const isActive = index === selectedReceiptIndex;

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-50'
                              : `border-slate-200 hover:border-indigo-300 hover:bg-slate-50`
                          }`}
                          onClick={() => {
                            setSelectedReceiptIndex(index);
                            loadReceiptFile(file);
                          }}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {file.originalName || file.name || `Receipt ${index + 1}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                                {isActive && ' • Currently viewing'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReceipt(file);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" /> Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {allReceiptFiles.length === 0 && !isLoadingReceipt && !receiptError && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No receipt files uploaded</p>
                    <p className="text-xs text-slate-400 mt-1">The applicant did not attach any receipt files</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 flex-wrap">
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedReceiptFile(null);
                    setReceiptDataUrl(null);
                    setReceiptError(null);
                    handleApprovePayment(selectedPayment);
                  }}
                  className="flex-1 min-w-[120px] bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" /> Approve Payment
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedReceiptFile(null);
                    setReceiptDataUrl(null);
                    setReceiptError(null);
                    handleRejectPayment(selectedPayment);
                  }}
                  className="flex-1 min-w-[120px] bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedReceiptFile(null);
                    setReceiptDataUrl(null);
                    setReceiptError(null);
                    setIsFullscreen(false);
                    setAllReceiptFiles([]);
                  }}
                  className="flex-1 min-w-[120px] bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE PAYMENT MODAL */}
      {showModal && modalType === 'approvePayment' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Approve Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-medium">{modalData.candidateName || modalData.studentName || modalData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">School:</span>
                  <span className="font-medium">{modalData.schoolName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade:</span>
                  <span className="font-medium">{modalData.gradeApplied || modalData.grade || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-emerald-600">{modalData.feeAmount || modalData.amount || 0} Birr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-sm">{modalData.paymentMethod || 'BankTransfer'}</span>
                </div>
                {modalData.receiptFiles && modalData.receiptFiles.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipts:</span>
                    <span className="font-medium text-indigo-600">{modalData.receiptFiles.length} file(s)</span>
                  </div>
                )}
                {modalData.receiptFile && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt:</span>
                    <span className="font-medium text-indigo-600">1 file</span>
                  </div>
                )}
                {modalData.notes && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notes:</span>
                    <span className="font-medium text-sm">{modalData.notes}</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-sm text-yellow-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Approving this payment will record the transaction and send the student to the principal for enrollment.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmApproval}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEE MANAGER MODAL */}
      {showModal && (modalType === 'feeManager' || modalType === 'editFee') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                {editingFee ? `Edit Fee Structure - ${editingFee.grade}` : 'Configure Fee Structure'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingFee(null);
                  setModalData({});
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>School: <strong>{propSchoolName || schools.find((s: any) => s.id === selectedSchool)?.name || 'Not assigned'}</strong></span>
              </p>
              <p className="text-xs text-blue-600 mt-1 ml-6">
                All amounts are in <strong>Birr (ETB)</strong>
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveFeeStructure(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade *</label>
                <select
                  required
                  value={modalData.grade || ''}
                  onChange={(e) => setModalData({ ...modalData, grade: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  disabled={!!editingFee}
                >
                  <option value="">Select Grade</option>
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tuition Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.tuitionFee || 0}
                    onChange={(e) => setModalData({ ...modalData, tuitionFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Registration Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.registrationFee || 0}
                    onChange={(e) => setModalData({ ...modalData, registrationFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Library Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.libraryFee || 0}
                    onChange={(e) => setModalData({ ...modalData, libraryFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Sports Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.sportsFee || 0}
                    onChange={(e) => setModalData({ ...modalData, sportsFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Transport Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.transportFee || 0}
                    onChange={(e) => setModalData({ ...modalData, transportFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Boarding Fee (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.boardingFee || 0}
                    onChange={(e) => setModalData({ ...modalData, boardingFee: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Other Fees */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Other Fees</label>
                  <button
                    type="button"
                    onClick={handleAddOtherFee}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Fee
                  </button>
                </div>
                {(modalData.otherFees || []).map((fee: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Fee Name"
                      value={fee.name || ''}
                      onChange={(e) => handleUpdateOtherFee(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      min="0"
                      value={fee.amount || 0}
                      onChange={(e) => handleUpdateOtherFee(index, 'amount', Number(e.target.value))}
                      className="w-32 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherFee(index)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-800">Total Fees:</span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {calculateTotalFee(modalData).toLocaleString()} Birr
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Fee Structure
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFee(null);
                    setModalData({});
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}