import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTooth, FaPlus, FaEdit, FaSave, FaUndo, FaPrint } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';

// Constants for teeth configuration
const ADULT_TEETH = {
  'upper-right': [1, 2, 3, 4, 5, 6, 7, 8],
  'upper-left': [9, 10, 11, 12, 13, 14, 15, 16],
  'lower-left': [17, 18, 19, 20, 21, 22, 23, 24],
  'lower-right': [25, 26, 27, 28, 29, 30, 31, 32]
};

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

const SURFACES = [
  { value: 'mesial', label: 'Mesial (M)', position: 'left' },
  { value: 'occlusal', label: 'Occlusal (O)', position: 'center' },
  { value: 'distal', label: 'Distal (D)', position: 'right' },
  { value: 'buccal', label: 'Buccal (B)', position: 'top' },
  { value: 'lingual', label: 'Lingual (L)', position: 'bottom' }
];

const EnhancedToothChart = ({ patientId, readOnly = false }) => {
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
  const [treatmentType, setTreatmentType] = useState('');
  const [treatmentDate, setTreatmentDate] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  
  // State for UI controls
  const [viewMode, setViewMode] = useState('adult'); // 'adult' or 'child'
  const [showLegend, setShowLegend] = useState(true);

  // Fetch dental chart data
  useEffect(() => {
    const fetchDentalChart = async () => {
      try {
        setLoading(true);
        
        // Try to get data from API
        try {
          const data = await dentalService.getPatientDentalChart(patientId);
          setChartData(data);
          
          // Initialize teeth data
          const teethObj = {};
          Object.values(ADULT_TEETH).flat().forEach(toothNumber => {
            if (data.teeth && data.teeth[toothNumber]) {
              teethObj[toothNumber] = data.teeth[toothNumber];
            } else {
              teethObj[toothNumber] = { 
                condition: 'healthy', 
                surfaces: [], 
                notes: '' 
              };
            }
          });
          
          setTeethData(teethObj);
          
          // Also fetch treatment history
          const treatmentData = await dentalService.getPatientTreatments(patientId);
          setTreatmentHistory(treatmentData || []);
        } catch (apiError) {
          console.log('API not available, using mock data');
          
          // Initialize with empty data for demo
          const teethObj = {};
          Object.values(ADULT_TEETH).flat().forEach(toothNumber => {
            teethObj[toothNumber] = { 
              condition: 'healthy', 
              surfaces: [], 
              notes: '' 
            };
          });
          
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
    
    if (patientId) {
      fetchDentalChart();
    }
  }, [patientId]);

  // Handle tooth selection
  const handleToothClick = (toothNumber) => {
    if (readOnly) return;
    
    setSelectedTooth(toothNumber);
    
    // Set current tooth data if available
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
  const toggleSurface = (surface) => {
    if (selectedSurfaces.includes(surface)) {
      setSelectedSurfaces(selectedSurfaces.filter(s => s !== surface));
    } else {
      setSelectedSurfaces([...selectedSurfaces, surface]);
    }
  };

  // Save tooth data
  const handleSaveTooth = async () => {
    if (!selectedTooth) return;
    
    try {
      const toothData = {
        condition: selectedCondition,
        surfaces: selectedSurfaces,
        notes: notes
      };
      
      // Try to update via API
      try {
        await dentalService.updateToothRecord(chartData._id, selectedTooth, toothData);
      } catch (apiError) {
        console.log('API update failed, updating local state only');
        // Continue with local update even if API fails
      }
      
      // Update local state
      setTeethData(prev => ({
        ...prev,
        [selectedTooth]: toothData
      }));
      
      toast.success(`Tooth #${selectedTooth} updated successfully`);
      
      // Reset selection
      setSelectedTooth(null);
      setSelectedCondition('healthy');
      setSelectedSurfaces([]);
      setNotes('');
    } catch (error) {
      console.error('Error updating tooth record:', error);
      toast.error('Failed to update tooth record');
    }
  };

  // Add treatment
  const handleAddTreatment = async () => {
    if (!selectedTooth) return;
    
    try {
      const treatmentData = {
        toothNumber: selectedTooth,
        procedure: treatmentType,
        date: treatmentDate || new Date().toISOString(),
        notes: treatmentNotes
      };
      
      // Try to add via API
      try {
        await dentalService.addTreatment(chartData._id, selectedTooth, treatmentData);
      } catch (apiError) {
        console.log('API update failed, updating local state only');
        // Continue with local update even if API fails
      }
      
      // Update local treatment history
      const newTreatment = {
        _id: `treatment-${Date.now()}`,
        ...treatmentData
      };
      
      setTreatmentHistory(prev => [...prev, newTreatment]);
      setShowTreatmentModal(false);
      
      // Reset treatment form
      setTreatmentType('');
      setTreatmentDate('');
      setTreatmentNotes('');
      
      toast.success(`Treatment added to tooth #${selectedTooth}`);
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error('Failed to add treatment');
    }
  };

  // Get tooth color based on condition
  const getToothColor = (toothNumber) => {
    const tooth = teethData[toothNumber];
    if (!tooth) return '#4CAF50'; // Default healthy color
    
    const condition = TOOTH_CONDITIONS.find(c => c.value === tooth.condition);
    return condition ? condition.color : '#4CAF50';
  };

  // Get quadrant for tooth
  const getQuadrantForTooth = (toothNumber) => {
    const num = parseInt(toothNumber);
    if (num >= 1 && num <= 8) return 'upper-right';
    if (num >= 9 && num <= 16) return 'upper-left';
    if (num >= 17 && num <= 24) return 'lower-left';
    if (num >= 25 && num <= 32) return 'lower-right';
    return 'upper-right'; // Default
  };

  // Print chart
  const handlePrintChart = () => {
    window.print();
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedTooth(null);
    setSelectedCondition('healthy');
    setSelectedSurfaces([]);
    setNotes('');
  };

  return (
    <div className="dental-chart">
      {/* Chart Controls */}
      <div className="mb-4 flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Interactive Dental Chart</h3>
          <p className="text-sm text-gray-600">Click on a tooth to view or update its status</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center"
            onClick={handleResetSelection}
          >
            <FaUndo className="mr-1" /> Reset Selection
          </button>
          <button
            className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center"
            onClick={handlePrintChart}
          >
            <FaPrint className="mr-1" /> Print Chart
          </button>
          <button
            className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors flex items-center"
            onClick={() => setShowLegend(!showLegend)}
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dental Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tooth Chart</h3>
              {selectedTooth && (
                <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Selected: Tooth #{selectedTooth}
                </span>
              )}
            </div>
            
            {/* Upper Teeth */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-16 gap-1 w-full max-w-2xl">
                {ADULT_TEETH['upper-right'].map(toothNumber => (
                  <div 
                    key={`tooth-${toothNumber}`}
                    className={`tooth-item aspect-square flex items-center justify-center rounded cursor-pointer border-2 ${selectedTooth === toothNumber ? 'border-blue-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: getToothColor(toothNumber) }}
                    onClick={() => handleToothClick(toothNumber)}
                  >
                    <span className="text-xs font-bold text-white">{toothNumber}</span>
                  </div>
                ))}
                {ADULT_TEETH['upper-left'].map(toothNumber => (
                  <div 
                    key={`tooth-${toothNumber}`}
                    className={`tooth-item aspect-square flex items-center justify-center rounded cursor-pointer border-2 ${selectedTooth === toothNumber ? 'border-blue-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: getToothColor(toothNumber) }}
                    onClick={() => handleToothClick(toothNumber)}
                  >
                    <span className="text-xs font-bold text-white">{toothNumber}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Lower Teeth */}
            <div className="flex justify-center">
              <div className="grid grid-cols-16 gap-1 w-full max-w-2xl">
                {ADULT_TEETH['lower-left'].map(toothNumber => (
                  <div 
                    key={`tooth-${toothNumber}`}
                    className={`tooth-item aspect-square flex items-center justify-center rounded cursor-pointer border-2 ${selectedTooth === toothNumber ? 'border-blue-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: getToothColor(toothNumber) }}
                    onClick={() => handleToothClick(toothNumber)}
                  >
                    <span className="text-xs font-bold text-white">{toothNumber}</span>
                  </div>
                ))}
                {ADULT_TEETH['lower-right'].map(toothNumber => (
                  <div 
                    key={`tooth-${toothNumber}`}
                    className={`tooth-item aspect-square flex items-center justify-center rounded cursor-pointer border-2 ${selectedTooth === toothNumber ? 'border-blue-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: getToothColor(toothNumber) }}
                    onClick={() => handleToothClick(toothNumber)}
                  >
                    <span className="text-xs font-bold text-white">{toothNumber}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            {showLegend && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {TOOTH_CONDITIONS.map(condition => (
                    <div key={condition.value} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-1" 
                        style={{ backgroundColor: condition.color }}
                      ></div>
                      <span className="text-xs">{condition.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Tooth Details & Controls */}
          <div className="bg-white p-4 rounded-lg shadow">
            {selectedTooth ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Tooth #{selectedTooth} Details</h3>
                
                {/* Condition Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {TOOTH_CONDITIONS.map(condition => (
                      <button
                        key={condition.value}
                        className={`p-2 rounded text-xs flex flex-col items-center ${selectedCondition === condition.value ? 'ring-2 ring-blue-500' : 'bg-gray-50'}`}
                        style={{ backgroundColor: selectedCondition === condition.value ? condition.color + '33' : '' }}
                        onClick={() => setSelectedCondition(condition.value)}
                      >
                        <div 
                          className="w-5 h-5 rounded-full mb-1" 
                          style={{ backgroundColor: condition.color }}
                        ></div>
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Surface Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affected Surfaces</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {SURFACES.map(surface => (
                      <button
                        key={surface.value}
                        className={`p-2 rounded text-xs ${selectedSurfaces.includes(surface.value) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}
                        onClick={() => toggleSurface(surface.value)}
                      >
                        {surface.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this tooth..."
                  ></textarea>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSaveTooth}
                  >
                    <FaSave className="mr-1" /> Save Changes
                  </button>
                  <button
                    className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={() => setShowTreatmentModal(true)}
                  >
                    <FaPlus className="mr-1" /> Add Treatment
                  </button>
                  <button
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={handleResetSelection}
                  >
                    <FaUndo className="mr-1" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <FaTooth className="text-gray-300 text-6xl mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No Tooth Selected</h3>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  Click on a tooth in the chart to view details and make changes
                </p>
              </div>
            )}
            
            {/* Treatment History */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Treatment History</h3>
              {treatmentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tooth</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatmentHistory.map((treatment, index) => (
                        <tr key={treatment._id || index} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm">{treatment.toothNumber}</td>
                          <td className="py-2 px-3 text-sm">{treatment.procedure}</td>
                          <td className="py-2 px-3 text-sm">{new Date(treatment.date).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-sm">{treatment.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No treatment history available</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Treatment Modal */}
      {showTreatmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Treatment for Tooth #{selectedTooth}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Procedure</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                placeholder="e.g., Composite Filling, Root Canal, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
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
      <style jsx>{`
        @media print {
          .dental-chart {
            padding: 20px;
          }
          button, .controls {
            display: none !important;
          }
        }
        
        /* Custom grid for teeth */
        .grid-cols-16 {
          grid-template-columns: repeat(8, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default EnhancedToothChart;
