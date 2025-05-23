import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFileInvoiceDollar, 
  FaPlus, 
  FaSearch, 
  FaSave, 
  FaTrash, 
  FaTooth,
  FaMoneyBillWave
} from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
// Import billingService when it's available
// import billingService from '../../api/billing/billingService';

// CDT Code categories with common dental procedures
const CDT_CATEGORIES = [
  { id: 'diagnostic', name: 'Diagnostic', codes: [
    { code: 'D0120', description: 'Periodic oral evaluation', fee: 50 },
    { code: 'D0140', description: 'Limited oral evaluation - problem focused', fee: 65 },
    { code: 'D0150', description: 'Comprehensive oral evaluation', fee: 85 },
    { code: 'D0210', description: 'Intraoral - complete series of radiographic images', fee: 120 },
    { code: 'D0220', description: 'Intraoral - periapical first radiographic image', fee: 30 },
    { code: 'D0230', description: 'Intraoral - periapical each additional radiographic image', fee: 25 },
    { code: 'D0274', description: 'Bitewings - four radiographic images', fee: 60 },
    { code: 'D0330', description: 'Panoramic radiographic image', fee: 95 }
  ]},
  { id: 'preventive', name: 'Preventive', codes: [
    { code: 'D1110', description: 'Prophylaxis - adult', fee: 85 },
    { code: 'D1120', description: 'Prophylaxis - child', fee: 65 },
    { code: 'D1206', description: 'Topical application of fluoride varnish', fee: 35 },
    { code: 'D1351', description: 'Sealant - per tooth', fee: 45 },
    { code: 'D1354', description: 'Interim caries arresting medicament application - per tooth', fee: 35 }
  ]},
  { id: 'restorative', name: 'Restorative', codes: [
    { code: 'D2140', description: 'Amalgam - one surface, primary or permanent', fee: 120 },
    { code: 'D2150', description: 'Amalgam - two surfaces, primary or permanent', fee: 150 },
    { code: 'D2160', description: 'Amalgam - three surfaces, primary or permanent', fee: 180 },
    { code: 'D2330', description: 'Resin-based composite - one surface, anterior', fee: 135 },
    { code: 'D2331', description: 'Resin-based composite - two surfaces, anterior', fee: 165 },
    { code: 'D2332', description: 'Resin-based composite - three surfaces, anterior', fee: 195 },
    { code: 'D2391', description: 'Resin-based composite - one surface, posterior', fee: 140 },
    { code: 'D2392', description: 'Resin-based composite - two surfaces, posterior', fee: 175 },
    { code: 'D2393', description: 'Resin-based composite - three surfaces, posterior', fee: 210 },
    { code: 'D2740', description: 'Crown - porcelain/ceramic', fee: 1050 },
    { code: 'D2750', description: 'Crown - porcelain fused to high noble metal', fee: 950 },
    { code: 'D2950', description: 'Core buildup, including any pins when required', fee: 200 }
  ]},
  { id: 'endodontics', name: 'Endodontics', codes: [
    { code: 'D3220', description: 'Therapeutic pulpotomy', fee: 150 },
    { code: 'D3310', description: 'Endodontic therapy, anterior tooth', fee: 700 },
    { code: 'D3320', description: 'Endodontic therapy, premolar tooth', fee: 825 },
    { code: 'D3330', description: 'Endodontic therapy, molar tooth', fee: 975 }
  ]},
  { id: 'periodontics', name: 'Periodontics', codes: [
    { code: 'D4341', description: 'Periodontal scaling and root planing - four or more teeth per quadrant', fee: 225 },
    { code: 'D4342', description: 'Periodontal scaling and root planing - one to three teeth per quadrant', fee: 165 },
    { code: 'D4910', description: 'Periodontal maintenance', fee: 110 }
  ]},
  { id: 'prosthodontics', name: 'Prosthodontics', codes: [
    { code: 'D5110', description: 'Complete denture - maxillary', fee: 1500 },
    { code: 'D5120', description: 'Complete denture - mandibular', fee: 1500 },
    { code: 'D5213', description: 'Maxillary partial denture - cast metal framework', fee: 1650 },
    { code: 'D5214', description: 'Mandibular partial denture - cast metal framework', fee: 1650 }
  ]},
  { id: 'oral_surgery', name: 'Oral Surgery', codes: [
    { code: 'D7140', description: 'Extraction, erupted tooth or exposed root', fee: 150 },
    { code: 'D7210', description: 'Extraction, erupted tooth requiring removal of bone', fee: 225 },
    { code: 'D7220', description: 'Removal of impacted tooth - soft tissue', fee: 275 },
    { code: 'D7230', description: 'Removal of impacted tooth - partially bony', fee: 350 },
    { code: 'D7240', description: 'Removal of impacted tooth - completely bony', fee: 425 }
  ]}
];

const DentalBilling = ({ patientId, treatmentId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('diagnostic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [billingItems, setBillingItems] = useState([]);
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  
  // Fetch patient and treatment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient data
        try {
          // Mock patient data for demo purposes until API is available
          // In production, this would be: const patientData = await dentalService.getPatientById(patientId);
          const patientData = {
            _id: patientId,
            name: 'Demo Patient',
            dateOfBirth: '1985-05-15',
            gender: 'Female',
            phone: '555-123-4567'
          };
          setPatient(patientData);
        } catch (error) {
          console.error('Error fetching patient data:', error);
          // Continue with demo data
        }
        
        // Mock insurance info for demo purposes
        setInsuranceInfo({
          provider: 'Demo Insurance',
          policyNumber: 'POL123456',
          coveragePercentage: 80
        });
        
        // Mock treatment data if treatmentId is provided
        if (treatmentId) {
          // In production: const treatmentData = await dentalService.getTreatmentById(treatmentId);
          const treatmentData = {
            id: treatmentId,
            procedure: 'Dental Filling',
            toothNumber: 18,
            date: new Date(),
            notes: 'Composite filling on distal surface'
          };
          setTreatment(treatmentData);
          
          // If treatment already has a procedure code, pre-select it
          const mockProcedureCode = 'D2392';
          const code = findCodeByValue(mockProcedureCode);
          if (code) {
            setSelectedCode(code);
            setSelectedCategory(getCategoryForCode(code.code));
          }
          
          // Set notes from treatment
          if (treatmentData.notes) {
            setNotes(treatmentData.notes);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in demo mode:', error);
        toast.error('Failed to initialize demo mode');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, treatmentId]);
  
  // Find a CDT code by its value
  const findCodeByValue = (codeValue) => {
    for (const category of CDT_CATEGORIES) {
      const code = category.codes.find(c => c.code === codeValue);
      if (code) return code;
    }
    return null;
  };
  
  // Get category ID for a code
  const getCategoryForCode = (codeValue) => {
    for (const category of CDT_CATEGORIES) {
      if (category.codes.some(c => c.code === codeValue)) {
        return category.id;
      }
    }
    return 'diagnostic'; // Default
  };
  
  // Filter codes based on search term
  const filteredCodes = searchTerm 
    ? CDT_CATEGORIES.flatMap(cat => cat.codes).filter(
        code => code.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
               code.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : CDT_CATEGORIES.find(cat => cat.id === selectedCategory)?.codes || [];
  
  // Calculate totals
  const calculateSubtotal = () => {
    return billingItems.reduce((sum, item) => sum + (item.fee * item.quantity), 0);
  };
  
  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  
  const calculateEstimatedInsurance = () => {
    if (!insuranceInfo || !insuranceInfo.coveragePercentage) return 0;
    
    // Simple calculation based on coverage percentage
    return (calculateTotal() * insuranceInfo.coveragePercentage) / 100;
  };
  
  const calculatePatientResponsibility = () => {
    return calculateTotal() - calculateEstimatedInsurance();
  };
  
  // Add a billing item
  const handleAddItem = () => {
    if (!selectedCode) {
      toast.error('Please select a procedure code');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    
    // Check if code already exists in billing items
    const existingItemIndex = billingItems.findIndex(item => item.code === selectedCode.code);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...billingItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setBillingItems(updatedItems);
    } else {
      // Add new item
      setBillingItems([
        ...billingItems,
        {
          code: selectedCode.code,
          description: selectedCode.description,
          fee: selectedCode.fee,
          quantity,
          toothNumber: treatment ? treatment.toothNumber : null
        }
      ]);
    }
    
    // Reset selection
    setQuantity(1);
  };
  
  // Remove a billing item
  const handleRemoveItem = (index) => {
    const updatedItems = [...billingItems];
    updatedItems.splice(index, 1);
    setBillingItems(updatedItems);
  };
  
  // Save billing information
  const handleSaveBilling = async () => {
    if (billingItems.length === 0) {
      toast.error('Please add at least one procedure');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create invoice data
      const invoiceData = {
        patientId,
        items: billingItems,
        subtotal: calculateSubtotal(),
        discountPercentage: discount,
        discountAmount: calculateDiscount(),
        total: calculateTotal(),
        estimatedInsurance: calculateEstimatedInsurance(),
        patientResponsibility: calculatePatientResponsibility(),
        notes,
        treatmentId: treatmentId || null,
        toothNumbers: treatment ? [treatment.toothNumber] : []
      };
      
      // In demo mode, just log the invoice data
      console.log('Invoice data ready for submission:', invoiceData);
      
      // Mock response for demo
      const mockResponse = { id: 'inv-' + Date.now() };
      
      toast.success('Demo mode: Invoice would be created in production');
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete(mockResponse.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in demo billing:', error);
      toast.error('Failed in demo mode');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold">Dental Billing</h2>
        <div className="mt-2 md:mt-0">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
            onClick={handleSaveBilling}
          >
            <FaSave className="mr-2" />
            Save & Create Invoice
          </button>
        </div>
      </div>
      
      {/* Patient Information */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{patient?.name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID</p>
            <p className="font-medium">{patient?._id || patientId}</p>
          </div>
          {insuranceInfo && (
            <div>
              <p className="text-sm text-gray-600">Insurance</p>
              <p className="font-medium">{insuranceInfo.provider}</p>
              <p className="text-xs text-gray-500">
                Policy: {insuranceInfo.policyNumber}
                {insuranceInfo.coveragePercentage && 
                  ` (${insuranceInfo.coveragePercentage}% coverage)`}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Treatment Information */}
      {treatment && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Treatment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Procedure</p>
              <p className="font-medium">{treatment.procedure}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tooth Number</p>
              <p className="font-medium flex items-center">
                <FaTooth className="mr-1 text-blue-500" />
                {treatment.toothNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">
                {new Date(treatment.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {treatment.notes && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-sm">{treatment.notes}</p>
            </div>
          )}
        </div>
      )}
      
      {/* CDT Code Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Select Procedure Code</h3>
        
        <div className="mb-4">
          <div className="flex mb-2">
            <div className="relative flex-grow">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded"
                placeholder="Search for procedure code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              className="ml-2 p-2 border rounded"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchTerm('');
              }}
              disabled={searchTerm !== ''}
            >
              {CDT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Code</th>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-right">Fee</th>
                <th className="py-2 px-4 text-center">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.length > 0 ? (
                filteredCodes.map((code, index) => (
                  <tr 
                    key={code.code} 
                    className={`
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${selectedCode?.code === code.code ? 'bg-blue-50' : ''}
                    `}
                  >
                    <td className="py-2 px-4">{code.code}</td>
                    <td className="py-2 px-4">{code.description}</td>
                    <td className="py-2 px-4 text-right">${code.fee.toFixed(2)}</td>
                    <td className="py-2 px-4 text-center">
                      <button
                        className={`p-1 rounded ${
                          selectedCode?.code === code.code 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        onClick={() => setSelectedCode(code)}
                      >
                        {selectedCode?.code === code.code ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No procedures found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {selectedCode && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Selected Procedure</h4>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="font-bold">{selectedCode.code}</p>
                <p>{selectedCode.description}</p>
                <p className="text-blue-700">${selectedCode.fee.toFixed(2)}</p>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <label className="mr-2">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  className="w-16 p-1 border rounded text-center"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <button
                  className="ml-4 bg-green-500 text-white px-3 py-1 rounded flex items-center"
                  onClick={handleAddItem}
                >
                  <FaPlus className="mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Billing Items */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Billing Items</h3>
        
        {billingItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Code</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-center">Tooth #</th>
                  <th className="py-2 px-4 border-b text-right">Fee</th>
                  <th className="py-2 px-4 border-b text-center">Qty</th>
                  <th className="py-2 px-4 border-b text-right">Total</th>
                  <th className="py-2 px-4 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{item.code}</td>
                    <td className="py-2 px-4 border-b">{item.description}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {item.toothNumber || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      ${item.fee.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      ${(item.fee * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            No billing items added yet
          </div>
        )}
      </div>
      
      {/* Billing Summary */}
      {billingItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Discount and Notes */}
          <div>
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or special instructions..."
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Totals */}
          <div>
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Discount ({discount}%):</span>
                <span className="font-medium text-red-500">-${calculateDiscount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              
              {insuranceInfo && (
                <>
                  <div className="flex justify-between py-2 border-b text-blue-600">
                    <span>Estimated Insurance ({insuranceInfo.coveragePercentage}%):</span>
                    <span>-${calculateEstimatedInsurance().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Patient Responsibility:</span>
                    <span>${calculatePatientResponsibility().toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
                  onClick={handleSaveBilling}
                >
                  <FaFileInvoiceDollar className="mr-2" />
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Insurance Disclaimer */}
      <div className="text-xs text-gray-500 italic mt-4">
        <p>
          <FaMoneyBillWave className="inline mr-1" />
          Insurance estimates are based on the information available and may not reflect the actual amount covered by the patient's insurance provider. Final coverage is determined by the insurance company at the time of claim processing.
        </p>
      </div>
    </div>
  );
};

export default DentalBilling;
