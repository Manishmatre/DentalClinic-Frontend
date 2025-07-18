import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTooth, FaHistory, FaImage, FaChartBar, FaFileInvoiceDollar, FaPrint, FaFilePdf, FaArrowLeft, FaCalendarAlt, FaFileMedical, FaIdCard, FaVenusMars, FaPhone, FaSearch, FaFileExport } from 'react-icons/fa';
// Import enhanced components
import AdvancedToothChart from '../../components/dental/AdvancedToothChart';
import EnhancedDentalImaging from '../../components/dental/EnhancedDentalImaging';
import EnhancedDentalReporting from '../../components/dental/EnhancedDentalReporting';
import DentalBilling from '../../components/dental/DentalBilling';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import patientService from '../../api/patients/patientService';
import dentalService from '../../api/dental/dentalService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import TreatmentList from '../../components/dental/TreatmentList';

const FixedDentalEHR = (props) => {
  const { patientId: paramPatientId } = useParams();
  const patientId = props.patientId || paramPatientId;
  console.log('FixedDentalEHR patientId:', patientId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    // Try to restore from localStorage
    return localStorage.getItem('dentalEHRActiveTab') || 'chart';
  });
  const [treatmentTab, setTreatmentTab] = useState('plan'); // 'plan' or 'management'
  const [treatments, setTreatments] = useState([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [treatmentsError, setTreatmentsError] = useState(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [editTreatment, setEditTreatment] = useState(null);
  const [modalForm, setModalForm] = useState({
    procedure: '',
    toothNumber: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: '',
    status: 'planned',
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleDateString());

  // At the top of the component, add new state for search/filter/pagination/sort
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [treatmentStatusFilter, setTreatmentStatusFilter] = useState('all');
  const [treatmentApprovalFilter, setTreatmentApprovalFilter] = useState('all');
  const [treatmentSort, setTreatmentSort] = useState({ key: 'date', direction: 'desc' });
  const [treatmentsPerPage, setTreatmentsPerPage] = useState(10);
  const [treatmentsPage, setTreatmentsPage] = useState(1);

  // Filter, search, sort, and paginate treatments
  const filteredTreatments = treatments
    .filter(t => (t.patientApprovalStatus === 'approved' || t.status === 'completed'))
    .filter(t =>
      (!treatmentSearch ||
        t.procedure?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        t.doctor?.name?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        t.notes?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        String(t.toothNumber).includes(treatmentSearch)
      ) &&
      (treatmentStatusFilter === 'all' || t.status === treatmentStatusFilter) &&
      (treatmentApprovalFilter === 'all' || t.patientApprovalStatus === treatmentApprovalFilter)
    );
  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    let aValue = a[treatmentSort.key];
    let bValue = b[treatmentSort.key];
    if (treatmentSort.key === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    if (aValue < bValue) return treatmentSort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return treatmentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sortedTreatments.length / treatmentsPerPage);
  const paginatedTreatments = sortedTreatments.slice((treatmentsPage - 1) * treatmentsPerPage, treatmentsPage * treatmentsPerPage);

  // Export CSV data
  const csvData = sortedTreatments.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    'Tooth #': t.toothNumber,
    Procedure: t.procedure,
    Doctor: t.doctor?.name || t.doctor || '-',
    Cost: t.finalCost || t.cost || 0,
    Status: t.status,
    Approval: t.patientApprovalStatus,
    Notes: t.notes || ''
  }));

  // Fetch treatments on mount or patientId change
  useEffect(() => {
    const fetchTreatments = async () => {
      setTreatmentsLoading(true);
      setTreatmentsError(null);
      try {
        const data = await dentalService.getPatientDentalTreatments(patientId);
        setTreatments(data || []);
      } catch (err) {
        setTreatmentsError('Failed to load treatments');
      } finally {
        setTreatmentsLoading(false);
      }
    };
    if (patientId) fetchTreatments();
  }, [patientId]);

  // Modal handlers
  const openAddModal = () => {
    setEditTreatment(null);
    setModalForm({
      procedure: '',
      toothNumber: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      cost: '',
      status: 'planned',
    });
    setShowTreatmentModal(true);
  };
  const openEditModal = (t) => {
    setEditTreatment(t);
    setModalForm({
      procedure: t.procedure || '',
      toothNumber: t.toothNumber || '',
      date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: t.notes || '',
      cost: t.cost || '',
      status: t.status || 'planned',
    });
    setShowTreatmentModal(true);
  };
  const closeModal = () => {
    setShowTreatmentModal(false);
    setEditTreatment(null);
  };

  // Add or update treatment
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTreatment) {
        // Update logic (API endpoint needed)
        // For now, update locally
        setTreatments((prev) => prev.map((t) => t._id === editTreatment._id ? { ...editTreatment, ...modalForm } : t));
        toast.success('Treatment updated');
      } else {
        // Add logic
        const chartId = null; // You may need to fetch chartId if required
        const toothNumber = modalForm.toothNumber;
        const treatmentData = { ...modalForm };
        // If API available, use: await dentalService.addTreatment(chartId, toothNumber, treatmentData);
        setTreatments((prev) => [...prev, { ...treatmentData, _id: `local-${Date.now()}` }]);
        toast.success('Treatment added');
      }
      closeModal();
    } catch (err) {
      toast.error('Failed to save treatment');
    }
  };

  // Delete treatment
  const handleDelete = (id) => {
    setTreatments((prev) => prev.filter((t) => t._id !== id));
    toast.success('Treatment deleted');
  };

  // Mark as completed
  const handleMarkCompleted = (id) => {
    setTreatments((prev) => prev.map((t) => t._id === id ? { ...t, status: 'completed' } : t));
    toast.success('Marked as completed');
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatientById(patientId);
        setPatient(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient:', error);
        // Use mock data if API fails
        setPatient({
          _id: patientId,
          name: 'Demo Patient',
          email: 'patient@example.com',
          phone: '(123) 456-7890',
          gender: 'Male',
          dateOfBirth: new Date(1990, 0, 1).toISOString(),
          address: '123 Main St, Anytown, USA'
        });
        console.log('Using mock patient data for demo');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  // Persist activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dentalEHRActiveTab', activeTab);
  }, [activeTab]);

  // Check if user has permission to access dental EHR
  const canEditDental = user && ['Admin', 'Doctor'].includes(user.role);

  // Determine clinicId as a string for TreatmentList
  let clinicIdStr = null;
  if (user && user.clinicId) {
    clinicIdStr = typeof user.clinicId === 'object' ? user.clinicId._id || user.clinicId.id : user.clinicId;
  }
  if (!clinicIdStr) {
    const clinicData = localStorage.getItem('clinicData');
    if (clinicData) {
      try {
        const parsed = JSON.parse(clinicData);
        clinicIdStr = parsed._id || parsed.id;
      } catch {}
    }
  }
  console.log('DEBUG: user.clinicId:', user?.clinicId, 'clinicIdStr:', clinicIdStr);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Patient Not Found</h2>
        <p className="text-gray-600 mb-4">The patient you're looking for doesn't exist or you don't have permission to view their records.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const dentalTabs = [
    { id: 'chart', label: 'Tooth Chart', icon: <FaTooth /> },
    { id: 'treatment-management', label: 'Treatments', icon: <FaHistory /> },
    { id: 'images', label: 'Dental Images', icon: <FaImage /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
  ];

  return (
    <div className="p-0">
      <Card className="mb-6 overflow-hidden">
        <Tabs tabs={dentalTabs} activeTab={activeTab} onChange={setActiveTab} className="border-b border-gray-200" />
        <div className="p-6">
          {activeTab === 'chart' && (
            <AdvancedToothChart patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'treatment-management' && (
            <TreatmentList
              treatments={treatments}
              loading={treatmentsLoading}
              error={treatmentsError}
              onEdit={openEditModal}
              onDelete={handleDelete}
              patientId={patientId}
              clinicId={clinicIdStr}
            />
          )}
          {activeTab === 'images' && (
            <EnhancedDentalImaging patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'reports' && (
            <EnhancedDentalReporting patientId={patientId} readOnly={!canEditDental} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default FixedDentalEHR;
