import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaTooth, FaPlus, FaEdit, FaSave, FaUndo, FaPrint, 
  FaChild, FaUser, FaExchangeAlt, FaInfoCircle, FaTimes 
} from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
import staffService from '../../api/staff/staffService.js.new';
import ToothSvg from './ToothSvg';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TOOTH_CONDITIONS } from '../../constants/dentalConstants';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { useAuth } from '../../hooks/useAuth';

// Tooth type mapping - which teeth are molars, premolars, etc.
const TOOTH_TYPES = {
  // Universal numbering (adult)
  'adult': {
    'molars': [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32],
    'premolars': [4, 5, 12, 13, 20, 21, 28, 29],
    'canines': [6, 11, 22, 27],
    'incisors': [7, 8, 9, 10, 23, 24, 25, 26]
  },
  // Primary dentition
  'pediatric': {
    'molars': ['A', 'B', 'I', 'J', 'K', 'L', 'S', 'T'],
    'canines': ['C', 'H', 'M', 'R'],
    'incisors': ['D', 'E', 'F', 'G', 'N', 'O', 'P', 'Q']
  }
};

// Primary teeth mapping
const PRIMARY_TEETH = {
  'upper-right': ['A', 'B', 'C', 'D', 'E'],
  'upper-left': ['F', 'G', 'H', 'I', 'J'],
  'lower-left': ['K', 'L', 'M', 'N', 'O'],
  'lower-right': ['P', 'Q', 'R', 'S', 'T']
};

// Conversion between numbering systems
const UNIVERSAL_TO_FDI = {
  1: 18, 2: 17, 3: 16, 4: 15, 5: 14, 6: 13, 7: 12, 8: 11,
  9: 21, 10: 22, 11: 23, 12: 24, 13: 25, 14: 26, 15: 27, 16: 28,
  17: 38, 18: 37, 19: 36, 20: 35, 21: 34, 22: 33, 23: 32, 24: 31,
  25: 41, 26: 42, 27: 43, 28: 44, 29: 45, 30: 46, 31: 47, 32: 48
};

// Primary teeth conversion
const PRIMARY_TO_FDI = {
  'A': 55, 'B': 54, 'C': 53, 'D': 52, 'E': 51,
  'F': 61, 'G': 62, 'H': 63, 'I': 64, 'J': 65,
  'K': 75, 'L': 74, 'M': 73, 'N': 72, 'O': 71,
  'P': 81, 'Q': 82, 'R': 83, 'S': 84, 'T': 85
};

// Numbering systems
const NUMBERING_SYSTEMS = [
  { id: 'universal', name: 'Universal (1-32)' },
  { id: 'fdi', name: 'FDI/ISO (11-48)' },
  { id: 'palmer', name: 'Palmer Notation' }
];

// Tooth surfaces
const TOOTH_SURFACES = [
  { value: 'mesial', label: 'Mesial (M)', position: 'left' },
  { value: 'distal', label: 'Distal (D)', position: 'right' },
  { value: 'buccal', label: 'Buccal (B)', position: 'top' },
  { value: 'occlusal', label: 'Occlusal (O)', position: 'center' },
  { value: 'lingual', label: 'Lingual (L)', position: 'bottom' }
];

// 1. Add status options
const TOOTH_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdvancedToothChart = ({ patientId, readOnly = false }) => {
  // State for chart data
  const [chartData, setChartData] = useState(null);
  const [teethData, setTeethData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // State for tooth selection and editing
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('healthy');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [finalCost, setFinalCost] = useState('');
  
  // State for treatment management
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [procedure, setProcedure] = useState('');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  // 2. Add status state
  const [selectedStatus, setSelectedStatus] = useState('completed');
  
  // State for UI controls
  const [dentitionType, setDentitionType] = useState('adult'); // 'adult' or 'pediatric'
  const [numberingSystem, setNumberingSystem] = useState('universal');
  const [showLegend, setShowLegend] = useState(true);

  // State for dropdowns
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  // Static list of common dental treatments
  const TREATMENT_TYPES = [
    { value: 'filling', label: 'Filling' },
    { value: 'root_canal', label: 'Root Canal' },
    { value: 'crown', label: 'Crown' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'implant', label: 'Implant' },
    { value: 'veneer', label: 'Veneer' },
    { value: 'inlay_onlay', label: 'Inlay/Onlay' },
    { value: 'whitening', label: 'Whitening' },
    { value: 'braces', label: 'Braces' },
    { value: 'retainer', label: 'Retainer' },
    { value: 'fluoride', label: 'Fluoride Treatment' },
    { value: 'sealant', label: 'Sealant' },
    { value: 'denture', label: 'Denture' },
    { value: 'apicoectomy', label: 'Apicoectomy' },
    { value: 'gum_surgery', label: 'Gum Surgery' },
    { value: 'bone_graft', label: 'Bone Graft' },
    { value: 'sinus_lift', label: 'Sinus Lift' },
    { value: 'tmj_treatment', label: 'TMJ Treatment' },
    { value: 'night_guard', label: 'Night Guard' },
    { value: 'mouth_guard', label: 'Mouth Guard' },
    { value: 'space_maintainer', label: 'Space Maintainer' },
    { value: 'frenectomy', label: 'Frenectomy' },
    { value: 'pulpotomy', label: 'Pulpotomy' },
    { value: 'pulp_capping', label: 'Pulp Capping' },
    { value: 'orthodontic_consult', label: 'Orthodontic Consult' },
    { value: 'oral_surgery', label: 'Oral Surgery' },
    { value: 'other', label: 'Other' }
  ];
  const [selectedTreatmentType, setSelectedTreatmentType] = useState('');

  // State for treatment tabs
  const [treatmentTab, setTreatmentTab] = useState('plan'); // 'plan' or 'management'

  // Track which discount field was last changed
  const [lastDiscountInput, setLastDiscountInput] = useState(''); // 'percent' or 'amount'

  // Add state for discount method
  const [discountMethod, setDiscountMethod] = useState('percent'); // 'percent' or 'amount'

  // Fetch dental chart data
  useEffect(() => {
    fetchDentalChart();
  }, [patientId]);

  // Automatically calculate final cost when cost, discountPercent, or discountAmount changes
  useEffect(() => {
    let baseCost = parseFloat(cost) || 0;
    let percent = parseFloat(discountPercent) || 0;
    let amount = parseFloat(discountAmount) || 0;
    let discount = 0;
    if (discountMethod === 'percent') {
      discount = baseCost * (percent / 100);
      setDiscountAmount(discount.toFixed(2));
    } else {
      discount = amount;
      setDiscountPercent(baseCost > 0 ? ((amount / baseCost) * 100).toFixed(2) : '0');
    }
    let final = Math.max(0, baseCost - discount);
    setFinalCost(final.toFixed(2));
  }, [cost, discountPercent, discountAmount, discountMethod]);

  // Sync discountAmount when discountPercent changes (if last changed was percent)
  useEffect(() => {
    if (lastDiscountInput === 'percent') {
      const baseCost = parseFloat(cost) || 0;
      const percent = parseFloat(discountPercent) || 0;
      if (baseCost > 0 && percent >= 0) {
        setDiscountAmount(((baseCost * percent) / 100).toFixed(2));
      }
    }
  }, [discountPercent, cost]);

  // Sync discountPercent when discountAmount changes (if last changed was amount)
  useEffect(() => {
    if (lastDiscountInput === 'amount') {
      const baseCost = parseFloat(cost) || 0;
      const amount = parseFloat(discountAmount) || 0;
      if (baseCost > 0 && amount >= 0) {
        setDiscountPercent(((amount / baseCost) * 100).toFixed(2));
      }
    }
  }, [discountAmount, cost]);

  // Replace all treatment CRUD logic with DentalTreatment API
  // Fetch treatments for patient
  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const treatmentData = await dentalService.getPatientDentalTreatments(patientId);
      console.log('Fetched treatments:', treatmentData);
      setTreatmentHistory(Array.isArray(treatmentData) ? treatmentData : []);
    } catch (error) {
      console.error('Error fetching treatments:', error, error?.response);
      // Only show error toast if truly an exception, not just empty data
      if (error && error.response === undefined) {
        toast.error('Failed to load treatments');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when switching to management/plan tab
  useEffect(() => {
    if (treatmentTab === 'management' || treatmentTab === 'plan') {
      fetchTreatments();
    }
  }, [treatmentTab, patientId]);

  // Add new treatment (plan or completed)
  const handleAddTreatment = async () => {
    if (!procedure || !treatmentDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const treatmentData = {
        clinicId: chartData.clinicId,
        patientId: chartData.patientId,
        chartId: chartData._id,
        toothNumber: selectedTooth,
        procedure,
        doctor: selectedDoctor,
        date: treatmentDate,
        cost: parseFloat(cost) || 0,
        discountPercent: parseFloat(discountPercent) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        finalCost: parseFloat(finalCost) || 0,
        status: selectedStatus,
        notes: treatmentNotes,
        treatmentType: selectedTreatmentType,
        patientApprovalStatus: 'pending',
      };
      await dentalService.createTreatment(treatmentData);
      toast.success('Treatment added successfully');
      setShowTreatmentModal(false);
      setProcedure('');
      setTreatmentDate(new Date().toISOString().split('T')[0]);
      setTreatmentNotes('');
      setCost('');
      setDiscountPercent('');
      setDiscountAmount('');
      setFinalCost('');
      setSelectedStatus('completed');
      // Refresh treatments
      fetchTreatments();
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error('Failed to add treatment');
    }
  };

  // Delete treatment
  const handleDeleteTreatment = async (id) => {
    try {
      await dentalService.deleteTreatment(id);
      toast.success('Treatment deleted');
      fetchTreatments();
    } catch (error) {
      console.error('Error deleting treatment:', error);
      toast.error('Failed to delete treatment');
    }
  };

  // Fetch dental chart data function
  const fetchDentalChart = async () => {
    try {
      setLoading(true);
      // Try to get data from API
      try {
        const { chart, teeth } = await dentalService.getPatientDentalChart(patientId);
        setChartData(chart);
        // Initialize teeth data
        const teethObj = {};
        for (let i = 1; i <= 32; i++) {
          teethObj[i] = teeth && teeth[i]
            ? teeth[i]
            : { condition: 'healthy', surfaces: [], notes: '', status: 'completed' };
        }
        setTeethData(teethObj);
        // Also fetch treatment history
        const treatmentData = await dentalService.getPatientTreatments(patientId);
        setTreatmentHistory(treatmentData || []);
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Initialize with mock data for demo
        const teethObj = {};
        for (let i = 1; i <= 32; i++) {
          teethObj[i] = { condition: 'healthy', surfaces: [], notes: '', status: 'completed' };
        }
        // Add some demo data
        teethObj[3] = { condition: 'filled', surfaces: ['occlusal'], notes: 'Composite filling' };
        teethObj[14] = { condition: 'crown', surfaces: [], notes: 'Full ceramic crown' };
        teethObj[19] = { condition: 'caries', surfaces: ['mesial', 'occlusal'], notes: 'Needs treatment' };
        teethObj[30] = { condition: 'root-canal', surfaces: [], notes: 'Root canal treatment completed 2024-04-15' };
        setTeethData(teethObj);
        setChartData({ _id: 'mock-chart-id', patientId });
        // Mock treatment history
        setTreatmentHistory([
          { 
            _id: 'treatment-1', 
            toothNumber: 3, 
            procedure: 'Composite Filling', 
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Composite filling on occlusal surface'
          },
          { 
            _id: 'treatment-2', 
            toothNumber: 14, 
            procedure: 'Crown Placement', 
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Full ceramic crown placed'
          },
          { 
            _id: 'treatment-3', 
            toothNumber: 30, 
            procedure: 'Root Canal Treatment', 
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Root canal treatment completed'
          }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dental chart:', error);
      toast.error('Failed to load dental chart');
      setLoading(false);
    }
  };

  // Fetch dropdown options
  useEffect(() => {
    setDoctorsLoading(true);
    staffService.getStaff({ role: 'Doctor', status: 'Active', limit: 100 }).then(res => {
      setDoctors(res.data || []);
      setDoctorsLoading(false);
    });
  }, []);

  const { clinic, user } = useAuth ? useAuth() : { clinic: null, user: null };
  let clinicId = null;
  if (user && user.clinicId) {
    clinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
  } else if (clinic && clinic._id) {
    clinicId = clinic._id;
  } else if (clinic && clinic.id) {
    clinicId = clinic.id;
  } else {
    const storedClinic = localStorage.getItem('clinicData');
    if (storedClinic) {
      try {
        const parsed = JSON.parse(storedClinic);
        clinicId = parsed._id || parsed.id;
      } catch {}
    }
  }

  // Async doctor loader for dropdown
  const loadDoctorOptions = async (inputValue) => {
    const params = { role: 'Doctor', status: 'Active', limit: 100 };
    if (clinicId) params.clinic = clinicId;
    if (inputValue) params.search = inputValue;
    const res = await staffService.getStaff(params);
    const staffArray = Array.isArray(res?.data) ? res.data : [];
    return staffArray.map(doc => ({
      value: doc._id,
      label: doc.name + (doc.specialization ? ` (${doc.specialization})` : ''),
      data: doc
    }));
  };

  // Handle tooth click
  const handleToothClick = (toothNumber) => {
    setSelectedTooth(toothNumber);
    const toothData = teethData[toothNumber];
    if (toothData) {
      setSelectedCondition(toothData.condition || 'healthy');
      setNotes(toothData.notes || '');
      setCost(toothData.cost || '');
      setDiscountPercent(toothData.discountPercent || '');
      setDiscountAmount(toothData.discountAmount || '');
      setFinalCost(toothData.finalCost || '');
      // 3. In handleToothClick, set status from toothData
      setSelectedStatus(toothData.status || 'completed');
    } else {
      setSelectedCondition('healthy');
      setNotes('');
      setCost('');
      setDiscountPercent('');
      setDiscountAmount('');
      setFinalCost('');
    }
  };

  // Utility to check for valid MongoDB ObjectId
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  // Helper to determine quadrant for a tooth number
  const getQuadrant = (toothNumber) => {
    // Universal numbering (adult):
    if (dentitionType === 'adult') {
      if (toothNumber >= 1 && toothNumber <= 8) return 'upper-right';
      if (toothNumber >= 9 && toothNumber <= 16) return 'upper-left';
      if (toothNumber >= 17 && toothNumber <= 24) return 'lower-left';
      if (toothNumber >= 25 && toothNumber <= 32) return 'lower-right';
    } else {
      // Pediatric/primary teeth
      if (PRIMARY_TEETH['upper-right'].includes(toothNumber)) return 'upper-right';
      if (PRIMARY_TEETH['upper-left'].includes(toothNumber)) return 'upper-left';
      if (PRIMARY_TEETH['lower-left'].includes(toothNumber)) return 'lower-left';
      if (PRIMARY_TEETH['lower-right'].includes(toothNumber)) return 'lower-right';
    }
    return 'upper-right'; // fallback
  };

  // Handle condition change (examination only)
  const handleConditionChange = async (condition) => {
    if (!readOnly && selectedTooth) {
      // Helper to update condition after chart is loaded
      const updateCondition = async (chartId) => {
        try {
          await dentalService.updateToothRecord(
            chartId,
            selectedTooth,
            {
              doctor: selectedDoctor,
              condition: condition,
              notes: notes,
              cost: parseFloat(cost) || 0,
              discountPercent: parseFloat(discountPercent) || 0,
              discountAmount: parseFloat(discountAmount) || 0,
              finalCost: parseFloat(finalCost) || 0,
              quadrant: getQuadrant(selectedTooth),
            }
          );
          // If a treatment type is selected, update or create a DentalTreatment plan for this tooth
          if (selectedTreatmentType) {
            const existingTreatment = treatmentHistory.find(
              t => t.toothNumber === selectedTooth &&
                t.procedure === selectedTreatmentType &&
                t.status !== 'completed' && t.status !== 'cancelled'
            );
            const treatmentPayload = {
              chartId: chartData._id,
              patientId,
              toothNumber: selectedTooth,
              procedure: selectedTreatmentType,
              doctor: selectedDoctor,
              cost: parseFloat(cost) || 0,
              discountPercent: parseFloat(discountPercent) || 0,
              discountAmount: parseFloat(discountAmount) || 0,
              finalCost: parseFloat(finalCost) || 0,
              status: selectedStatus,
              notes,
              treatmentType: selectedTreatmentType,
              patientApprovalStatus: (existingTreatment && existingTreatment.patientApprovalStatus) || 'pending',
            };
            if (existingTreatment && existingTreatment._id) {
              await dentalService.updateTreatment(existingTreatment._id, treatmentPayload);
            } else {
              await dentalService.createTreatment(treatmentPayload);
            }
          }
      setSelectedCondition(condition);
          setTeethData(prev => ({
            ...prev,
            [selectedTooth]: {
              ...prev[selectedTooth],
              condition: condition
            }
          }));
          toast.success(`Condition updated for Tooth #${selectedTooth}`);
        } catch (error) {
          console.error('Error updating condition:', error);
          toast.error('Failed to update condition');
        }
      };
      // If chartData._id is missing or invalid, try to fetch/create chart
      if (!chartData || !chartData._id || !isValidObjectId(chartData._id)) {
        try {
          const { chart } = await dentalService.getPatientDentalChart(patientId);
          if (chart && isValidObjectId(chart._id)) {
            setChartData(chart);
            await updateCondition(chart._id);
          } else {
            toast.error('Dental chart not loaded. Please wait and try again.');
          }
        } catch (err) {
          toast.error('Failed to load or create dental chart.');
        }
        return;
      }
      // Otherwise, update condition as normal
      await updateCondition(chartData._id);
    }
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    if (!readOnly) {
      setNotes(e.target.value);
    }
  };

  // Save tooth data
  const handleSaveTooth = async () => {
    if (readOnly || !selectedTooth) return;
    if (!chartData || !chartData._id) {
      toast.error('Dental chart not loaded. Please wait and try again.');
      return;
    }
    try {
      // Save to API only
      let baseCost = parseFloat(cost) || 0;
      let percent = parseFloat(discountPercent) || 0;
      let amount = parseFloat(discountAmount) || 0;
      let discount = 0;
      if (discountMethod === 'percent') {
        discount = baseCost * (percent / 100);
      } else {
        discount = amount;
      }
      let final = Math.max(0, baseCost - discount);
        await dentalService.updateToothRecord(
          chartData._id,
          selectedTooth,
          {
          doctor: selectedDoctor,
            condition: selectedCondition,
          treatmentType: selectedTreatmentType,
          notes: notes,
          cost: baseCost,
          discountPercent: percent,
          discountAmount: amount,
          finalCost: final,
          status: selectedStatus,
          quadrant: getQuadrant(selectedTooth),
          }
        );
      // If a treatment type is selected, update or create a DentalTreatment plan for this tooth
      if (selectedTreatmentType) {
        const existingTreatment = treatmentHistory.find(
          t => t.toothNumber === selectedTooth &&
            t.procedure === selectedTreatmentType &&
            t.status !== 'completed' && t.status !== 'cancelled'
        );
        const treatmentPayload = {
          chartId: chartData._id,
          patientId,
          toothNumber: selectedTooth,
          procedure: selectedTreatmentType,
          doctor: selectedDoctor,
          cost: baseCost,
          discountPercent: percent,
          discountAmount: amount,
          finalCost: final,
          status: selectedStatus,
          notes,
          treatmentType: selectedTreatmentType,
          patientApprovalStatus: (existingTreatment && existingTreatment.patientApprovalStatus) || 'pending',
        };
        if (existingTreatment && existingTreatment._id) {
          await dentalService.updateTreatment(existingTreatment._id, treatmentPayload);
        } else {
          await dentalService.createTreatment(treatmentPayload);
        }
      }
      setTeethData(prev => ({
        ...prev,
        [selectedTooth]: {
          ...prev[selectedTooth],
          doctor: selectedDoctor,
          condition: selectedCondition,
          treatmentType: selectedTreatmentType,
          notes: notes,
          cost: baseCost,
          discountPercent: percent,
          discountAmount: amount,
          finalCost: final,
          status: selectedStatus
        }
      }));
      toast.success(`Tooth #${selectedTooth} updated successfully`);
    } catch (error) {
      console.error('Error saving tooth data:', error);
      toast.error('Failed to save tooth data');
    }
  };

  // Get tooth type based on tooth number
  const getToothType = (toothNumber) => {
    if (dentitionType === 'adult') {
      if (TOOTH_TYPES.adult.molars.includes(toothNumber)) return 'molar';
      if (TOOTH_TYPES.adult.premolars.includes(toothNumber)) return 'premolar';
      if (TOOTH_TYPES.adult.canines.includes(toothNumber)) return 'canine';
      if (TOOTH_TYPES.adult.incisors.includes(toothNumber)) return 'incisor';
      return 'molar'; // Default
    } else {
      // Pediatric dentition
      if (TOOTH_TYPES.pediatric.molars.includes(toothNumber)) return 'molar';
      if (TOOTH_TYPES.pediatric.canines.includes(toothNumber)) return 'canine';
      if (TOOTH_TYPES.pediatric.incisors.includes(toothNumber)) return 'incisor';
      return 'molar'; // Default
    }
  };
  
  // Convert tooth number based on numbering system
  const convertToothNumber = (toothNumber) => {
    if (numberingSystem === 'universal') return toothNumber;
    
    if (numberingSystem === 'fdi') {
      if (dentitionType === 'adult') {
        return UNIVERSAL_TO_FDI[toothNumber] || toothNumber;
      } else {
        return PRIMARY_TO_FDI[toothNumber] || toothNumber;
      }
    }
    
    // Palmer notation would be implemented here
    return toothNumber;
  };

  // Render tooth chart
  const renderToothChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Render adult dentition
    if (dentitionType === 'adult') {
      // Helper to get arch offset
      const getArchOffset = (i, total) => {
        // Parabola: y = -a(x-h)^2 + k
        // Center is at h = (total-1)/2
        const h = (total - 1) / 2;
        const a = 0.7; // arch height factor
        const k = 0; // vertical shift
        const x = i;
        return -a * Math.pow(x - h, 2) + a * Math.pow(h, 2) + k;
      };
      return (
        <div className="tooth-chart">
          {/* Upper Arch */}
          <div className="upper-arch mt-12 mb-20">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Upper Arch</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-16 gap-1">
                {[...Array(16)].map((_, i) => {
                  const toothNumber = i + 1;
                  const offset = getArchOffset(i, 16);
                  return (
                    <div key={toothNumber} className="tooth-container" style={{ transform: `translateY(${offset}px)` }}>
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                  );
                })}
                  </div>
              </div>
            </div>
          {/* Lower Arch */}
          <div className="lower-arch mb-20">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Lower Arch</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-16 gap-1">
                {[...Array(16)].map((_, i) => {
                  const toothNumber = 32 - i;
                  const offset = -getArchOffset(i, 16); // invert for lower arch
                  return (
                    <div key={toothNumber} className="tooth-container" style={{ transform: `translateY(${offset}px)` }}>
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Render pediatric dentition
      return (
        <div className="tooth-chart">
          {/* Upper Arch - Pediatric */}
          <div className="upper-arch mb-8">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Upper Arch (Primary Teeth)</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-5 gap-1">
                {/* Upper Right (A-E) */}
                {PRIMARY_TEETH['upper-right'].map(toothNumber => (
                  <div key={toothNumber} className="tooth-container">
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                ))}
                {/* Upper Left (F-J) */}
                {PRIMARY_TEETH['upper-left'].map(toothNumber => (
                  <div key={toothNumber} className="tooth-container">
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Lower Arch - Pediatric */}
          <div className="lower-arch">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Lower Arch (Primary Teeth)</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-5 gap-1">
                {/* Lower Right (P-T) */}
                {PRIMARY_TEETH['lower-right'].map(toothNumber => (
                  <div key={toothNumber} className="tooth-container">
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                ))}
                {/* Lower Left (K-O) */}
                {PRIMARY_TEETH['lower-left'].map(toothNumber => (
                  <div key={toothNumber} className="tooth-container">
                    <ToothSvg 
                      toothNumber={convertToothNumber(toothNumber)}
                      toothType={getToothType(toothNumber)}
                      condition={teethData[toothNumber]?.condition || 'healthy'}
                      surfaces={teethData[toothNumber]?.surfaces || []}
                      selected={selectedTooth === toothNumber}
                      onClick={() => handleToothClick(toothNumber)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Render tooth details panel
  const renderToothDetails = () => {
    const disabled = readOnly;
      return (
      <Card
        title={<span className="font-semibold">{selectedTooth ? `Tooth #${selectedTooth}` : 'Tooth Details'}</span>}
        // Remove actions prop to eliminate '+ Treatment' button
        className="m-4"
        bodyClassName="space-y-4"
      >
        {/* Select Doctor Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Doctor</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            isClearable
            isSearchable
            loadOptions={loadDoctorOptions}
            value={selectedDoctor ? { value: selectedDoctor, label: (doctors.find(d => d._id === selectedDoctor)?.name) || 'Doctor' } : null}
            onChange={option => setSelectedDoctor(option ? option.value : '')}
            placeholder="Search for a doctor..."
            isDisabled={disabled}
            styles={{
              control: (provided, state) => ({
                ...provided,
                borderColor: state.isFocused ? '#6366F1' : provided.borderColor,
                boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : provided.boxShadow,
                '&:hover': {
                  borderColor: state.isFocused ? '#6366F1' : '#CBD5E0',
                },
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#E2E8F0' : provided.backgroundColor,
                color: state.isSelected ? 'white' : provided.color,
              }),
            }}
          />
        </div>
        {/* Condition Buttons */}
        <div>
          <div className="font-medium mb-1">Condition</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {TOOTH_CONDITIONS.map((cond) => (
              <button 
                key={cond.value}
                type="button"
                className={`rounded px-2 py-1 border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selectedCondition === cond.value ? 'border-indigo-800 scale-105 shadow' : 'border-gray-300'} text-white`}
                style={{ backgroundColor: cond.color }}
                onClick={() => handleConditionChange(cond.value)}
                disabled={disabled}
              >
                {cond.label}
              </button>
            ))}
            </div>
        </div>
        {/* Select Treatment Type Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Treatment Type</label>
          <Select
            className="w-full"
            isClearable
            isSearchable
            options={TREATMENT_TYPES}
            value={selectedTreatmentType ? TREATMENT_TYPES.find(t => t.value === selectedTreatmentType) : null}
            onChange={option => setSelectedTreatmentType(option ? option.value : '')}
            placeholder="Select a treatment type"
            isDisabled={disabled}
            styles={{
              control: (provided, state) => ({
                ...provided,
                borderColor: state.isFocused ? '#6366F1' : provided.borderColor,
                boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : provided.boxShadow,
                '&:hover': {
                  borderColor: state.isFocused ? '#6366F1' : '#CBD5E0',
                },
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#E2E8F0' : provided.backgroundColor,
                color: state.isSelected ? 'white' : provided.color,
              }),
            }}
          />
              </div>
        {/* Cost (INR) */}
        <div>
          <label className="block text-sm font-medium mb-1">Cost (INR)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder="Enter cost in INR"
            min="0"
            step="0.01"
            disabled={disabled}
          />
          </div>
        {/* Discount Method Toggle */}
        <div>
          <label className="block text-sm font-medium mb-1">Discount Method</label>
          <div className="flex gap-2 mb-2">
            <Button variant={discountMethod === 'percent' ? 'primary' : 'secondary'} size="sm" onClick={() => setDiscountMethod('percent')}>Percent (%)</Button>
            <Button variant={discountMethod === 'amount' ? 'primary' : 'secondary'} size="sm" onClick={() => setDiscountMethod('amount')}>Amount (₹)</Button>
        </div>
              </div>
        {/* Discount Percent */}
        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={discountPercent}
            onChange={e => { setDiscountPercent(e.target.value); setDiscountMethod('percent'); }}
            placeholder="Enter discount percent"
            min="0"
            max="100"
            step="0.01"
            disabled={disabled || discountMethod !== 'percent'}
          />
          </div>
        {/* Discount Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Discount (Amount)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={discountAmount}
            onChange={e => { setDiscountAmount(e.target.value); setDiscountMethod('amount'); }}
            placeholder="Enter discount amount"
            min="0"
            step="0.01"
            disabled={disabled || discountMethod !== 'amount'}
          />
        </div>
        {/* Final Cost (calculated) */}
        <div>
          <label className="block text-sm font-medium mb-1">Final Cost (INR)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 bg-gray-100"
            value={finalCost}
            readOnly
            placeholder="Final cost will be calculated"
            disabled
          />
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            options={TOOTH_STATUS_OPTIONS}
            value={TOOTH_STATUS_OPTIONS.find(opt => opt.value === selectedStatus)}
            onChange={opt => setSelectedStatus(opt ? opt.value : 'completed')}
            isClearable={false}
            isDisabled={readOnly}
            classNamePrefix="react-select"
          />
        </div>
        {/* Notes */}
        <div>
          <div className="font-medium mb-1">Notes</div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            value={notes}
            onChange={handleNotesChange}
            placeholder={selectedTooth ? "Add notes about this tooth..." : "No tooth selected"}
            disabled={disabled}
          />
        </div>
        {/* Move Save button to bottom of form */}
        {selectedTooth && !readOnly && (
          <div className="flex justify-end pt-4">
            <Button variant="primary" size="sm" onClick={handleSaveTooth}>Save</Button>
                    </div>
        )}
        {!selectedTooth && (
          <div className="text-gray-500 text-center py-4">No tooth selected. Select a tooth to edit details.</div>
          )}
      </Card>
    );
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      {/* Chart Controls */}
      <div className="p-4 border-b flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <h2 className="text-lg font-semibold">Dental Chart</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() => setDentitionType('adult')}
              variant={dentitionType === 'adult' ? 'primary' : 'secondary'}
            >
              <FaUser className="mr-1" /> Adult
            </Button>
            <Button
              onClick={() => setDentitionType('pediatric')}
              variant={dentitionType === 'pediatric' ? 'primary' : 'secondary'}
            >
              <FaChild className="mr-1" /> Pediatric
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={numberingSystem}
            onChange={(e) => setNumberingSystem(e.target.value)}
          >
            {NUMBERING_SYSTEMS.map(system => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
          
          {/* Legend button removed */}
          
          <Button
            onClick={() => window.print()}
          >
            <FaPrint className="mr-1" /> Print
          </Button>
        </div>
      </div>
      
      {/* Legend removed */}
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Tooth Chart */}
        <div className="w-full md:w-2/3 p-4 md:border-b-0 md:border-r-0">
          {renderToothChart()}
          {/* New Treatment Tabs */}
          <div className="mt-8">
            <div className="border-b border-gray-200 mb-4">
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
                  Treatments
                </button>
              </nav>
            </div>
            {/* Tab Content */}
            {treatmentTab === 'plan' && (
              <div>
                {/* Planned Treatments Table/Card */}
                {loading ? (
                  <div className="text-gray-400 text-center py-8">Loading treatments...</div>
                ) : treatmentHistory.filter(t => t.patientApprovalStatus !== 'approved').length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No treatments pending patient approval</div>
                ) : (
                  <div className="space-y-2">
                    {treatmentHistory.filter(t => t.patientApprovalStatus !== 'approved').map((t, idx) => (
                      <div key={t._id || idx} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-medium text-gray-700">{t.procedure}</div>
                          <div className="text-xs text-gray-500">Tooth #{t.toothNumber} | {new Date(t.date).toLocaleDateString()} | Status: {t.status} | Approval: {t.patientApprovalStatus || 'pending'}</div>
                          {t.notes && <div className="text-xs text-gray-400 mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="primary">Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteTreatment(t._id)}>Delete</Button>
                        </div>
              </div>
            ))}
          </div>
                )}
        </div>
      )}
            {treatmentTab === 'management' && (
              <div>
                {/* Approved/Completed Treatments Table/Card */}
                {loading ? (
                  <div className="text-gray-400 text-center py-8">Loading treatments...</div>
                ) : treatmentHistory.filter(t => t.patientApprovalStatus === 'approved' || t.status === 'completed').length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No approved or completed treatments</div>
                ) : (
                  <div className="space-y-2">
                    {treatmentHistory.filter(t => t.patientApprovalStatus === 'approved' || t.status === 'completed').map((t, idx) => (
                      <div key={t._id || idx} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-medium text-gray-700">{t.procedure}</div>
                          <div className="text-xs text-gray-500">
                            Tooth #{t.toothNumber} | {t.doctor ? `Doctor: ${t.doctor.name || t.doctor}` : ''} | {new Date(t.date).toLocaleDateString()} | Status: {t.status} | Approval: {t.patientApprovalStatus || 'pending'}
        </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Cost: ₹{t.cost?.toFixed(2) || '0.00'} | Discount: {t.discountPercent ? t.discountPercent + '%' : '0%'} / ₹{t.discountAmount?.toFixed(2) || '0.00'} | Final: ₹{t.finalCost?.toFixed(2) || '0.00'}
                          </div>
                          {t.notes && <div className="text-xs text-gray-400 mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="primary">Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteTreatment(t._id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Tooth Details */}
        <div className="w-full md:w-1/3">
          {renderToothDetails()}
        </div>
      </div>

      {/* Treatment Modal */}
      {showTreatmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Treatment for Tooth #{selectedTooth}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowTreatmentModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Procedure <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="e.g., Composite Filling, Root Canal, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="completed"
                    checked={selectedStatus === 'completed'}
                    onChange={() => setSelectedStatus('completed')}
                    className="mr-1"
                  />
                  <span className="text-sm">Completed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="planned"
                    checked={selectedStatus === 'planned'}
                    onChange={() => setSelectedStatus('planned')}
                    className="mr-1"
                  />
                  <span className="text-sm">Planned</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="Add treatment notes..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowTreatmentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTreatment}>
                Save Treatment
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .dental-chart {
            padding: 20px;
          }
          button, .controls {
            display: none !important;
          }
        }
        
        .tooth-svg {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .tooth-svg:hover {
          transform: scale(1.05);
        }
        
        .tooth-svg.selected {
          filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
        }
      `}</style>
    </Card>
  );
};

export default AdvancedToothChart;
