import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, QrCode, FileArchive, ArrowLeft, Check, X, Clock, ChevronRight, FileText, Calendar, Building2, Tag, Globe, Volume2, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

type Language = 'en' | 'hi';
type DocumentType = 'lab' | 'prescription' | 'imaging' | 'bill' | 'other';
type SourceMethod = 'camera' | 'upload' | 'qr' | 'dicom' | null;

type OCRField = {
  key: string;
  label: string;
  labelHi: string;
  value: string;
  confidence: number;
  editable: boolean;
};

type DocumentData = {
  sourceMethod: SourceMethod;
  fileName: string;
  fileSize: string;
  fileType: string;
  preview: string;
  ocrFields: OCRField[];
  documentType: DocumentType;
  tags: string[];
};

type ArogyaVaultAddDocumentWizardProps = {
  language?: Language;
  initialMethod?: SourceMethod;
  onComplete?: (data: DocumentData & { file?: File }) => void;
  onCancel?: () => void;
};

const translations = {
  en: {
    title: 'Add a New Document',
    subtitle: 'Choose how you want to add your health record.',
    camera: 'Camera / Scan',
    cameraDesc: 'Capture document with camera',
    upload: 'Upload File',
    uploadDesc: 'PDF, JPG, PNG, DOCX',
    qr: 'Scan QR / ABHA Import',
    qrDesc: 'Import from ABHA or lab',
    dicom: 'Import DICOM ZIP',
    dicomDesc: 'Medical imaging files',
    cancel: 'Cancel',
    next: 'Next',
    back: 'Back',
    save: 'Save',
    retake: 'Retake',
    replace: 'Replace',
    continue: 'Continue',
    checkDetails: 'Check the extracted details before saving.',
    editMetadata: 'Edit Metadata',
    documentType: 'Document Type',
    providerName: 'Provider Name',
    date: 'Date',
    documentTitle: 'Document Title',
    tags: 'Tags',
    lab: 'Lab Report',
    prescription: 'Prescription',
    imaging: 'Imaging',
    bill: 'Bill',
    other: 'Other',
    lowConfidence: 'Low confidence - please verify',
    savedLocally: 'Saved locally. Will upload when network is available.',
    documentAdded: 'Document Added Successfully!',
    documentAddedDesc: 'You can find it in your Vault.',
    goToVault: 'Go to Vault',
    addAnother: 'Add Another',
    capturing: 'Capturing document...',
    alignDocument: 'Align document within frame',
    detectingEdges: 'Detecting edges...',
    glareDetected: 'Glare detected - adjust lighting',
    qualityGood: 'Quality looks good!',
    uploading: 'Uploading file...',
    processing: 'Processing document...',
    extracting: 'Extracting information...',
    offline: 'Offline',
    online: 'Online',
    pendingUpload: 'Pending upload',
    summary: 'Summary',
    guidedMode: 'Voice guidance enabled'
  },
  hi: {
    title: 'नया दस्तावेज़ जोड़ें',
    subtitle: 'अपना स्वास्थ्य रिकॉर्ड जोड़ने का तरीका चुनें।',
    camera: 'कैमरा / स्कैन',
    cameraDesc: 'कैमरे से दस्तावेज़ कैप्चर करें',
    upload: 'फ़ाइल अपलोड करें',
    uploadDesc: 'PDF, JPG, PNG, DOCX',
    qr: 'क्यूआर स्कैन / ABHA आयात',
    qrDesc: 'ABHA या लैब से आयात करें',
    dicom: 'DICOM ZIP आयात करें',
    dicomDesc: 'चिकित्सा इमेजिंग फ़ाइलें',
    cancel: 'रद्द करें',
    next: 'आगे',
    back: 'पीछे',
    save: 'सहेजें',
    retake: 'फिर से लें',
    replace: 'बदलें',
    continue: 'जारी रखें',
    checkDetails: 'सहेजने से पहले निकाले गए विवरण की जांच करें।',
    editMetadata: 'मेटाडेटा संपादित करें',
    documentType: 'दस्तावेज़ प्रकार',
    providerName: 'प्रदाता का नाम',
    date: 'तारीख',
    documentTitle: 'दस्तावेज़ शीर्षक',
    tags: 'टैग',
    lab: 'लैब रिपोर्ट',
    prescription: 'प्रिस्क्रिप्शन',
    imaging: 'इमेजिंग',
    bill: 'बिल',
    other: 'अन्य',
    lowConfidence: 'कम विश्वास - कृपया सत्यापित करें',
    savedLocally: 'स्थानीय रूप से सहेजा गया। नेटवर्क उपलब्ध होने पर अपलोड होगा।',
    documentAdded: 'दस्तावेज़ सफलतापूर्वक जोड़ा गया!',
    documentAddedDesc: 'आप इसे अपने वॉल्ट में पा सकते हैं।',
    goToVault: 'वॉल्ट पर जाएं',
    addAnother: 'एक और जोड़ें',
    capturing: 'दस्तावेज़ कैप्चर कर रहे हैं...',
    alignDocument: 'फ़्रेम के भीतर दस्तावेज़ संरेखित करें',
    detectingEdges: 'किनारों का पता लगा रहे हैं...',
    glareDetected: 'चमक का पता चला - प्रकाश समायोजित करें',
    qualityGood: 'गुणवत्ता अच्छी लग रही है!',
    uploading: 'फ़ाइल अपलोड कर रहे हैं...',
    processing: 'दस्तावेज़ संसाधित कर रहे हैं...',
    extracting: 'जानकारी निकाल रहे हैं...',
    offline: 'ऑफ़लाइन',
    online: 'ऑनलाइन',
    pendingUpload: 'अपलोड लंबित',
    summary: 'सारांश',
    guidedMode: 'वॉयस मार्गदर्शन सक्षम'
  }
};

const mockOCRFields: OCRField[] = [
  {
    key: 'type',
    label: 'Document Type',
    labelHi: 'दस्तावेज़ प्रकार',
    value: 'Lab Report',
    confidence: 0.95,
    editable: true
  },
  {
    key: 'provider',
    label: 'Provider Name',
    labelHi: 'प्रदाता का नाम',
    value: 'City Hospital Lab',
    confidence: 0.88,
    editable: true
  },
  {
    key: 'date',
    label: 'Date',
    labelHi: 'तारीख',
    value: '2024-01-15',
    confidence: 0.92,
    editable: true
  },
  {
    key: 'title',
    label: 'Document Title',
    labelHi: 'दस्तावेज़ शीर्षक',
    value: 'Blood Test Results',
    confidence: 0.78,
    editable: true
  }
];

export const ArogyaVaultAddDocumentWizard = (props: ArogyaVaultAddDocumentWizardProps) => {
  const { language: initialLanguage = 'en', initialMethod, onComplete, onCancel } = props;
  
  const [currentStep, setCurrentStep] = useState<number>(initialMethod ? 2 : 1);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [sourceMethod, setSourceMethod] = useState<SourceMethod>(initialMethod || null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureQuality, setCaptureQuality] = useState<'good' | 'glare' | 'detecting'>('detecting');
  const [documentData, setDocumentData] = useState<DocumentData>({
    sourceMethod: null,
    fileName: '',
    fileSize: '',
    fileType: '',
    preview: '',
    ocrFields: mockOCRFields,
    documentType: 'lab',
    tags: ['lab', 'blood-test']
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const t = translations[language];

  const handleSourceSelect = (method: SourceMethod) => {
    setSourceMethod(method);
    setDocumentData(prev => ({ ...prev, sourceMethod: method }));
  };

  const handleNextFromSource = () => {
    if (!sourceMethod) return;
    setCurrentStep(2);
    
    if (sourceMethod === 'camera') {
      setIsCapturing(true);
      setCaptureQuality('detecting');
      setTimeout(() => {
        setCaptureQuality('glare');
      }, 1500);
      setTimeout(() => {
        setCaptureQuality('good');
        setIsCapturing(false);
      }, 3000);
    } else if (sourceMethod === 'upload') {
      // For file upload, simulate upload completion
      setIsCapturing(true);
      setTimeout(() => {
        setCaptureQuality('good');
        setIsCapturing(false);
      }, 1500);
    } else if (sourceMethod === 'qr' || sourceMethod === 'dicom') {
      // For QR and DICOM, simulate processing
      setIsCapturing(true);
      setTimeout(() => {
        setCaptureQuality('good');
        setIsCapturing(false);
      }, 2000);
    }
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setDocumentData(prev => ({
          ...prev,
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: file.type.includes('pdf') ? 'PDF' : 
                   file.type.includes('image') ? 'IMAGE' :
                   file.type.includes('word') ? 'DOCX' : 'OTHER',
          preview: e.target?.result as string,
          file: file, // Store file for upload
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // For non-images, just set metadata
      setDocumentData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type.includes('pdf') ? 'PDF' : 
                 file.type.includes('zip') ? 'ZIP' :
                 file.type.includes('word') ? 'DOCX' : 'OTHER',
        file: file, // Store file for upload
      }));
    }
    
    setIsCapturing(false);
    setCaptureQuality('good');
  };

  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      setCameraStream(stream);
      setIsCapturing(true);
      setCaptureQuality('detecting');
      
      // Simulate quality detection
      setTimeout(() => {
        setCaptureQuality('good');
      }, 2000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;
    
    const video = document.querySelector('video');
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      
      // Convert to blob/file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setUploadedFile(file);
          setDocumentData(prev => ({
            ...prev,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileType: 'JPG',
            preview: imageDataUrl,
            file: file,
          }));
        }
      }, 'image/jpeg', 0.9);
    }
    
    // Stop camera
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setIsCapturing(false);
    setCaptureQuality('good');
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Handle QR code scan
  const handleQRScan = () => {
    // For now, simulate QR scan - in production, use a QR scanner library
    setIsCapturing(true);
    setTimeout(() => {
      // Simulate importing from ABHA
      const mockFile = new File(['ABHA Record'], 'abha_record.pdf', { type: 'application/pdf' });
      setUploadedFile(mockFile);
      setDocumentData(prev => ({
        ...prev,
        fileName: 'abha_imported_record.pdf',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        file: mockFile,
      }));
      setIsCapturing(false);
      setCaptureQuality('good');
    }, 2000);
  };

  // Handle DICOM ZIP import
  const handleDicomImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please select a ZIP file for DICOM import');
      return;
    }

    setUploadedFile(file);
    setIsCapturing(true);
    
    // Simulate processing
    setTimeout(() => {
      setDocumentData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: 'ZIP',
        file: file,
      }));
      setIsCapturing(false);
      setCaptureQuality('good');
    }, 2000);
  };

  const handleContinueFromCapture = async () => {
    if (!uploadedFile && !capturedImage) {
      alert('Please capture or upload a file first');
      return;
    }

    // Get the file to analyze
    let fileToAnalyze: File | null = null;
    
    if (uploadedFile) {
      fileToAnalyze = uploadedFile;
    } else if (capturedImage) {
      // Convert captured image (base64) to File
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        fileToAnalyze = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      } catch (error) {
        console.error('Failed to convert captured image to file:', error);
        alert('Failed to process captured image');
        return;
      }
    }

    if (!fileToAnalyze) {
      alert('No file to analyze');
      return;
    }

    // Show loading state
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Call analyze API
      const formData = new FormData();
      formData.append('file', fileToAnalyze);

      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // Read response as text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log('[Wizard] Response status:', response.status, response.statusText);
      console.log('[Wizard] Response text (first 500 chars):', responseText.substring(0, 500));
      
      let data: any;
      
      // Try to parse as JSON
      try {
        data = JSON.parse(responseText);
        console.log('[Wizard] Parsed JSON data:', data);
      } catch (parseError) {
        console.error('[Wizard] Failed to parse JSON response:', parseError);
        console.error('[Wizard] Full response text:', responseText);
        
        // If it's a 401, user might not be logged in
        if (response.status === 401) {
          setAnalysisError('Please log in to analyze documents.');
        } else if (response.status === 200 && responseText.includes('<!DOCTYPE')) {
          // HTML response - likely a routing issue
          setAnalysisError('Server routing error. The analyze endpoint may not be configured correctly.');
        } else {
          setAnalysisError(`Server error (${response.status}). Response: ${responseText.substring(0, 100)}`);
        }
        setIsAnalyzing(false);
        return;
      }

      // Check if response indicates success
      if (!response.ok) {
        setAnalysisError(data.message || `Server error (${response.status}). Please try again.`);
        setIsAnalyzing(false);
        return;
      }

      // Check if document validation failed
      if (!data.success || data.isValid === false) {
        // Document is not medical or other error
        setAnalysisError(data.message || 'This document does not appear to be a medical document.');
        setIsAnalyzing(false);
        return;
      }

      // Check if we have the expected data structure
      if (!data.metadata) {
        console.warn('[Wizard] Response missing metadata field:', data);
        // Continue anyway - metadata might be empty
      }

      // Document is medical - extract metadata and pre-fill form
      const metadata = data.metadata || {};
      
      // Update document data with extracted metadata
      setDocumentData(prev => {
        const updatedFields = prev.ocrFields.map(field => {
          if (field.key === 'provider' && metadata.provider) {
            return { ...field, value: metadata.provider, confidence: 0.9 };
          }
          if (field.key === 'date' && metadata.date) {
            return { ...field, value: metadata.date, confidence: 0.9 };
          }
          if (field.key === 'title' && metadata.title) {
            return { ...field, value: metadata.title, confidence: 0.9 };
          }
          return field;
        });

        return {
          ...prev,
          documentType: (metadata.documentType as DocumentType) || prev.documentType,
          fileName: metadata.title || prev.fileName,
          ocrFields: updatedFields,
          tags: metadata.tags && metadata.tags.length > 0 ? metadata.tags : prev.tags,
        };
      });

      setIsAnalyzing(false);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Failed to analyze document. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    setShowSuccess(true);
  };

  const handleComplete = () => {
    // Clean up camera if active
    stopCamera();
    
    // Ensure preview is set from capturedImage if documentData.preview is empty
    const finalPreview = documentData.preview || capturedImage || '';
    
    if (onComplete) {
      // Include the file and preview in the data
      onComplete({
        ...documentData,
        preview: finalPreview,
        file: uploadedFile || undefined,
      });
    }
    setShowSuccess(false);
    setCurrentStep(1);
    setSourceMethod(null);
    setUploadedFile(null);
    setCapturedImage(null);
    setDocumentData({
      sourceMethod: null,
      fileName: '',
      fileSize: '',
      fileType: '',
      preview: '',
      ocrFields: mockOCRFields,
      documentType: 'lab',
      tags: ['lab', 'blood-test']
    });
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      ocrFields: prev.ocrFields.map(field =>
        field.key === key ? { ...field, value } : field
      )
    }));
  };

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentData(prev => ({ ...prev, documentType: type }));
  };

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4" data-testid="progress-indicator">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-300 ${
            step === currentStep
              ? 'w-8 bg-blue-600'
              : step < currentStep
              ? 'w-2 bg-blue-400'
              : 'w-2 bg-gray-300'
          }`}
          data-testid={`progress-step-${step}`}
        />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
      data-testid="wizard-step-1"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-wizard-title">{t.title}</h1>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle language"
            data-testid="button-toggle-language"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600" data-testid="text-wizard-subtitle">{t.subtitle}</p>
        {renderProgressIndicator()}
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="space-y-3">
          <button
            onClick={() => handleSourceSelect('camera')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              sourceMethod === 'camera'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            data-testid="button-source-camera"
          >
            <div className={`p-3 rounded-lg ${sourceMethod === 'camera' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Camera className={`w-6 h-6 ${sourceMethod === 'camera' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{t.camera}</div>
              <div className="text-sm text-gray-500">{t.cameraDesc}</div>
            </div>
            {sourceMethod === 'camera' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>

          <button
            onClick={() => handleSourceSelect('upload')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              sourceMethod === 'upload'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            data-testid="button-source-upload"
          >
            <div className={`p-3 rounded-lg ${sourceMethod === 'upload' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload className={`w-6 h-6 ${sourceMethod === 'upload' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{t.upload}</div>
              <div className="text-sm text-gray-500">{t.uploadDesc}</div>
            </div>
            {sourceMethod === 'upload' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>

          <button
            onClick={() => handleSourceSelect('qr')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              sourceMethod === 'qr'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            data-testid="button-source-qr"
          >
            <div className={`p-3 rounded-lg ${sourceMethod === 'qr' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <QrCode className={`w-6 h-6 ${sourceMethod === 'qr' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{t.qr}</div>
              <div className="text-sm text-gray-500">{t.qrDesc}</div>
            </div>
            {sourceMethod === 'qr' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>

          <button
            onClick={() => handleSourceSelect('dicom')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              sourceMethod === 'dicom'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            data-testid="button-source-dicom"
          >
            <div className={`p-3 rounded-lg ${sourceMethod === 'dicom' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <FileArchive className={`w-6 h-6 ${sourceMethod === 'dicom' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{t.dicom}</div>
              <div className="text-sm text-gray-500">{t.dicomDesc}</div>
            </div>
            {sourceMethod === 'dicom' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          data-testid="button-cancel"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleNextFromSource}
          disabled={!sourceMethod}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            sourceMethod
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="button-next-step1"
        >
          {t.next}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
      data-testid="wizard-step-2"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setCurrentStep(1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="button-back-step2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-step2-title">
            {sourceMethod === 'camera' ? t.camera :
             sourceMethod === 'upload' ? t.upload :
             sourceMethod === 'qr' ? t.qr :
             sourceMethod === 'dicom' ? t.dicom : ''}
          </h1>
        </div>
        {renderProgressIndicator()}
      </div>

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center px-6"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Document</h3>
            <p className="text-sm text-gray-600">Extracting text and validating medical content...</p>
          </motion.div>
        </div>
      )}

      {/* Error message */}
      {analysisError && !isAnalyzing && (
        <div className="px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Not a Medical Document</h4>
              <p className="text-sm text-red-700">{analysisError}</p>
            </div>
            <button
              onClick={() => setAnalysisError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {sourceMethod === 'camera' && (
          <div className="space-y-4" data-testid="camera-capture-view">
            <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden">
              {cameraStream ? (
                <video
                  ref={(video) => {
                    if (video && cameraStream) {
                      video.srcObject = cameraStream;
                      video.play();
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[85%] h-[90%] border-4 border-white/50 rounded-lg" />
                </div>
              )}
              {isCapturing && captureQuality === 'detecting' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full"
                    data-testid="capturing-indicator"
                  >
                    <span className="text-sm font-medium text-gray-900">{t.detectingEdges}</span>
                  </motion.div>
                </div>
              )}
              {!isCapturing && captureQuality === 'good' && (capturedImage || cameraStream) && (
                <div className="absolute top-4 left-0 right-0 flex justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2" data-testid="quality-good-indicator">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.qualityGood}</span>
                  </div>
                </div>
              )}
              {captureQuality === 'glare' && (
                <div className="absolute top-4 left-0 right-0 flex justify-center">
                  <div className="bg-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-2" data-testid="quality-glare-indicator">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.glareDetected}</span>
                  </div>
                </div>
              )}
            </div>
            {!cameraStream && !capturedImage && (
              <button
                onClick={startCamera}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Camera
              </button>
            )}
            {cameraStream && !capturedImage && (
              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Capture
                </button>
              </div>
            )}
            {capturedImage && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setUploadedFile(null);
                    startCamera();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Retake
                </button>
              </div>
            )}
            {cameraStream && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span>{t.alignDocument}</span>
              </div>
            )}
          </div>
        )}

        {sourceMethod === 'upload' && (
          <div className="space-y-4" data-testid="file-upload-view">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors block"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-900 font-medium mb-1">{t.upload}</div>
              <div className="text-sm text-gray-500">{t.uploadDesc}</div>
            </label>
            {uploadedFile && !isCapturing && (
              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3" data-testid="uploaded-file-preview">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{documentData.fileName}</div>
                  <div className="text-sm text-gray-500">{documentData.fileSize} • {documentData.fileType}</div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
            {isCapturing && (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-blue-50 px-6 py-3 rounded-full"
                  data-testid="uploading-indicator"
                >
                  <span className="text-sm font-medium text-blue-900">{t.uploading}</span>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {sourceMethod === 'qr' && (
          <div className="space-y-4" data-testid="qr-scan-view">
            <div className="border-2 border-blue-500 rounded-2xl p-8 text-center bg-blue-50">
              <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <div className="text-gray-900 font-medium mb-1">{t.qr}</div>
              <div className="text-sm text-gray-600">{t.qrDesc}</div>
            </div>
            {!uploadedFile && (
              <button
                onClick={handleQRScan}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Scan QR Code / Import from ABHA
              </button>
            )}
            {isCapturing && (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-blue-50 px-6 py-3 rounded-full"
                  data-testid="processing-indicator"
                >
                  <span className="text-sm font-medium text-blue-900">{t.processing}</span>
                </motion.div>
              </div>
            )}
            {uploadedFile && !isCapturing && (
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3" data-testid="qr-success-indicator">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-900">ABHA record imported successfully</span>
                  <div className="text-xs text-green-700 mt-1">{documentData.fileName}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {sourceMethod === 'dicom' && (
          <div className="space-y-4" data-testid="dicom-import-view">
            <div className="border-2 border-purple-500 rounded-2xl p-8 text-center bg-purple-50">
              <FileArchive className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <div className="text-gray-900 font-medium mb-1">{t.dicom}</div>
              <div className="text-sm text-gray-600">{t.dicomDesc}</div>
            </div>
            <input
              type="file"
              id="dicom-upload"
              accept=".zip"
              onChange={handleDicomImport}
              className="hidden"
            />
            <label
              htmlFor="dicom-upload"
              className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center cursor-pointer"
            >
              Select DICOM ZIP File
            </label>
            {isCapturing && (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-purple-50 px-6 py-3 rounded-full"
                  data-testid="extracting-indicator"
                >
                  <span className="text-sm font-medium text-purple-900">{t.extracting}</span>
                </motion.div>
              </div>
            )}
            {uploadedFile && !isCapturing && (
              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3" data-testid="dicom-file-preview">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileArchive className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{documentData.fileName}</div>
                  <div className="text-sm text-gray-500">{documentData.fileSize} • {documentData.fileType}</div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          data-testid="button-retake-replace"
        >
          {sourceMethod === 'camera' ? t.retake : t.replace}
        </button>
        <button
          onClick={handleContinueFromCapture}
          disabled={isCapturing || isAnalyzing || (!uploadedFile && !capturedImage) || !!analysisError}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            !isCapturing && !isAnalyzing && (uploadedFile || capturedImage) && !analysisError
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="button-continue-step2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              {t.continue}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
      data-testid="wizard-step-3"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="button-back-step3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-step3-title">{t.editMetadata}</h1>
        </div>
        <p className="text-sm text-gray-600">{t.checkDetails}</p>
        {renderProgressIndicator()}
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.documentType}</label>
          <div className="flex flex-wrap gap-2" data-testid="document-type-selector">
            {(['lab', 'prescription', 'imaging', 'bill', 'other'] as DocumentType[]).map(type => (
              <button
                key={type}
                onClick={() => handleDocumentTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  documentData.documentType === type
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
                data-testid={`button-type-${type}`}
              >
                {t[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {documentData.ocrFields.map(field => (
            <div key={field.key} className="space-y-2" data-testid={`ocr-field-${field.key}`}>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'en' ? field.label : field.labelHi}
                </label>
                {field.confidence < 0.85 && (
                  <span className="text-xs text-amber-600 flex items-center gap-1" data-testid={`low-confidence-${field.key}`}>
                    <AlertCircle className="w-3 h-3" />
                    {t.lowConfidence}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={field.value}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  field.confidence < 0.85
                    ? 'border-amber-300 focus:ring-amber-500 bg-amber-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                data-testid={`input-${field.key}`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.tags}</label>
          <div className="flex flex-wrap gap-2" data-testid="tags-display">
            {documentData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
                data-testid={`tag-${index}`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          data-testid="button-back-to-step2"
        >
          {t.back}
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          data-testid="button-next-step3"
        >
          {t.next}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
      data-testid="wizard-step-4"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setCurrentStep(3)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="button-back-step4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-step4-title">{t.summary}</h1>
        </div>
        {renderProgressIndicator()}
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3" data-testid="offline-notice">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-900">{t.offline}</div>
              <div className="text-sm text-amber-700 mt-1">{t.savedLocally}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-testid="document-summary">
          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
            {documentData.preview || capturedImage ? (
              <img 
                src={documentData.preview || capturedImage || ''} 
                alt="Document preview" 
                className="w-full h-full object-contain" 
                onError={(e) => {
                  console.error('Preview image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-16 h-16 mb-2" />
                <span className="text-sm">No preview available</span>
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate" data-testid="text-file-name">{documentData.fileName}</div>
                <div className="text-sm text-gray-500" data-testid="text-file-info">
                  {documentData.fileSize} • {documentData.fileType}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t.documentType}:</span>
                <span className="font-medium text-gray-900" data-testid="text-summary-type">{t[documentData.documentType]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t.providerName}:</span>
                <span className="font-medium text-gray-900" data-testid="text-summary-provider">
                  {documentData.ocrFields.find(f => f.key === 'provider')?.value}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t.date}:</span>
                <span className="font-medium text-gray-900" data-testid="text-summary-date">
                  {documentData.ocrFields.find(f => f.key === 'date')?.value}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2" data-testid="summary-tags">
                {documentData.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          data-testid="button-back-to-step3"
        >
          {t.back}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          data-testid="button-save-document"
        >
          <Check className="w-4 h-4" />
          {t.save}
        </button>
      </div>
    </motion.div>
  );

  const renderSuccessModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
      data-testid="success-modal"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-success-title">{t.documentAdded}</h2>
        <p className="text-gray-600 mb-8" data-testid="text-success-message">{t.documentAddedDesc}</p>
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            data-testid="button-go-to-vault"
          >
            {t.goToVault}
          </button>
          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            data-testid="button-add-another"
          >
            {t.addAnother}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full h-screen max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto bg-white flex flex-col overflow-hidden" data-testid="wizard-container">
      <AnimatePresence mode="wait">
        {currentStep === 1 && <div key="step1" className="flex-1 flex flex-col overflow-hidden">{renderStep1()}</div>}
        {currentStep === 2 && <div key="step2" className="flex-1 flex flex-col overflow-hidden">{renderStep2()}</div>}
        {currentStep === 3 && <div key="step3" className="flex-1 flex flex-col overflow-hidden">{renderStep3()}</div>}
        {currentStep === 4 && <div key="step4" className="flex-1 flex flex-col overflow-hidden">{renderStep4()}</div>}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && renderSuccessModal()}
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsOnline(!isOnline)}
          className="p-2 bg-white rounded-full shadow-lg"
          aria-label="Toggle online status"
          data-testid="button-toggle-online"
        >
          {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-gray-400" />}
        </button>
      </div>
    </div>
  );
};
