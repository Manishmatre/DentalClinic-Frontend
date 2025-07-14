import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSave, FaPlus, FaTrash, FaTimes, FaArrowLeft, 
  FaFileMedical, FaSearch, FaExclamationTriangle 
} from 'react-icons/fa';
import prescriptionService, { 
  COMMON_DENTAL_MEDICATIONS, 
  COMMON_DENTAL_DIAGNOSES 
} from '../../api/prescriptions/prescriptionService';
import patientService from '../../api/patients/patientService';
import { useAuth } from '../../context/AuthContext';

const PrescriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isEditMode = !!id;
  
  // Get patientId from URL query params if creating a new prescription
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    doctorId: user?.id || '',
    doctorName: user?.name || '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    medications: [],
    status: 'active'
  });
  
  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [patientInfo, setPatientInfo] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationFormData, setMedicationFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 0
  });
  const [editingMedicationIndex, setEditingMedicationIndex] = useState(-1);
  const [diagnosisSearchTerm, setDiagnosisSearchTerm] = useState('');
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const [medicationSearchTerm, setMedicationSearchTerm] = useState('');
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Load prescription data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchPrescription();
    }
  }, [id]);
  
  // Load patient info when patientId changes
  useEffect(() => {
    if (formData.patientId) {
      fetchPatientInfo();
    }
  }, [formData.patientId]);
  
  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getPrescriptionById(id);
      if (data) {
        setFormData(data);
      } else {
        toast.error('Prescription not found');
        navigate('/prescriptions');
      }
    } catch (error) {
      toast.error('Failed to load prescription');
      console.error('Error fetching prescription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPatientInfo = async () => {
    try {
      const data = await patientService.getPatientById(formData.patientId);
      setPatientInfo(data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'diagnosis') {
      setDiagnosisSearchTerm(value);
      setShowDiagnosisSuggestions(true);
    }
  };
  
  const handleMedicationInputChange = (e) => {
    const { name, value } = e.target;
    setMedicationFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'name') {
      setMedicationSearchTerm(value);
      setShowMedicationSuggestions(true);
    }
  };
  
  const handleAddMedication = () => {
    // Validate medication form
    if (!medicationFormData.name || !medicationFormData.dosage || !medicationFormData.frequency) {
      toast.error('Please fill in all required medication fields');
      return;
    }
    
    const newMedication = {
      ...medicationFormData,
      id: `temp-${Date.now()}`
    };
    
    if (editingMedicationIndex >= 0) {
      // Update existing medication
      const updatedMedications = [...formData.medications];
      updatedMedications[editingMedicationIndex] = newMedication;
      
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
      
      setEditingMedicationIndex(-1);
    } else {
      // Add new medication
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication]
      }));
    }
    
    // Reset medication form
    setMedicationFormData({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 0
    });
    
    setShowMedicationModal(false);
  };
  
  const handleEditMedication = (index) => {
    setMedicationFormData(formData.medications[index]);
    setEditingMedicationIndex(index);
    setShowMedicationModal(true);
  };
  
  const handleRemoveMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };
  
  const handleSelectDiagnosis = (diagnosis) => {
    setFormData(prev => ({
      ...prev,
      diagnosis
    }));
    setShowDiagnosisSuggestions(false);
  };
  
  const handleSelectMedication = (medication) => {
    setMedicationFormData(prev => ({
      ...prev,
      name: medication.name,
      dosage: medication.defaultDosage || '',
      frequency: medication.defaultFrequency || '',
      duration: medication.defaultDuration || ''
    }));
    setShowMedicationSuggestions(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.patientId || !formData.diagnosis || formData.medications.length === 0) {
      toast.error('Please fill in all required fields and add at least one medication');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await prescriptionService.updatePrescription(id, formData);
        toast.success('Prescription updated successfully');
      } else {
        const result = await prescriptionService.createPrescription(formData);
        toast.success('Prescription created successfully');
      }
      
      navigate(`/patients/${formData.patientId}/dental`);
    } catch (error) {
      toast.error('Failed to save prescription');
      console.error('Error saving prescription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter diagnoses based on search term
  const filteredDiagnoses = COMMON_DENTAL_DIAGNOSES.filter(diagnosis => 
    diagnosis.toLowerCase().includes(diagnosisSearchTerm.toLowerCase())
  );
  
  // Filter medications based on search term and category
  const filteredMedications = COMMON_DENTAL_MEDICATIONS
    .filter(category => !selectedCategory || category.category === selectedCategory)
    .flatMap(category => 
      category.medications.filter(med => 
        med.name.toLowerCase().includes(medicationSearchTerm.toLowerCase())
      )
    );
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaFileMedical className="mr-2 text-blue-500" />
          {isEditMode ? 'Edit Prescription' : 'New Prescription'}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-1" /> Back
        </button>
      </div>
      
      {patientInfo && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{patientInfo.firstName} {patientInfo.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID</p>
              <p className="font-medium">{patientInfo.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{patientInfo.phone}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter diagnosis"
              required
            />
            {showDiagnosisSuggestions && diagnosisSearchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredDiagnoses.length > 0 ? (
                  filteredDiagnoses.map((diagnosis, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectDiagnosis(diagnosis)}
                    >
                      {diagnosis}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Additional notes about the prescription"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Medications</h2>
            <button
              type="button"
              onClick={() => {
                setMedicationFormData({
                  name: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  instructions: '',
                  quantity: 0
                });
                setEditingMedicationIndex(-1);
                setShowMedicationModal(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center text-sm"
            >
              <FaPlus className="mr-1" /> Add Medication
            </button>
          </div>
          
          {formData.medications.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <FaExclamationTriangle className="text-yellow-500 text-3xl mx-auto mb-2" />
              <p className="text-gray-600">No medications added yet</p>
              <p className="text-sm text-gray-500 mt-1">Click "Add Medication" to prescribe medications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.medications.map((medication, index) => (
                    <tr key={medication.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{medication.name}</td>
                      <td className="px-4 py-2 text-sm">{medication.dosage}</td>
                      <td className="px-4 py-2 text-sm">{medication.frequency}</td>
                      <td className="px-4 py-2 text-sm">{medication.duration}</td>
                      <td className="px-4 py-2 text-sm">{medication.quantity}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="max-w-xs truncate" title={medication.instructions}>
                          {medication.instructions}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditMedication(index)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <FaPlus />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Save Prescription
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Medication Modal */}
      {showMedicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingMedicationIndex >= 0 ? 'Edit Medication' : 'Add Medication'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMedicationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-2 mb-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md p-2"
                >
                  <option value="">All Categories</option>
                  {COMMON_DENTAL_MEDICATIONS.map((category, index) => (
                    <option key={index} value={category.category}>
                      {category.category}
                    </option>
                  ))}
                </select>
                
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="name"
                    value={medicationFormData.name}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                    placeholder="Search medications..."
                    autoComplete="off"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              {showMedicationSuggestions && medicationSearchTerm && (
                <div className="border border-gray-300 rounded-md mb-4 max-h-40 overflow-y-auto">
                  {filteredMedications.length > 0 ? (
                    filteredMedications.map((medication, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectMedication(medication)}
                      >
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-xs text-gray-500">
                          {medication.defaultDosage}, {medication.defaultFrequency}, {medication.defaultDuration}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No matches found</div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={medicationFormData.name}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={medicationFormData.dosage}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="frequency"
                    value={medicationFormData.frequency}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={medicationFormData.duration}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 7 days"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={medicationFormData.quantity}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={medicationFormData.instructions}
                    onChange={handleMedicationInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Special instructions for taking this medication"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMedicationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                {editingMedicationIndex >= 0 ? 'Update' : 'Add'} Medication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
