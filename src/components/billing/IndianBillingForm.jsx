import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import patientService from '../../api/patients/patientService';
import appointmentService from '../../api/appointments/appointmentService';
import { FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

// Zod schema for validation with Indian billing requirements
const indianBillingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  services: z.array(
    z.object({
      name: z.string().min(1, 'Service name is required'),
      cost: z.number().min(0, 'Cost must be a positive number'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      hsn: z.string().optional(), // HSN/SAC code for GST
      gstRate: z.number().min(0, 'GST rate must be a positive number').max(28, 'Maximum GST rate is 28%').optional()
    })
  ).min(1, 'At least one service is required'),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  cgst: z.number().min(0, 'CGST must be a positive number').optional(),
  sgst: z.number().min(0, 'SGST must be a positive number').optional(),
  igst: z.number().min(0, 'IGST must be a positive number').optional(),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Insurance', 'Cheque']),
  paymentStatus: z.enum(['Paid', 'Pending', 'Partial', 'Cancelled']),
  notes: z.string().optional(),
  patientGstin: z.string().optional(),
  includeGst: z.boolean().optional(),
  isInterState: z.boolean().optional(),
});

const IndianBillingForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  error = null,
  clinicId
}) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [services, setServices] = useState([{ name: '', cost: 0, quantity: 1, hsn: '', gstRate: 18 }]);
  const [fetchError, setFetchError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [includeGst, setIncludeGst] = useState(true);
  const [isInterState, setIsInterState] = useState(false);
  const [gstBreakup, setGstBreakup] = useState({ cgst: 0, sgst: 0, igst: 0 });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(indianBillingSchema),
    defaultValues: initialData || {
      patientId: '',
      appointmentId: '',
      invoiceNumber: `INV-${Date.now().toString().substring(0, 10)}`,
      services: [{ name: '', cost: 0, quantity: 1, hsn: '', gstRate: 18 }],
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      notes: '',
      patientGstin: '',
      includeGst: true,
      isInterState: false
    }
  });

  const watchedValues = watch();

  // Fetch patients for the clinic
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setFetchError(null);
        const data = await patientService.getPatients({ clinicId });
        setPatients(data);
        
        // If initialData has a patientId, set it as selected
        if (initialData?.patientId) {
          setSelectedPatientId(initialData.patientId);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        setFetchError(err.response?.data?.message || 'Failed to load patients');
      }
    };

    fetchPatients();
  }, [clinicId, initialData]);

  // Fetch appointments for selected patient
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedPatientId) {
        setAppointments([]);
        return;
      }

      try {
        setFetchError(null);
        const data = await appointmentService.getAppointmentsByPatient(selectedPatientId);
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setFetchError(err.response?.data?.message || 'Failed to load appointments');
      }
    };

    fetchAppointments();
  }, [selectedPatientId]);

  // Initialize services from initialData if available
  useEffect(() => {
    if (initialData?.services && initialData.services.length > 0) {
      setServices(initialData.services);
    }
    if (initialData?.includeGst !== undefined) {
      setIncludeGst(initialData.includeGst);
    }
    if (initialData?.isInterState !== undefined) {
      setIsInterState(initialData.isInterState);
    }
  }, [initialData]);

  // Calculate subtotal, GST, and total whenever services, discount, or tax changes
  useEffect(() => {
    const servicesArray = watchedValues.services || [];
    const discount = watchedValues.discount || 0;
    
    const calculatedSubtotal = servicesArray.reduce((sum, service) => {
      return sum + (service.cost || 0) * (service.quantity || 1);
    }, 0);

    const discountAmount = calculatedSubtotal * (discount / 100);
    const afterDiscount = calculatedSubtotal - discountAmount;
    
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    if (includeGst) {
      // Calculate GST for each service based on its rate
      servicesArray.forEach(service => {
        const serviceTotal = (service.cost || 0) * (service.quantity || 1);
        const serviceDiscount = serviceTotal * (discount / 100);
        const afterServiceDiscount = serviceTotal - serviceDiscount;
        const gstRate = service.gstRate || 0;
        
        if (isInterState) {
          // For inter-state: only IGST applies
          igstAmount += afterServiceDiscount * (gstRate / 100);
        } else {
          // For intra-state: CGST and SGST apply (half of GST rate each)
          const halfGstRate = gstRate / 2;
          cgstAmount += afterServiceDiscount * (halfGstRate / 100);
          sgstAmount += afterServiceDiscount * (halfGstRate / 100);
        }
      });
    }
    
    const calculatedTotal = afterDiscount + cgstAmount + sgstAmount + igstAmount;

    setSubtotal(calculatedSubtotal);
    setGstBreakup({ cgst: cgstAmount, sgst: sgstAmount, igst: igstAmount });
    setTotal(calculatedTotal);
    
    // Update form values
    setValue('cgst', cgstAmount);
    setValue('sgst', sgstAmount);
    setValue('igst', igstAmount);
  }, [watchedValues, includeGst, isInterState, setValue]);

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    setValue('patientId', patientId);
  };

  const addService = () => {
    setServices([...services, { name: '', cost: 0, quantity: 1, hsn: '', gstRate: 18 }]);
    setValue('services', [...services, { name: '', cost: 0, quantity: 1, hsn: '', gstRate: 18 }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      const updatedServices = services.filter((_, i) => i !== index);
      setServices(updatedServices);
      setValue('services', updatedServices);
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = field === 'cost' || field === 'quantity' || field === 'gstRate' 
      ? parseFloat(value) || 0 
      : value;
    setServices(updatedServices);
    setValue('services', updatedServices);
  };

  const handleGstToggle = (e) => {
    setIncludeGst(e.target.checked);
    setValue('includeGst', e.target.checked);
  };

  const handleInterStateToggle = (e) => {
    setIsInterState(e.target.checked);
    setValue('isInterState', e.target.checked);
  };

  const handleFormSubmit = (data) => {
    // Add clinic context to the billing data
    const billingData = {
      ...data,
      clinicId,
      subtotal,
      total,
      includeGst,
      isInterState
    };
    onSubmit(billingData);
  };

  // Common GST rates in India for medical services
  const gstRates = [0, 5, 12, 18, 28];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}
      {fetchError && <Alert variant="error" title="Loading Error" message={fetchError} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Number */}
        <div>
          <Input
            id="invoiceNumber"
            label="Invoice Number"
            {...register('invoiceNumber')}
            error={errors.invoiceNumber?.message}
          />
        </div>

        {/* GST Options */}
        <div className="flex space-x-4 items-center mt-6">
          <div className="flex items-center">
            <input
              id="includeGst"
              type="checkbox"
              checked={includeGst}
              onChange={handleGstToggle}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="includeGst" className="ml-2 block text-sm text-gray-700">
              Include GST
            </label>
          </div>
          
          {includeGst && (
            <div className="flex items-center">
              <input
                id="isInterState"
                type="checkbox"
                checked={isInterState}
                onChange={handleInterStateToggle}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isInterState" className="ml-2 block text-sm text-gray-700">
                Inter-State Supply
              </label>
              <div className="ml-1 text-gray-500 cursor-pointer group relative">
                <FaInfoCircle className="h-4 w-4" />
                <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -left-20 top-6">
                  Check this if the patient is from a different state than your clinic. This will apply IGST instead of CGST+SGST.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Selection */}
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
        <select
          id="patientId"
          value={selectedPatientId}
          onChange={handlePatientChange}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.patientId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>}
      </div>

      {/* Patient GSTIN (Optional) */}
      {includeGst && (
        <div>
          <Input
            id="patientGstin"
            label="Patient GSTIN (Optional)"
            {...register('patientGstin')}
            error={errors.patientGstin?.message}
          />
        </div>
      )}

      {/* Appointment Selection (Optional) */}
      <div>
        <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-1">Related Appointment (Optional)</label>
        <select
          id="appointmentId"
          {...register('appointmentId')}
          className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={!selectedPatientId || appointments.length === 0}
        >
          <option value="">None</option>
          {appointments.map(a => (
            <option key={a._id} value={a._id}>
              {new Date(a.startTime).toLocaleDateString()} - {a.serviceType}
            </option>
          ))}
        </select>
      </div>

      {/* Services */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <Button type="button" variant="secondary" size="sm" onClick={addService}>
            <FaPlus className="mr-1" /> Add Service
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost (₹)
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                {includeGst && (
                  <>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HSN/SAC
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST %
                    </th>
                  </>
                )}
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="text"
                      placeholder="Service name"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      placeholder="Cost"
                      value={service.cost}
                      onChange={(e) => handleServiceChange(index, 'cost', e.target.value)}
                      className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={service.quantity}
                      onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                      className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  {includeGst && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="HSN/SAC"
                          value={service.hsn || ''}
                          onChange={(e) => handleServiceChange(index, 'hsn', e.target.value)}
                          className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <select
                          value={service.gstRate || 0}
                          onChange={(e) => handleServiceChange(index, 'gstRate', e.target.value)}
                          className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {gstRates.map(rate => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2 whitespace-nowrap">
                    ₹{((service.cost || 0) * (service.quantity || 1)).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Button 
                      type="button" 
                      variant="danger" 
                      size="sm" 
                      onClick={() => removeService(index)}
                      disabled={services.length === 1}
                    >
                      <FaTrash className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>}
      </div>

      {/* Discount */}
      <div>
        <Input
          id="discount"
          label="Discount (%)"
          type="number"
          {...register('discount', { valueAsNumber: true })}
          error={errors.discount?.message}
        />
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            id="paymentMethod"
            {...register('paymentMethod')}
            className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Insurance">Insurance</option>
            <option value="Cheque">Cheque</option>
          </select>
          {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>}
        </div>
        
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            id="paymentStatus"
            {...register('paymentStatus')}
            className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.paymentStatus && <p className="mt-1 text-sm text-red-600">{errors.paymentStatus.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          {watchedValues.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Discount ({watchedValues.discount}%):</span>
              <span className="text-sm font-medium">-₹{(subtotal * (watchedValues.discount / 100)).toFixed(2)}</span>
            </div>
          )}
          
          {includeGst && (
            <>
              {!isInterState && gstBreakup.cgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">CGST:</span>
                  <span className="text-sm font-medium">₹{gstBreakup.cgst.toFixed(2)}</span>
                </div>
              )}
              {!isInterState && gstBreakup.sgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">SGST:</span>
                  <span className="text-sm font-medium">₹{gstBreakup.sgst.toFixed(2)}</span>
                </div>
              )}
              {isInterState && gstBreakup.igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">IGST:</span>
                  <span className="text-sm font-medium">₹{gstBreakup.igst.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-base font-medium">Total:</span>
            <span className="text-base font-bold">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};

export default IndianBillingForm;
