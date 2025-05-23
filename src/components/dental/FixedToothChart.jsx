import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTooth, FaPlus, FaEdit, FaSave, FaUndo, FaPrint } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';

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
  { value: 'bridge', label: 'Bridge', color: '#607D8B' }
];

const TOOTH_SURFACES = [
  { value: 'mesial', label: 'Mesial (M)', position: 'left' },
  { value: 'distal', label: 'Distal (D)', position: 'right' },
  { value: 'buccal', label: 'Buccal (B)', position: 'top' },
  { value: 'occlusal', label: 'Occlusal (O)', position: 'center' },
  { value: 'lingual', label: 'Lingual (L)', position: 'bottom' }
];

const FixedToothChart = ({ patientId, readOnly = false }) => {
  const [chartId, setChartId] = useState(null);
  const [teethData, setTeethData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('healthy');
  const [selectedSurfaces, setSelectedSurfaces] = useState([]);
  const [notes, setNotes] = useState('');
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  
  // Fetch dental chart data
  useEffect(() => {
    const fetchDentalChart = async () => {
      try {
        setLoading(true);
        const data = await dentalService.getPatientDentalChart(patientId);
        setChartId(data._id || 'mock-chart-id');
        
        // Initialize teeth data from chart or create default
        const teethObj = {};
        
        // Populate all teeth with default values if they don't exist
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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dental chart:', error);
        toast.error('Failed to load dental chart');
        
        // Initialize with empty data for demo purposes
        const teethObj = {};
        Object.values(ADULT_TEETH).flat().forEach(toothNumber => {
          teethObj[toothNumber] = { 
            condition: 'healthy', 
            surfaces: [], 
            notes: '' 
          };
        });
        setTeethData(teethObj);
        setChartId('mock-chart-id');
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchDentalChart();
    }
  }, [patientId]);

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

  const handleConditionChange = (condition) => {
    if (readOnly) return;
    setSelectedCondition(condition);
  };

  const handleSurfaceToggle = (surface) => {
    if (readOnly) return;
    setSelectedSurfaces(prev => {
      if (prev.includes(surface)) {
        return prev.filter(s => s !== surface);
      } else {
        return [...prev, surface];
      }
    });
  };

  const handleNotesChange = (e) => {
    if (readOnly) return;
    setNotes(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedTooth || readOnly) return;
    
    try {
      const updatedToothData = {
        condition: selectedCondition,
        surfaces: selectedSurfaces,
        notes: notes
      };
      
      // Update local state first for immediate feedback
      setTeethData(prev => ({
        ...prev,
        [selectedTooth]: updatedToothData
      }));
      
      // Then update on server
      await dentalService.updateToothRecord(chartId, selectedTooth, updatedToothData);
      toast.success('Tooth record updated successfully');
    } catch (error) {
      console.error('Error updating tooth record:', error);
      toast.error('Failed to update tooth record');
    }
  };

  const handleAddTreatment = async (treatmentData) => {
    if (!selectedTooth || readOnly) return;
    
    try {
      // Add treatment on server
      const result = await dentalService.addTreatment(chartId, selectedTooth, treatmentData);
      
      // Update treatment history
      setTreatmentHistory(prev => [result, ...prev]);
      
      toast.success('Treatment added successfully');
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error('Failed to add treatment');
    }
    
    setShowTreatmentModal(false);
  };

  const getToothColor = (toothNumber) => {
    const toothData = teethData[toothNumber];
    if (!toothData) return '#4CAF50'; // Default to healthy
    
    const condition = TOOTH_CONDITIONS.find(c => c.value === toothData.condition);
    return condition ? condition.color : '#4CAF50';
  };

  const renderToothSection = (section) => {
    return (
      <div className={`tooth-section ${section}`}>
        {ADULT_TEETH[section].map(toothNumber => (
          <div 
            key={toothNumber}
            className={`tooth ${selectedTooth === toothNumber ? 'selected' : ''}`}
            onClick={() => handleToothClick(toothNumber)}
            style={{ backgroundColor: getToothColor(toothNumber) }}
          >
            <span className="tooth-number">{toothNumber}</span>
          </div>
        ))}
      </div>
    );
  };

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
                onClick={handleSave}
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
          <div className="grid grid-cols-4 gap-2">
            {TOOTH_CONDITIONS.map(condition => (
              <div 
                key={condition.value}
                className={`
                  p-2 rounded border cursor-pointer text-center text-sm
                  ${selectedCondition === condition.value ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                `}
                style={{ backgroundColor: `${condition.color}20` }}
                onClick={() => handleConditionChange(condition.value)}
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
                `}
                onClick={() => handleSurfaceToggle(surface.value)}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <FaTooth className="mr-2 text-blue-500" /> Dental Chart
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="md:col-span-2">
          <div className="dental-chart">
            <div className="upper-jaw">
              {renderToothSection('upper-right')}
              {renderToothSection('upper-left')}
            </div>
            <div className="lower-jaw">
              {renderToothSection('lower-right')}
              {renderToothSection('lower-left')}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {TOOTH_CONDITIONS.map(condition => (
              <div key={condition.value} className="flex items-center text-sm">
                <div 
                  className="w-4 h-4 rounded-full mr-1"
                  style={{ backgroundColor: condition.color }}
                ></div>
                {condition.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-lg">
          {renderToothDetails()}
        </div>
      </div>
      
      {showTreatmentModal && (
        <TreatmentModal 
          onClose={() => setShowTreatmentModal(false)} 
          onSave={handleAddTreatment}
        />
      )}
      
      <style jsx>{`
        .dental-chart {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .upper-jaw, .lower-jaw {
          display: flex;
          justify-content: center;
        }
        
        .tooth-section {
          display: flex;
        }
        
        .tooth-section.upper-right, .tooth-section.lower-right {
          flex-direction: row-reverse;
        }
        
        .tooth {
          width: 40px;
          height: 40px;
          margin: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          color: white;
          font-weight: bold;
          text-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        
        .tooth.selected {
          box-shadow: 0 0 0 2px #3B82F6;
        }
      `}</style>
    </div>
  );
};

// Treatment Modal Component
const TreatmentModal = ({ onClose, onSave }) => {
  const [procedure, setProcedure] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      procedure,
      date,
      notes,
      cost: parseFloat(cost) || 0
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add Treatment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Procedure</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              required
              placeholder="e.g. Filling, Root Canal, etc."
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
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
              className="w-full border rounded p-2"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about the treatment..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Treatment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FixedToothChart;
