import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFileMedical, FaEye, FaPrint, FaEdit, 
  FaTrash, FaSearch, FaFilter, FaSortAmountDown, FaChevronDown, FaPlus 
} from 'react-icons/fa';
import prescriptionService from '../../api/prescriptions/prescriptionService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../api/medicineService';
import MedicineFormModal from '../medicine/MedicineFormModal';
import staffService from '../../api/staff/staffService';

const PrescriptionList = ({ patientId, readOnly = false }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    doctor: user?.name || '',
    diagnosis: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ],
  });
  const [medicines, setMedicines] = useState([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  useEffect(() => {
    setMedicinesLoading(true);
    medicineService.getMedicines({ limit: 100 }).then(res => {
      setMedicines(Array.isArray(res) ? res : res.data || []);
      setMedicinesLoading(false);
    }).catch(() => setMedicinesLoading(false));
  }, []);

  useEffect(() => {
    setDoctorsLoading(true);
    staffService.getStaff({ role: 'Doctor', status: 'Active', limit: 100 }).then(res => {
      setDoctors(Array.isArray(res) ? res : res.data || []);
      setDoctorsLoading(false);
    }).catch(() => setDoctorsLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getPatientPrescriptions(patientId);
      setPrescriptions(data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionService.deletePrescription(id);
        toast.success('Prescription deleted successfully');
        fetchPrescriptions();
      } catch (error) {
        toast.error('Failed to delete prescription');
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const handlePrintPrescription = (prescription) => {
    // Create a printable version of the prescription
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription #${prescription.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
            }
            .prescription-details {
              margin-bottom: 20px;
            }
            .prescription-details p {
              margin: 5px 0;
            }
            .medications {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .medications th, .medications td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .medications th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              text-align: right;
            }
            .doctor-signature {
              margin-top: 60px;
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              float: right;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dental Clinic Prescription</h1>
            <p>123 Dental Street, Cityville, State 12345</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          
          <div class="prescription-details">
            <p><strong>Prescription #:</strong> ${prescription.id}</p>
            <p><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
            <p><strong>Patient ID:</strong> ${prescription.patientId}</p>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
          </div>
          
          <h3>Medications</h3>
          <table class="medications">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications.map(med => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.quantity}</td>
                  <td>${med.instructions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div class="doctor-signature">
              <p>${prescription.doctorName}</p>
              <p>Doctor's Signature</p>
            </div>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Prescription</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Update doctor dropdown to store both name and _id
  const handleFormChange = (e, idx) => {
    const { name, value } = e.target;
    if (name === 'doctor') {
      // Find selected doctor object
      const selected = doctors.find(doc => doc.name === value);
      setForm(f => ({ ...f, doctor: value, doctorId: selected?._id || '' }));
      return;
    }
    if (name.startsWith('medication.')) {
      const field = name.split('.')[1];
      setForm(f => {
        const meds = [...f.medications];
        meds[idx][field] = value;
        return { ...f, medications: meds };
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAddMedication = () => {
    setForm(f => ({
      ...f,
      medications: [
        ...f.medications,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    }));
  };

  const handleRemoveMedication = (idx) => {
    setForm(f => ({
      ...f,
      medications: f.medications.filter((_, i) => i !== idx)
    }));
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      doctor: user?.name || '',
      diagnosis: '',
      medications: [
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ],
    });
    setEditId(null);
  };

  const handleFormSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        patientId,
        doctorId: form.doctorId || (doctors.find(doc => doc.name === form.doctor)?._id),
      };
      if (editId) {
        await prescriptionService.updatePrescription(editId, payload);
        toast.success('Prescription updated successfully');
      } else {
        await prescriptionService.createPrescription(payload);
        toast.success('Prescription added successfully');
      }
      setShowAddForm(false);
      setEditId(null);
      fetchPrescriptions();
    } catch (error) {
      toast.error('Failed to save prescription');
      console.error('Error saving prescription:', error);
    }
  };

  const handleEditPrescription = (prescription) => {
    setForm({
      date: prescription.date ? new Date(prescription.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      doctor: (() => {
        // Try to find doctor by _id or name
        if (prescription.doctorId) {
          const doc = doctors.find(d => d._id === (prescription.doctorId._id || prescription.doctorId) || d.name === prescription.doctor);
          return doc ? doc.name : '';
        }
        return prescription.doctor || '';
      })(),
      doctorId: prescription.doctorId?._id || prescription.doctorId || '',
      diagnosis: prescription.diagnosis || '',
      medications: (prescription.medications && prescription.medications.length > 0)
        ? prescription.medications.map(med => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            instructions: med.instructions || '',
            quantity: med.quantity || ''
          }))
        : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: '' }],
    });
    setEditId(prescription._id || prescription.id);
    setShowAddForm(true);
  };

  const handleMedicineAdded = () => {
    setShowMedicineModal(false);
    setMedicinesLoading(true);
    medicineService.getMedicines({ limit: 100 }).then(res => {
      setMedicines(Array.isArray(res) ? res : res.data || []);
      setMedicinesLoading(false);
    }).catch(() => setMedicinesLoading(false));
  };

  const FREQUENCY_OPTIONS = [
    '', '0-0-1', '0-1-0', '0-1-1', '1-0-1', '1-1-0', '1-1-1', 'Other'
  ];
  const DURATION_OPTIONS = [
    '', '3 days', '5 days', '7 days', '10 days', '14 days', 'Ongoing', 'Other'
  ];
  const DOSAGE_OPTIONS = ['', '250mg', '500mg', '1g', '5ml', '10ml', 'Other'];
  const INSTRUCTIONS_OPTIONS = ['', 'After food', 'Before food', 'With water', 'At bedtime', 'Other'];

  // Filter and sort prescriptions
  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      // Filter by search term
      const searchMatch = 
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filter by status
      const statusMatch = 
        filterStatus === 'all' || 
        prescription.status === filterStatus;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      
      {showAddForm && (
        <form onSubmit={handleFormSave} className="bg-white border border-blue-100 rounded-lg p-6 mb-6 shadow-md animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
              />
            </div>
            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis</label>
              <input
                type="text"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleFormChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
              />
            </div>
            {/* Doctor Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Doctor</label>
              <select
                name="doctor"
                value={form.doctor}
                onChange={handleFormChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                required
              >
                <option value="">Select Doctor</option>
                {doctorsLoading ? (
                  <option>Loading...</option>
                ) : (
                  doctors.map(doc => (
                    <option key={doc._id} value={doc.name}>{doc.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">Medications</label>
            {form.medications.map((med, idx) => (
              <div key={med._id || idx} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 mb-4 items-end border-b pb-4">
                {/* Name Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className='text-red-500'>*</span></label>
                  <select
                    name="medication.name"
                    value={med.name}
                    onChange={e => handleFormChange(e, idx)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                    required
                    disabled={medicinesLoading}
                  >
                    <option value="">{medicinesLoading ? 'Loading...' : 'Select Medicine'}</option>
                    {medicines.map(medObj => (
                      <option key={medObj._id || medObj.name} value={medObj.name}>{medObj.name}</option>
                    ))}
                  </select>
                </div>
                {/* Dosage Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                  <select
                    name="medication.dosage"
                    value={med.dosage}
                    onChange={e => handleFormChange(e, idx)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                  >
                    {DOSAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select'}</option>)}
                  </select>
                  {med.dosage === 'Other' && (
                    <input
                      type="text"
                      name="medication.dosage"
                      value={med.dosageCustom || ''}
                      onChange={e => handleFormChange(e, idx)}
                      className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2 mt-2"
                      placeholder="Enter custom dosage"
                      required
                    />
                  )}
                </div>
                {/* Frequency Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    name="medication.frequency"
                    value={med.frequency}
                    onChange={e => handleFormChange(e, idx)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                  >
                    {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select'}</option>)}
                  </select>
                  {med.frequency === 'Other' && (
                    <input
                      type="text"
                      name="medication.frequency"
                      value={med.frequencyCustom || ''}
                      onChange={e => handleFormChange(e, idx)}
                      className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2 mt-2"
                      placeholder="Enter custom frequency"
                      required
                    />
                  )}
                </div>
                {/* Duration Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    name="medication.duration"
                    value={med.duration}
                    onChange={e => handleFormChange(e, idx)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                  >
                    {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select'}</option>)}
                  </select>
                  {med.duration === 'Other' && (
                    <input
                      type="text"
                      name="medication.duration"
                      value={med.durationCustom || ''}
                      onChange={e => handleFormChange(e, idx)}
                      className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2 mt-2"
                      placeholder="Enter custom duration"
                      required
                    />
                  )}
                </div>
                {/* Instructions Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                  <select
                    name="medication.instructions"
                    value={med.instructions}
                    onChange={e => handleFormChange(e, idx)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2"
                  >
                    {INSTRUCTIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select'}</option>)}
                  </select>
                  {med.instructions === 'Other' && (
                    <input
                      type="text"
                      name="medication.instructions"
                      value={med.instructionsCustom || ''}
                      onChange={e => handleFormChange(e, idx)}
                      className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2 mt-2"
                      placeholder="Enter custom instructions"
                      required
                    />
                  )}
                </div>
                {/* Remove Button as last column */}
                <div className="flex items-center justify-center w-10 min-w-0 p-0 m-0">
                  {form.medications.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1 rounded-full focus:outline-none"
                      onClick={() => handleRemoveMedication(idx)}
                      title="Remove Medication"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!medicinesLoading && medicines.length === 0 && (
              <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded p-3 mt-2 mb-4">
                <span className="text-yellow-700 text-sm">No medicines available. Add medicine.</span>
                <button
                  type="button"
                  className="btn-primary-gradient text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition ml-4"
                  onClick={() => setShowMedicineModal(true)}
                >
                  + Add Medicine
                </button>
              </div>
            )}
            {form.medications.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="btn-primary-gradient text-white px-6 py-2 rounded font-semibold shadow hover:scale-105 transition"
                  onClick={handleAddMedication}
                >
                  + Add More
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2 items-center">
            {medicines.length > 0 && (
              <button
                type="button"
                className="btn-primary-gradient text-white px-6 py-2 rounded font-semibold shadow hover:scale-105 transition"
                onClick={() => setShowMedicineModal(true)}
              >
                + Add Medicine
              </button>
            )}
            <div className="flex gap-2">
              <button type="button" className="bg-gray-200 text-gray-700 px-5 py-2 rounded font-semibold hover:bg-gray-300" onClick={handleFormCancel}>Cancel</button>
              <button type="submit" className="btn-primary-gradient text-white px-6 py-2 rounded font-semibold shadow hover:scale-105 transition">Save</button>
            </div>
          </div>
        </form>
      )}
      {showMedicineModal && (
        <MedicineFormModal
          isOpen={showMedicineModal}
          onClose={() => setShowMedicineModal(false)}
          onSubmit={handleMedicineAdded}
        />
      )}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaFileMedical className="mr-2 text-blue-500" /> Prescriptions
        </h3>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
          <div className="flex flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search prescriptions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </div>
            {/* Add Prescription Button */}
            {!readOnly && (
              <button
                type="button"
                className="bg-indigo-600 text-white rounded-md px-5 py-2 font-semibold shadow flex items-center gap-2 hover:bg-indigo-700 focus:outline-none ml-2"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus className="w-4 h-4" />
                Add Prescription
              </button>
            )}
          </div>
          {/* Status Dropdown and Sort Button remain as is */}
          <div className="relative ml-2" ref={statusDropdownRef}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center min-w-[120px] justify-between"
              onClick={() => setShowStatusDropdown((v) => !v)}
              type="button"
            >
              <FaFilter className="mr-2" />
              {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              <FaChevronDown className="ml-2" />
            </Button>
            {showStatusDropdown && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'all' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('all'); setShowStatusDropdown(false); }}
                >
                  All Status
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'active' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('active'); setShowStatusDropdown(false); }}
                >
                  Active
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'completed' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('completed'); setShowStatusDropdown(false); }}
                >
                  Completed
                </button>
              </div>
            )}
          </div>
          {/* Sort Button */}
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center ml-2"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <FaSortAmountDown className="mr-1" />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>
        </div>
      </div>
      <div className="p-4">
        {/* Prescription List Table or Cards */}
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No prescriptions found</td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription._id || prescription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{new Date(prescription.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{
  prescription.doctorName ||
  (prescription.doctorId && doctors.find(doc => doc._id === (prescription.doctorId._id || prescription.doctorId))?.name) ||
  prescription.doctor || 'N/A'
}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{prescription.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ul className="space-y-1">
                          {prescription.medications && prescription.medications.length > 0 ? (
                            prescription.medications.map((med, idx) => (
                              <li key={med._id || idx} className="flex flex-col md:flex-row md:items-center md:space-x-4 text-xs text-gray-700 bg-gray-50 rounded p-2 mb-1">
                                <span className="font-semibold">{med.name}</span>
                                <span>Dosage: {med.dosage}</span>
                                <span>Frequency: {med.frequency}</span>
                                <span>Duration: {med.duration}</span>
                                <span>Instructions: {med.instructions}</span>
                              </li>
                            ))
                          ) : (
                            <span className="text-gray-400">No medications</span>
                          )}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditPrescription(prescription)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                            title="Edit Prescription"
                          >
                            <FaEdit size={16} />
                            <span className="ml-1 hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription._id || prescription.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                            title="Delete Prescription"
                          >
                            <FaTrash size={16} />
                            <span className="ml-1 hidden sm:inline">Delete</span>
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
      </div>
      {/* Remove: PrescriptionForm Modal */}
      {/* Remove: {showFormModal && ( */}
      {/* Remove:   <PrescriptionForm */}
      {/* Remove:     isOpen={showFormModal} */}
      {/* Remove:     onClose={() => setShowFormModal(false)} */}
      {/* Remove:     initialData={editingPrescription} */}
      {/* Remove:     onSubmit={handleFormSubmit} */}
      {/* Remove:     loading={loading} */}
      {/* Remove:   /> */}
      {/* Remove: )} */}
    </Card>
  );
};

export default PrescriptionList;
