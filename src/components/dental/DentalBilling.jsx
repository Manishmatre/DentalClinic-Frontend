import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { FaFileInvoiceDollar, FaSearch, FaSave, FaTrash, FaTooth, FaMoneyBillWave } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
import billingService from '../../api/billing/billingService';
import Input from '../ui/Input';
import Button from '../ui/Button';

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

// Zod schema for validation
const billingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  services: z.array(
    z.object({
      code: z.string().min(1, 'Procedure code is required'),
      description: z.string().min(1, 'Description is required'),
      fee: z.number().min(0, 'Fee must be a positive number'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      toothNumber: z.number().optional().nullable()
    })
  ).min(1, 'At least one service is required'),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  notes: z.string().optional(),
});

const DentalBilling = ({ patientId, treatmentId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('diagnostic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      patientId: patientId || '',
      services: [],
      discount: 0,
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services'
  });

  const watchedServices = watch('services');
  const watchedDiscount = watch('discount');

  // Fetch patient and treatment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patient data
        try {
          const patientData = await dentalService.getPatientById(patientId);
          setPatient(patientData);
        } catch (error) {
          console.error('Error fetching patient data:', error);
          setPatient(null);
        }

        // Fetch treatment data if treatmentId provided
        if (treatmentId) {
          try {
            const treatmentData = await dentalService.getTreatmentById(treatmentId);
            setTreatment(treatmentData);

            // If treatment has procedure code, pre-select it
            if (treatmentData.procedureCode) {
              const code = findCodeByValue(treatmentData.procedureCode);
              if (code) {
                setSelectedCode(code);
                setSelectedCategory(getCategoryForCode(code.code));
                append({
                  code: code.code,
                  description: code.description,
                  fee: code.fee,
                  quantity: 1,
                  toothNumber: treatmentData.toothNumber || null
                });
              }
            }
          } catch (error) {
            console.error('Error fetching treatment data:', error);
            setTreatment(null);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing DentalBilling:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, treatmentId, append]);

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
        code =>
          code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : CDT_CATEGORIES.find(cat => cat.id === selectedCategory)?.codes || [];

  // Calculate subtotal
  const calculateSubtotal = () => {
    return watchedServices.reduce((sum, item) => sum + (item.fee * item.quantity), 0);
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * (watchedDiscount || 0)) / 100;
  };

  // Calculate total after discount
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  // Add a billing item
  const handleAddItem = () => {
    if (!selectedCode) {
      toast.error('Please select a procedure code');
      return;
    }

    // Check if code already exists in services
    const existingIndex = fields.findIndex(field => field.code === selectedCode.code);
    if (existingIndex >= 0) {
      // Update quantity of existing item
      const currentQuantity = fields[existingIndex].quantity || 1;
      setValue(`services.${existingIndex}.quantity`, currentQuantity + quantity);
    } else {
      // Append new service
      append({
        code: selectedCode.code,
        description: selectedCode.description,
        fee: selectedCode.fee,
        quantity,
        toothNumber: treatment ? treatment.toothNumber : null
      });
    }

    setQuantity(1);
  };

  // Remove a billing item
  const handleRemoveItem = (index) => {
    remove(index);
  };

  // Submit form handler
  const onSubmit = async (data) => {
    if (data.services.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    try {
      setLoading(true);

      const invoiceData = {
        patientId: data.patientId,
        doctorId: treatment?.doctorId || null,
        clinicId: patient?.clinicId || null,
        appointmentId: treatment?.appointmentId || null,
        services: data.services.map(s => ({
          code: s.code,
          description: s.description,
          cost: s.fee,
          quantity: s.quantity,
          toothNumber: s.toothNumber
        })),
        subtotal: calculateSubtotal(),
        discount: data.discount || 0,
        tax: 0,
        total: calculateTotal(),
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        notes: data.notes || ''
      };

      const response = await billingService.createInvoice(invoiceData);

      toast.success('Invoice created successfully');
      if (onComplete) onComplete(response._id);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold">Dental Billing</h2>
        <div className="mt-2 md:mt-0">
          <Button type="submit" variant="primary" loading={loading} icon={<FaSave />}>
            Save & Create Invoice
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Patient Information</h3>
        <p className="font-medium">{patient?.name || 'Unknown'}</p>
        <p className="text-sm text-gray-600">ID: {patient?._id || patientId}</p>
      </div>

      {/* Treatment Information */}
      {treatment && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Treatment Information</h3>
          <p className="font-medium">{treatment.procedure || 'N/A'}</p>
          <p className="text-sm text-gray-600">Tooth Number: {treatment.toothNumber || 'N/A'}</p>
          <p className="text-sm text-gray-600">Date: {treatment.date ? new Date(treatment.date).toLocaleDateString() : 'N/A'}</p>
          {treatment.notes && <p className="text-sm mt-2">{treatment.notes}</p>}
        </div>
      )}

      {/* Procedure Code Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Select Procedure Code</h3>
        <div className="mb-4 flex">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded"
            placeholder="Search for procedure code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto mb-4">
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
                filteredCodes.map((code) => (
                  <tr
                    key={code.code}
                    className={selectedCode?.code === code.code ? 'bg-blue-50' : ''}
                  >
                    <td className="py-2 px-4">{code.code}</td>
                    <td className="py-2 px-4">{code.description}</td>
                    <td className="py-2 px-4 text-right">${code.fee.toFixed(2)}</td>
                    <td className="py-2 px-4 text-center">
                      <button
                        type="button"
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
          <div className="bg-blue-50 p-4 rounded-lg mb-4 flex flex-col md:flex-row justify-between items-center">
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
              <Button className="ml-4" onClick={handleAddItem} variant="success" size="sm">
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Billing Items */}
      <div>
        <h3 className="text-lg font-medium mb-4">Billing Items</h3>
        {fields.length > 0 ? (
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
                {fields.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-b">{item.code}</td>
                    <td className="py-2 px-4 border-b">{item.description}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {item.toothNumber ?? 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b text-right">${item.fee.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-16 p-1 border rounded text-center"
                        {...register(`services.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      ${(item.fee * (watchedServices[index]?.quantity || 1)).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        type="button"
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

      {/* Additional Information and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <Input
            label="Discount (%)"
            type="number"
            min={0}
            max={100}
            {...register('discount', { valueAsNumber: true })}
            error={errors.discount?.message}
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full p-2 border rounded-md"
              placeholder="Add any notes or special instructions..."
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between py-2 border-b">
              <span>Subtotal:</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-red-500">
              <span>Discount ({watchedDiscount || 0}%):</span>
              <span>- ${calculateDiscountAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b font-semibold">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" variant="primary" loading={loading} icon={<FaFileInvoiceDollar />}>
          Create Invoice
        </Button>
      </div>

      <div className="text-xs text-gray-500 italic mt-4">
        <p>
          <FaMoneyBillWave className="inline mr-1" />
          Insurance estimates are based on the information available and may not reflect the actual amount covered by the patient's insurance provider. Final coverage is determined by the insurance company at the time of claim processing.
        </p>
      </div>
    </form>
  );
};

export default DentalBilling;
