import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaTooth, FaPlus, FaEdit, FaSave, FaUndo, FaPrint, 
  FaChild, FaUser, FaExchangeAlt, FaInfoCircle, FaTimes 
} from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
import ToothSvg from './ToothSvg';

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

// Tooth conditions
const TOOTH_CONDITIONS = [
  { value: 'healthy', label: 'Healthy', color: '#4CAF50' },
  { value: 'caries', label: 'Caries', color: '#F44336' },
  { value: 'filled', label: 'Filled', color: '#2196F3' },
  { value: 'crown', label: 'Crown', color: '#9C27B0' },
  { value: 'missing', label: 'Missing', color: '#9E9E9E' },
  { value: 'implant', label: 'Implant', color: '#FF9800' },
  { value: 'root-canal', label: 'Root Canal', color: '#795548' },
  { value: 'bridge', label: 'Bridge', color: '#607D8B' },
  { value: 'veneer', label: 'Veneer', color: '#00BCD4' },
  { value: 'extraction-needed', label: 'Extraction Needed', color: '#E91E63' }
];

// Tooth surfaces
const TOOTH_SURFACES = [
  { value: 'mesial', label: 'Mesial (M)', position: 'left' },
  { value: 'distal', label: 'Distal (D)', position: 'right' },
  { value: 'buccal', label: 'Buccal (B)', position: 'top' },
  { value: 'occlusal', label: 'Occlusal (O)', position: 'center' },
  { value: 'lingual', label: 'Lingual (L)', position: 'bottom' }
];

const AdvancedToothChart = ({ patientId, readOnly = false }) => {
  // State for chart data
  const [chartData, setChartData] = useState(null);
  const [teethData, setTeethData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // State for tooth selection and editing
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('healthy');
  const [selectedSurfaces, setSelectedSurfaces] = useState([]);
  const [notes, setNotes] = useState('');
  
  // State for treatment management
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [procedure, setProcedure] = useState('');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('completed'); // 'planned' or 'completed'
  
  // State for UI controls
  const [dentitionType, setDentitionType] = useState('adult'); // 'adult' or 'pediatric'
  const [numberingSystem, setNumberingSystem] = useState('universal');
  const [showLegend, setShowLegend] = useState(true);

  // Fetch dental chart data
  useEffect(() => {
    fetchDentalChart();
  }, [patientId]);

  // Fetch dental chart data function
  const fetchDentalChart = async () => {
    try {
      setLoading(true);
      
      // Try to get data from API
      try {
        const data = await dentalService.getPatientDentalChart(patientId);
        setChartData(data);
        
        // Initialize teeth data
        const teethObj = {};
        // Initialize all adult teeth with default values
        for (let i = 1; i <= 32; i++) {
          teethObj[i] = data.teeth && data.teeth[i] 
            ? data.teeth[i] 
            : { condition: 'healthy', surfaces: [], notes: '' };
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
          teethObj[i] = { condition: 'healthy', surfaces: [], notes: '' };
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

  // Handle tooth click
  const handleToothClick = (toothNumber) => {
    setSelectedTooth(toothNumber);
    const toothData = teethData[toothNumber];
    if (toothData) {
      setSelectedCondition(toothData.condition || 'healthy');
      setSelectedSurfaces(toothData.surfaces || []);
      setNotes(toothData.notes || '');
    } else {
      setSelectedCondition('healthy');
      setSelectedSurfaces([]);
      setNotes('');
    }
  };

  // Toggle surface selection
  const handleSurfaceToggle = (surface) => {
    if (!readOnly) {
      setSelectedSurfaces(prev => 
        prev.includes(surface) 
          ? prev.filter(s => s !== surface) 
          : [...prev, surface]
      );
    }
  };

  // Handle condition change
  const handleConditionChange = (condition) => {
    if (!readOnly) {
      setSelectedCondition(condition);
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
    
    try {
      // Update local state
      const updatedTeethData = {
        ...teethData,
        [selectedTooth]: {
          condition: selectedCondition,
          surfaces: selectedSurfaces,
          notes: notes
        }
      };
      
      setTeethData(updatedTeethData);
      
      // Save to API
      try {
        await dentalService.updateToothRecord(
          chartData._id,
          selectedTooth,
          {
            condition: selectedCondition,
            surfaces: selectedSurfaces,
            notes: notes
          }
        );
        toast.success(`Tooth #${selectedTooth} updated successfully`);
      } catch (apiError) {
        console.log('API not available, changes saved locally only');
        toast.info('Changes saved locally (demo mode)');
      }
    } catch (error) {
      console.error('Error saving tooth data:', error);
      toast.error('Failed to save tooth data');
    }
  };

  // Handle adding a treatment
  const handleAddTreatment = async () => {
    if (!procedure || !treatmentDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const treatmentData = {
        toothNumber: selectedTooth,
        procedure,
        date: treatmentDate,
        notes: treatmentNotes,
        cost: parseFloat(cost) || 0,
        status
      };
      
      // Add to local state
      setTreatmentHistory(prev => [...prev, {
        _id: `local-${Date.now()}`,
        ...treatmentData
      }]);
      
      // Try to save to API
      try {
        await dentalService.addTreatment(chartData._id, selectedTooth, treatmentData);
        toast.success('Treatment added successfully');
      } catch (apiError) {
        console.log('API not available, treatment saved locally only');
        toast.info('Treatment saved locally (demo mode)');
      }
      
      // Close modal and reset form
      setShowTreatmentModal(false);
      setProcedure('');
      setTreatmentDate(new Date().toISOString().split('T')[0]);
      setTreatmentNotes('');
      setCost('');
      setStatus('completed');
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error('Failed to add treatment');
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
      return (
        <div className="tooth-chart">
          {/* Upper Arch */}
          <div className="upper-arch mb-8">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Upper Arch</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-8 gap-1">
                {/* Upper Right (1-8) */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map(toothNumber => (
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
                {/* Upper Left (9-16) */}
                {[9, 10, 11, 12, 13, 14, 15, 16].map(toothNumber => (
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
          
          {/* Lower Arch */}
          <div className="lower-arch">
            <div className="flex justify-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Lower Arch</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-8 gap-1">
                {/* Lower Right (32-25) */}
                {[32, 31, 30, 29, 28, 27, 26, 25].map(toothNumber => (
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
                {/* Lower Left (24-17) */}
                {[24, 23, 22, 21, 20, 19, 18, 17].map(toothNumber => (
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
    if (!selectedTooth) {
      return (
        <div className="text-center p-4">
          <FaTooth className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Select a tooth to view details</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tooth #{selectedTooth}</h3>
          {!readOnly && (
            <div className="flex space-x-2">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                onClick={handleSaveTooth}
              >
                <FaSave className="mr-1" /> Save
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                onClick={() => setShowTreatmentModal(true)}
              >
                <FaPlus className="mr-1" /> Treatment
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <div className="grid grid-cols-5 gap-2">
            {TOOTH_CONDITIONS.map(condition => (
              <div 
                key={condition.value}
                className={`
                  p-2 rounded border cursor-pointer text-center text-sm
                  ${selectedCondition === condition.value ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                  ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                style={{ backgroundColor: `${condition.color}20` }}
                onClick={() => !readOnly && handleConditionChange(condition.value)}
              >
                {condition.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Affected Surfaces</label>
          <div className="grid grid-cols-3 gap-2">
            {TOOTH_SURFACES.map(surface => (
              <div 
                key={surface.value}
                className={`
                  p-2 rounded border cursor-pointer text-center text-sm
                  ${selectedSurfaces.includes(surface.value) ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}
                  ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                onClick={() => !readOnly && handleSurfaceToggle(surface.value)}
              >
                {surface.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows="3"
            value={notes}
            onChange={handleNotesChange}
            disabled={readOnly}
            placeholder="Add notes about this tooth..."
          ></textarea>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Treatment History</h4>
          {treatmentHistory.filter(t => t.toothNumber === selectedTooth).length > 0 ? (
            <div className="border rounded divide-y max-h-40 overflow-y-auto">
              {treatmentHistory
                .filter(t => t.toothNumber === selectedTooth)
                .map((treatment, index) => (
                  <div key={index} className="p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{treatment.procedure}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(treatment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{treatment.notes}</p>
                  </div>
                ))
              }
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No treatment history for this tooth</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Chart Controls */}
      <div className="p-4 border-b flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <h2 className="text-lg font-semibold">Dental Chart</h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm flex items-center ${
                dentitionType === 'adult' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setDentitionType('adult')}
            >
              <FaUser className="mr-1" /> Adult
            </button>
            <button
              className={`px-3 py-1 rounded text-sm flex items-center ${
                dentitionType === 'pediatric' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setDentitionType('pediatric')}
            >
              <FaChild className="mr-1" /> Pediatric
            </button>
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
          
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center"
            onClick={() => setShowLegend(!showLegend)}
          >
            <FaInfoCircle className="mr-1" /> Legend
          </button>
          
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center"
            onClick={() => window.print()}
          >
            <FaPrint className="mr-1" /> Print
          </button>
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {TOOTH_CONDITIONS.map(condition => (
              <div 
                key={condition.value}
                className="flex items-center space-x-2"
              >
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: condition.color }}
                ></div>
                <span className="text-xs">{condition.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Tooth Chart */}
        <div className="w-full md:w-2/3 p-4 border-b md:border-b-0 md:border-r">
          {renderToothChart()}
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
                    checked={status === 'completed'}
                    onChange={() => setStatus('completed')}
                    className="mr-1"
                  />
                  <span className="text-sm">Completed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="planned"
                    checked={status === 'planned'}
                    onChange={() => setStatus('planned')}
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
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowTreatmentModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddTreatment}
              >
                Save Treatment
              </button>
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
    </div>
  );
};

export default AdvancedToothChart;
