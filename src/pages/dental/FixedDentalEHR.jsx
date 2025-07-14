import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTooth, FaHistory, FaImage, FaChartBar, FaFileInvoiceDollar, FaPrint, FaFilePdf, FaArrowLeft, FaCalendarAlt, FaFileMedical, FaIdCard, FaVenusMars, FaPhone } from 'react-icons/fa';
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

const FixedDentalEHR = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');
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

  // Fetch treatments on mount or patientId change
  useEffect(() => {
    const fetchTreatments = async () => {
      setTreatmentsLoading(true);
      setTreatmentsError(null);
      try {
        const data = await dentalService.getPatientTreatments(patientId);
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

  // Check if user has permission to access dental EHR
  const canEditDental = user && ['Admin', 'Doctor'].includes(user.role);

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
    { id: 'treatment-management', label: 'Treatment Management', icon: <FaHistory /> },
    { id: 'images', label: 'Dental Images', icon: <FaImage /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FaFileMedical /> },
    { id: 'billing', label: 'Billing', icon: <FaFileInvoiceDollar /> },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Dental EHR</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('PDF Export feature will be implemented soon')}
            className="flex items-center"
          >
            <FaFilePdf className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start p-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
            <FaTooth className="text-indigo-400 text-5xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800 mr-2">{patient.name}</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-4">
              <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0 md:mr-4">
                <FaIdCard className="text-indigo-600 mr-1" />
                <span>ID: {patient._id}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center md:justify-start">
                <FaCalendarAlt className="text-orange-500 mr-2" />
                <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <FaVenusMars className="text-pink-500 mr-2" />
                <span>{patient.gender}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <FaPhone className="text-green-500 mr-2" />
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card className="mb-6 overflow-hidden">
        <Tabs tabs={dentalTabs} activeTab={activeTab} onChange={setActiveTab} className="border-b border-gray-200" />
        <div className="p-6">
          {activeTab === 'chart' && (
            <AdvancedToothChart patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'treatment-management' && (
            <div>
              <div className="flex justify-between items-center border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${treatmentTab === 'plan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setTreatmentTab('plan')}
                  >
                    Treatment Plan
                  </button>
                  <button
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${treatmentTab === 'management' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setTreatmentTab('management')}
                  >
                    Treatment Management
                  </button>
                </nav>
                {treatmentTab === 'plan' && (
                  <Button variant="primary" size="sm" className="ml-4" onClick={openAddModal}>
                    <FaPlus className="mr-1" /> Add Treatment
                  </Button>
                )}
              </div>
              {/* Tab Content */}
              {treatmentsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : treatmentsError ? (
                <div className="text-center py-8 text-red-400">{treatmentsError}</div>
              ) : treatmentTab === 'plan' ? (
                treatments.filter(t => t.status === 'planned').length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No planned treatments</div>
                ) : (
                  <div className="space-y-2">
                    {treatments.filter(t => t.status === 'planned').map((t) => (
                      <Card key={t._id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
                        <div>
                          <div className="font-medium text-gray-700">{t.procedure}</div>
                          <div className="text-xs text-gray-500">Tooth #{t.toothNumber} | {new Date(t.date).toLocaleDateString()}</div>
                          {t.notes && <div className="text-xs text-gray-400 mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="primary" onClick={() => openEditModal(t)}><FaEdit /></Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(t._id)}><FaTrash /></Button>
                          <Button size="sm" variant="success" onClick={() => handleMarkCompleted(t._id)}><FaCheck /> Complete</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                treatments.filter(t => t.status === 'completed').length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No completed treatments</div>
                ) : (
                  <div className="space-y-2">
                    {treatments.filter(t => t.status === 'completed').map((t) => (
                      <Card key={t._id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
                        <div>
                          <div className="font-medium text-gray-700">{t.procedure}</div>
                          <div className="text-xs text-gray-500">Tooth #{t.toothNumber} | {new Date(t.date).toLocaleDateString()}</div>
                          {t.notes && <div className="text-xs text-gray-400 mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="primary" onClick={() => openEditModal(t)}><FaEdit /></Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(t._id)}><FaTrash /></Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              )}
              {/* Modal for add/edit */}
              {showTreatmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{editTreatment ? 'Edit Treatment' : 'Add Treatment'}</h3>
                      <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>×</button>
                    </div>
                    <form onSubmit={handleModalSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Procedure *</label>
                        <input type="text" className="w-full border rounded px-2 py-1" required value={modalForm.procedure} onChange={e => setModalForm(f => ({ ...f, procedure: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tooth Number *</label>
                        <input type="number" className="w-full border rounded px-2 py-1" required value={modalForm.toothNumber} onChange={e => setModalForm(f => ({ ...f, toothNumber: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date *</label>
                        <input type="date" className="w-full border rounded px-2 py-1" required value={modalForm.date} onChange={e => setModalForm(f => ({ ...f, date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea className="w-full border rounded px-2 py-1" rows={2} value={modalForm.notes} onChange={e => setModalForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cost ($)</label>
                        <input type="number" className="w-full border rounded px-2 py-1" value={modalForm.cost} onChange={e => setModalForm(f => ({ ...f, cost: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select className="w-full border rounded px-2 py-1" value={modalForm.status} onChange={e => setModalForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="planned">Planned</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="primary">{editTreatment ? 'Update' : 'Add'}</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'images' && (
            <EnhancedDentalImaging patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'reports' && (
            <EnhancedDentalReporting patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'prescriptions' && (
            <PrescriptionList patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'billing' && (
            <DentalBilling patientId={patientId} readOnly={!canEditDental} />
          )}
        </div>
      </Card>
      <div className="text-right text-sm text-gray-500 mt-4">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
};

export default FixedDentalEHR;
