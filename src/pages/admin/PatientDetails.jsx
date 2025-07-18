import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaUserMd,
  FaEdit,
  FaPrint,
  FaFilePdf,
  FaArrowLeft,
  FaInfoCircle,
  FaHistory,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaVenusMars,
  FaNotesMedical,
  FaHeartbeat,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaPills,
  FaAllergies,
  FaBirthdayCake,
  FaAddressCard,
  FaHospital,
  FaMoneyBillAlt,
  FaUserInjured,
  FaWeight,
  FaRulerVertical,
  FaPlus,
  FaFile,
  FaUpload,
  FaTrash,
  FaRupeeSign
} from 'react-icons/fa';
import patientService from '../../api/patients/patientService';
import appointmentService from '../../api/appointments/appointmentService';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import TreatmentHistory from '../../components/dental/TreatmentHistory';
import MedicalRecordsTab from '../../components/patient/MedicalRecordsTab';
import Modal from '../../components/ui/Modal';
import ExaminationFormModal from '../../components/patient/ExaminationFormModal';
import ExaminationList from '../../components/patient/ExaminationList';
import AppointmentList from '../../components/appointments/AppointmentList';
import DocumentUpload from '../../components/patients/DocumentUpload';
import DocumentList from '../../components/patients/DocumentList';
import billService from '../../api/billing/billService';
import dentalService from '../../api/dental/dentalService';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('patientDetailsActiveTab') || 'overview';
  });
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [newMedicalRecord, setNewMedicalRecord] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [examinations, setExaminations] = useState([]);
  const [examinationsLoading, setExaminationsLoading] = useState(false);
  const [showExaminationForm, setShowExaminationForm] = useState(false);
  const [editingExamination, setEditingExamination] = useState(null);
  const [examinationForm, setExaminationForm] = useState({
    vitals: {},
    chiefComplaint: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    examinationFindings: '',
    diagnosis: '',
    plan: '',
    notes: ''
  });
  const [examinationFormLoading, setExaminationFormLoading] = useState(false);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // Add state for showing upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dentalBills, setDentalBills] = useState([]);
  const [dentalBillsLoading, setDentalBillsLoading] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);

  // Calculate billing summary
  // Use real billing data from API (invoices array or flat array)
  const safeBillingRecords = Array.isArray(billingRecords?.invoices)
    ? billingRecords.invoices
    : Array.isArray(billingRecords)
      ? billingRecords
      : [];

  // Overall summary (all bills, not just dental)
  const totalTreatmentCost = safeBillingRecords.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalPaid = safeBillingRecords.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
  const totalBalance = totalTreatmentCost - totalPaid;

  // Dental summary (from real dental bills fetched via billService)
  const dentalTreatmentCost = dentalBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  const dentalPaid = dentalBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
  const dentalBalance = dentalBills.reduce((sum, bill) => sum + (bill.balanceAmount || (bill.totalAmount || 0) - (bill.paidAmount || 0)), 0);
  // For now, Billed = totalTreatmentCost, Billed Balance = totalBalance (can be customized if needed)

  // Calculate total treatment cost from treatments
  const totalTreatmentCostFromTreatments = treatments.reduce((sum, t) => sum + (t.cost || t.amount || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'medical', label: 'Medical Info', icon: <FaHeartbeat /> },
    { id: 'prescription', label: 'Prescription', icon: <FaPills /> },
    { id: 'treatment', label: 'Treatment', icon: <FaNotesMedical /> },
    { id: 'examination', label: 'Examination', icon: <FaClipboardList /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarCheck /> },
    { id: 'billing', label: 'Billing', icon: <FaFileInvoiceDollar /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> }
  ];

  // Load patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError('Patient ID is required');
          setLoading(false);
          return;
        }
        
        // Get the current user's role from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = userData?.role?.toLowerCase() || '';
        const isAdmin = userRole === 'admin';
        const isDoctor = userRole === 'doctor';
        const isStaff = userRole === 'staff';
        
        // Get the patient data
        const patientData = await patientService.getPatientById(id);
        
        // If there was an error fetching the patient data
        if (patientData?.error) {
          setError(patientData.message || 'Failed to load patient data');
          setLoading(false);
          // If it's a permission error, navigate back after a delay
          if (patientData.status === 403) {
            setTimeout(() => {
              navigate(-1);
            }, 3000);
          }
          return;
        }
        
        if (!patientData) {
          setError('Patient not found');
          setLoading(false);
          return;
        }
        
        console.log('Patient data received in details:', patientData);
        
        // Process profile image data if it exists
        if (patientData) {
          console.log('Processing patient profile image data...');
          
          // Case 1: No profileImage object but has profileImageUrl/publicId fields
          if (!patientData.profileImage && patientData.profileImageUrl) {
            console.log('Creating profileImage object from profileImageUrl field');
            patientData.profileImage = {
              url: patientData.profileImageUrl,
              secure_url: patientData.profileImageUrl, // Add secure_url for consistency
              publicId: patientData.profileImagePublicId || ''
            };
          }
          // Case 2: Has profileImage object but missing url (check for secure_url)
          else if (patientData.profileImage && !patientData.profileImage.url && patientData.profileImage.secure_url) {
            console.log('Using secure_url as the primary image URL');
            patientData.profileImage.url = patientData.profileImage.secure_url;
          }
          
          // Set profile image data for the form
          if (patientData.profileImage) {
            setProfileImageData({
              url: patientData.profileImage.secure_url || patientData.profileImage.url || '',
              publicId: patientData.profileImage.public_id || ''
            });
          }
        }
        
        setPatient(patientData);
        
        // Load additional data based on user role
        const loadPromises = [];
        
        // Medical Records - Only for admin and doctor
        if (isAdmin || isDoctor) {
          loadPromises.push((async () => {
            setMedicalRecordsLoading(true);
            try {
              const medicalRecordsData = await patientService.getMedicalHistory(id);
              setMedicalRecords(medicalRecordsData || []);
            } catch (err) {
              if (err.response?.status === 403) {
                console.log('Access denied to medical records');
              } else {
                console.error('Error loading medical records:', err);
              }
              setMedicalRecords([]);
            } finally {
              setMedicalRecordsLoading(false);
            }
          })());
        } else {
          setMedicalRecords([]);
        }
        
        // Appointments - Available for all roles
        loadPromises.push((async () => {
          setAppointmentsLoading(true);
          try {
            const appointmentsData = await patientService.getPatientAppointments(id);
            setAppointments(appointmentsData || []);
          } catch (err) {
            if (err.response?.status === 403) {
              console.log('Access denied to appointments');
            } else {
              console.error('Error loading appointments:', err);
            }
            setAppointments([]);
          } finally {
            setAppointmentsLoading(false);
          }
        })());
        
        // Documents - Only for admin and doctor
        if (isAdmin || isDoctor) {
          loadPromises.push((async () => {
            setDocumentsLoading(true);
            try {
              const documentsData = await patientService.getDocuments(id);
              if (documentsData.error) {
                console.error('Error loading documents:', documentsData.message);
                setDocuments([]);
              } else {
                setDocuments(documentsData || []);
              }
            } catch (err) {
              console.error('Error loading documents:', err);
              setDocuments([]);
            } finally {
              setDocumentsLoading(false);
            }
          })());
        } else {
          setDocuments([]);
        }
        
        // Billing - Only for admin and staff
        if (isAdmin || isStaff) {
          loadPromises.push((async () => {
            setBillingLoading(true);
            try {
              const billingData = await patientService.getBillingHistory(id);
              setBillingRecords(billingData || []);
            } catch (err) {
              if (err.response?.status === 403) {
                console.log('Access denied to billing records');
              } else {
                console.error('Error loading billing records:', err);
              }
              setBillingRecords([]);
            } finally {
              setBillingLoading(false);
            }
          })());
        } else {
          setBillingRecords([]);
        }
        
        // Wait for all data loading to complete
        await Promise.all(loadPromises);
        
      } catch (error) {
        console.error('Error loading patient data:', error);
        
        // Only show error toast for unexpected errors (not 403/404)
        if (!error.response || (error.response.status !== 403 && error.response.status !== 404)) {
          toast.error('Failed to load patient data. Please try again later.');
          
          // Only navigate away for critical errors
          if (error.response?.status >= 500) {
            setTimeout(() => {
              navigate('/admin/patients');
            }, 2000);
          }
        } else {
          // For permission-related errors, just log them
          console.log('Access restricted:', error.message);
        }
        
        // Log detailed error information for debugging
        console.debug('Detailed error information:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id, navigate]);

  // Load examinations
  useEffect(() => {
    if (activeTab === 'examination') {
      setExaminationsLoading(true);
      patientService.getExaminations(id)
        .then(data => setExaminations(data))
        .catch(() => setExaminations([]))
        .finally(() => setExaminationsLoading(false));
    }
  }, [activeTab, id]);

  // Load dental bills for the billing summary
  useEffect(() => {
    if (patient && patient._id) {
      setDentalBillsLoading(true);
      billService.getPatientBills(patient._id).then(res => {
        setDentalBills(Array.isArray(res.bills) ? res.bills : []);
        setDentalBillsLoading(false);
      }).catch(() => {
        setDentalBills([]);
        setDentalBillsLoading(false);
      });
    }
  }, [patient]);

  // Load treatments for the treatment summary
  useEffect(() => {
    if (patient && patient._id) {
      setTreatmentsLoading(true);
      dentalService.getPatientDentalTreatments(patient._id).then(data => {
        setTreatments(Array.isArray(data) ? data : []);
        setTreatmentsLoading(false);
      }).catch(() => {
        setTreatments([]);
        setTreatmentsLoading(false);
      });
    }
  }, [patient]);

  // Persist activeTab in localStorage
  useEffect(() => {
    localStorage.setItem('patientDetailsActiveTab', activeTab);
  }, [activeTab]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle edit patient
  const handleEdit = () => {
    navigate(`/admin/patients/edit/${id}`);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    toast.info('PDF export functionality coming soon');
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/patient-management?tab=patients');
  };

  // Handle add medical record
  const handleAddMedicalRecord = async (recordData) => {
    try {
      setMedicalRecordsLoading(true);
      const response = await patientService.addMedicalRecord(id, recordData);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      // Update the medical records list with the new record
      const newRecord = response.data || response;
      setMedicalRecords(prevRecords => {
        const currentRecords = Array.isArray(prevRecords) ? prevRecords : [];
        return [...currentRecords, newRecord];
      });
      
      toast.success('Medical record added successfully');
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast.error(error.message || 'Failed to add medical record');
    } finally {
      setMedicalRecordsLoading(false);
    }
  };

  // Handle document upload
  const handleUploadComplete = async () => {
    try {
      const documentsData = await patientService.getDocuments(id);
      setDocuments(documentsData);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error refreshing documents:', error);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const blob = await patientService.downloadDocument(id, documentId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `document-${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };
  
  // Handle delete medical record
  const handleDeleteMedicalRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await patientService.deleteMedicalRecord(id, recordId);
        
        // Update the medical records list by removing the deleted record
        setMedicalRecords(medicalRecords.filter((record) => 
          (record._id !== recordId && record.id !== recordId)
        ));
        
        toast.success('Medical record deleted successfully');
      } catch (error) {
        console.error('Error deleting medical record:', error);
        toast.error(error.response?.data?.message || 'Failed to delete medical record');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await patientService.getDocuments(id);
      
      if (result.error) {
        if (result.status === 403) {
          toast.error('You do not have permission to view documents. Please contact your administrator.');
          // Optionally redirect to a different page
          // navigate('/admin/dashboard');
        } else if (result.status === 401) {
          toast.error('Please log in again to continue');
          // Redirect to login
          navigate('/login');
        } else {
          toast.error(result.message || 'Failed to load documents');
        }
        setDocuments([]);
        return;
      }
      
      setDocuments(result);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for add/edit
  const handleAddExamination = () => {
    setEditingExamination(null);
    setExaminationForm({
      vitals: {},
      chiefComplaint: '',
      historyOfPresentIllness: '',
      pastMedicalHistory: '',
      examinationFindings: '',
      diagnosis: '',
      plan: '',
      notes: ''
    });
    setShowExaminationForm(true);
  };
  const handleEditExamination = (exam) => {
    setEditingExamination(exam);
    setExaminationForm({ ...exam });
    setShowExaminationForm(true);
  };
  const handleSaveExamination = async (formData) => {
    setExaminationFormLoading(true);
    if (editingExamination) {
      await patientService.updateExamination(editingExamination._id, formData);
    } else {
      await patientService.createExamination({ ...formData, patient: id });
    }
    setShowExaminationForm(false);
    setExaminationFormLoading(false);
    setExaminationsLoading(true);
    patientService.getExaminations(id)
      .then(data => setExaminations(data))
      .finally(() => setExaminationsLoading(false));
  };
  const handleDeleteExamination = async (examId) => {
    await patientService.deleteExamination(examId);
    setExaminationsLoading(true);
    patientService.getExaminations(id)
      .then(data => setExaminations(data))
      .finally(() => setExaminationsLoading(false));
  };

  // Handlers for AppointmentList actions
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailsModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailsModal(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        await appointmentService.deleteAppointment(appointmentId);
        setAppointments(appointments.filter(app => app._id !== appointmentId));
        setShowAppointmentDetailsModal(false);
        setSelectedAppointment(null);
        toast.success('Appointment deleted successfully');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // We no longer need to check for error state since we're using toast notifications
  // and redirecting to the patients page on error

  if (!patient) {
    return (
      <div className="p-6">
        <Alert type="error" className="mb-4">
          Patient not found
        </Alert>
        <Button
          variant="primary"
          onClick={handleBack}
          className="flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Patient Management
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={handleEdit}
            className="flex items-center"
          >
            <FaEdit className="mr-2" /> Edit
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center"
          >
            <FaFilePdf className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start p-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
            {/* Enhanced profile image handling with improved fallback and alternate URL support */}
            {patient.profileImage && (patient.profileImage.url || patient.profileImage.secure_url) ? (
              <img 
                key={`profile-img-${patient._id}-${Date.now()}`} // Force re-render on data change
                src={patient.profileImage.url || patient.profileImage.secure_url} 
                alt={(patient.firstName || '') + ' ' + (patient.lastName || patient.name || '')} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Primary profile image failed to load:', 
                    (patient.profileImage.url || patient.profileImage.secure_url).substring(0, 30) + '...');
                  
                  // Check if we have an alternate URL to try
                  const currentSrc = e.target.src;
                  const alternateSrc = currentSrc === patient.profileImage.url 
                    ? patient.profileImage.secure_url 
                    : patient.profileImage.url;
                  
                  if (alternateSrc && alternateSrc !== currentSrc) {
                    console.log('Trying alternate image URL:', alternateSrc.substring(0, 30) + '...');
                    e.target.onerror = (e2) => {
                      console.error('Alternate profile image also failed to load');
                      e2.target.style.display = 'none';
                      
                      // Show fallback icon after both URLs fail
                      const fallbackIcon = document.createElement('div');
                      fallbackIcon.className = 'text-gray-400 text-5xl flex items-center justify-center w-full h-full';
                      fallbackIcon.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>';
                      e2.target.parentNode.appendChild(fallbackIcon);
                    };
                    e.target.src = alternateSrc;
                  } else {
                    // No alternate URL available, show fallback immediately
                    e.target.style.display = 'none';
                    
                    // Show fallback icon
                    const fallbackIcon = document.createElement('div');
                    fallbackIcon.className = 'text-gray-400 text-5xl flex items-center justify-center w-full h-full';
                    fallbackIcon.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>';
                    e.target.parentNode.appendChild(fallbackIcon);
                  }
                }}
              />
            ) : patient.profileImageUrl ? (
              <img 
                key={`profile-img-url-${patient._id}-${Date.now()}`}
                src={patient.profileImageUrl} 
                alt={(patient.firstName || '') + ' ' + (patient.lastName || patient.name || '')} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Profile image URL failed to load:', patient.profileImageUrl.substring(0, 30) + '...');
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  
                  // Show fallback icon
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.className = 'text-gray-400 text-5xl flex items-center justify-center w-full h-full';
                  fallbackIcon.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>';
                  e.target.parentNode.appendChild(fallbackIcon);
                }}
              />
            ) : (
              <FaUser className="text-gray-400 text-5xl" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800 mr-2">
                {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}
              </h2>
              <div className="flex items-center justify-center md:justify-start mt-2 md:mt-0">
                <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${
                  patient.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  patient.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {patient.status === 'Active' ? <FaCheckCircle className="mr-1" /> : <FaExclamationTriangle className="mr-1" />}
                  {patient.status || 'Active'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-4">
              <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0 md:mr-4">
                <FaIdCard className="text-indigo-600 mr-1" />
                <span>ID: {patient.patientId || patient._id}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center md:justify-start">
                <FaEnvelope className="text-blue-500 mr-2" />
                <span>{patient.email || 'No email'}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <FaPhone className="text-green-500 mr-2" />
                <span>{patient.phone || 'No phone number'}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <FaCalendarAlt className="text-orange-500 mr-2" />
                <span>DOB: {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not provided'}</span>
              </div>
            </div>
          </div>
          {/* Billing Summary Card */}
          <div className="w-full md:w-80 mt-6 md:mt-0 md:ml-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg shadow p-2 flex flex-col items-center min-h-0">
              <div className="text-base font-semibold text-gray-700 mb-1 flex items-center">
                <FaFileInvoiceDollar className="mr-2 text-indigo-500" /> Billing Summary
              </div>
              <div className="text-sm text-gray-800 mb-0.5">
                <span className="font-semibold">All Bills:</span>
              </div>
              <div className="text-xs text-gray-800 mb-0.5">
                Treatment Cost (from Treatments): <span className="font-bold text-blue-700">INR {totalTreatmentCostFromTreatments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs text-gray-800 mb-0.5">
                Paid: <span className="font-bold text-green-700">INR {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs text-gray-800 mb-2">
                Balance: <span className="font-bold text-red-700">INR {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full border-t border-blue-200 my-1"></div>
              <div className="text-sm text-gray-800 mb-0.5">
                <span className="font-semibold">Dental Bills:</span>
              </div>
              <div className="text-xs text-gray-800 mb-0.5">
                Treatment Cost: <span className="font-bold text-blue-700">INR {dentalTreatmentCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs text-gray-800 mb-0.5">
                Paid: <span className="font-bold text-green-700">INR {dentalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs text-gray-800">
                Balance: <span className="font-bold text-red-700">INR {dentalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Card className="mb-6 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="border-b border-gray-200" />
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2 text-blue-500" /> Personal Information
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-900">
                        {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">
                        {patient.dateOfBirth
                          ? formatDate(patient.dateOfBirth)
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-900">
                        {patient.gender || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="text-gray-900">
                        {patient.bloodType || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaAddressCard className="mr-2 text-green-500" /> Contact Information
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{patient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{patient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{patient.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Emergency Contact</p>
                      <p className="text-gray-900">
                        {patient.emergencyContact
                          ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}): ${patient.emergencyContact.phone}`
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Insurance Information */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFileInvoiceDollar className="mr-2 text-purple-500" /> Insurance Information
                  </h3>
                </div>
                <div className="p-4">
                  {patient.insurance ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="text-gray-900">{patient.insurance.provider || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="text-gray-900">{patient.insurance.policyNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Group Number</p>
                        <p className="text-gray-900">{patient.insurance.groupNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiration Date</p>
                        <p className="text-gray-900">
                          {patient.insurance.expirationDate
                            ? formatDate(patient.insurance.expirationDate)
                            : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <p>No insurance information available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaHeartbeat className="mr-2 text-red-500" /> Medical Records
                  </h3>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowMedicalRecordForm(true)}
                    className="flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Medical Record
                  </Button>
                </div>
                
                <div className="p-4">
                  {/* Medical Record Form */}
                  {showMedicalRecordForm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-medium text-blue-800 mb-4">Add New Medical Record</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleAddMedicalRecord(newMedicalRecord);
                        setShowMedicalRecordForm(false);
                        setNewMedicalRecord({
                          title: '',
                          description: '',
                          date: new Date().toISOString().split('T')[0],
                          notes: ''
                        });
                      }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newMedicalRecord.title}
                              onChange={(e) => setNewMedicalRecord({...newMedicalRecord, title: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newMedicalRecord.date}
                              onChange={(e) => setNewMedicalRecord({...newMedicalRecord, date: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            value={newMedicalRecord.description}
                            onChange={(e) => setNewMedicalRecord({...newMedicalRecord, description: e.target.value})}
                            required
                          ></textarea>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            value={newMedicalRecord.notes}
                            onChange={(e) => setNewMedicalRecord({...newMedicalRecord, notes: e.target.value})}
                          ></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowMedicalRecordForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                          >
                            Save Record
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Loading state for medical records */}
                  {medicalRecordsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                      <p className="ml-3 text-gray-600">Loading medical records...</p>
                    </div>
                  ) : medicalRecords && medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecords.map((record, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-medium">{record.title || 'Medical Record'}</h3>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {record.date ? formatDate(record.date) : 'No date'}
                              </span>
                              <button 
                                onClick={() => handleDeleteMedicalRecord(record._id || index)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete record"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-700">{record.description}</p>
                          {record.attachments && record.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-500">Attachments:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.attachments.map((attachment, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleDownloadDocument(attachment.id, attachment.name)}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                  >
                                    <FaFilePdf className="mr-1" /> {attachment.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <FaNotesMedical className="mx-auto text-gray-400 text-4xl mb-2" />
                      <p>No medical records available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prescription Tab */}
          {activeTab === 'prescription' && (
            <div>
              <PrescriptionList patientId={id} readOnly={false} />
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === 'treatment' && (
            <div>
              <TreatmentHistory patientId={id} />
            </div>
          )}

          {/* Examination Tab */}
          {activeTab === 'examination' && (
            <div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                onClick={() => navigate(`/admin/patient/${patient._id}/dental`)}
              >
                Dental Chart
              </button>
              <ExaminationList
                examinations={examinations}
                loading={examinationsLoading}
                onEdit={handleEditExamination}
                onDelete={handleDeleteExamination}
              />
              <ExaminationFormModal
                isOpen={showExaminationForm}
                onClose={() => setShowExaminationForm(false)}
                initialData={editingExamination}
                onSubmit={handleSaveExamination}
                loading={examinationFormLoading}
              />
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> Appointment History
                  </h3>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/admin/appointment-management?patientId=${id}`)}
                    className="flex items-center"
                  >
                    <FaPlus className="mr-2" /> Book Appointment
                  </Button>
                </div>
                <div className="p-4">
                  <AppointmentList
                    appointments={appointments}
                    onView={handleViewAppointment}
                    onEdit={handleEditAppointment}
                    onDelete={appointment => handleDeleteAppointment(appointment._id)}
                    userRole="Admin"
                  />
                  {selectedAppointment && (
                    <AppointmentDetailsModal
                      isOpen={showAppointmentDetailsModal}
                      onClose={() => {
                        setShowAppointmentDetailsModal(false);
                        setSelectedAppointment(null);
                      }}
                      appointment={selectedAppointment}
                      onEdit={handleEditAppointment}
                      onDelete={appointment => handleDeleteAppointment(appointment._id)}
                      userRole="Admin"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFileInvoiceDollar className="mr-2 text-green-500" /> Billing Information
                  </h3>
                </div>
                <div className="p-4">
                  {billingLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                      <p className="ml-3 text-gray-600">Loading billing records...</p>
                    </div>
                  ) : billingRecords && billingRecords.length > 0 ? (
                    <div className="space-y-4">
                      {billingRecords.map((bill, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Invoice #</p>
                              <p className="text-gray-900">{bill.invoiceNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="text-gray-900">{formatDate(bill.date)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Amount</p>
                              <p className="text-gray-900">${bill.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-gray-900">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                  bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {bill.status}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <FaFileInvoiceDollar className="mx-auto text-gray-400 text-4xl mb-2" />
                      <p>No billing records available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFile className="mr-2 text-blue-500" /> Documents
                  </h3>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center"
                  >
                    <FaUpload className="mr-2" /> Upload Document
                  </Button>
                </div>
                <div className="p-4">
                  <DocumentList patientId={id} onDocumentDelete={handleUploadComplete} />
                </div>
              </div>
              {/* Upload Modal */}
              {showUploadModal && (
                <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Document">
                  <DocumentUpload patientId={id} onUploadComplete={() => { setShowUploadModal(false); handleUploadComplete(); }} />
                </Modal>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientDetails;
