import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import patientService from '../../api/patients/patientService';
import appointmentService from '../../api/appointments/appointmentService';

// Zod schema for validation
const billingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  services: z.array(
    z.object({
      name: z.string().min(1, 'Service name is required'),
      cost: z.number().min(0, 'Cost must be a positive number'),
      quantity: z.number().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one service is required'),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  tax: z.number().min(0, 'Tax must be a positive number').optional(),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Bank Transfer']),
  paymentStatus: z.enum(['Paid', 'Pending', 'Partial', 'Cancelled']),
  notes: z.string().optional(),
});

const BillingForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  error = null,
  clinicId
}) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [services, setServices] = useState([{ name: '', cost: 0, quantity: 1 }]);
  const [fetchError, setFetchError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: initialData || {
      patientId: '',
      appointmentId: '',
      services: [{ name: '', cost: 0, quantity: 1 }],
      discount: 0,
      tax: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      notes: ''
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
  }, [initialData]);

  // Calculate subtotal and total whenever services, discount, or tax changes
  useEffect(() => {
    const servicesArray = watchedValues.services || [];
    const discount = watchedValues.discount || 0;
    const tax = watchedValues.tax || 0;

    const calculatedSubtotal = servicesArray.reduce((sum, service) => {
      return sum + (service.cost || 0) * (service.quantity || 1);
    }, 0);

    const discountAmount = calculatedSubtotal * (discount / 100);
    const afterDiscount = calculatedSubtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);
    const calculatedTotal = afterDiscount + taxAmount;

    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal);
  }, [watchedValues]);

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    setValue('patientId', patientId);
  };

  const addService = () => {
    setServices([...services, { name: '', cost: 0, quantity: 1 }]);
    setValue('services', [...services, { name: '', cost: 0, quantity: 1 }]);
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
    updatedServices[index][field] = field === 'cost' || field === 'quantity' ? parseFloat(value) || 0 : value;
    setServices(updatedServices);
    setValue('services', updatedServices);
  };

  const handleFormSubmit = (data) => {
    // Add clinic context to the billing data
    const billingData = {
      ...data,
      clinicId,
      subtotal,
      total
    };
    onSubmit(billingData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}
      {fetchError && <Alert variant="error" title="Loading Error" message={fetchError} />}

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
            Add Service
          </Button>
        </div>
        
        {services.map((service, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Service name"
                value={service.name}
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                placeholder="Cost"
                value={service.cost}
                onChange={(e) => handleServiceChange(index, 'cost', e.target.value)}
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="w-20">
              <input
                type="number"
                placeholder="Qty"
                value={service.quantity}
                onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <Button 
              type="button" 
              variant="danger" 
              size="sm" 
              onClick={() => removeService(index)}
              disabled={services.length === 1}
            >
              X
            </Button>
          </div>
        ))}
        {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>}
      </div>

      {/* Discount and Tax */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="discount"
          label="Discount (%)"
          type="number"
          {...register('discount', { valueAsNumber: true })}
          error={errors.discount?.message}
        />
        
        <Input
          id="tax"
          label="Tax (%)"
          type="number"
          {...register('tax', { valueAsNumber: true })}
          error={errors.tax?.message}
        />
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-4">
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
            <option value="Insurance">Insurance</option>
            <option value="Bank Transfer">Bank Transfer</option>
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
            <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {watchedValues.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Discount ({watchedValues.discount}%):</span>
              <span className="text-sm font-medium">-${(subtotal * (watchedValues.discount / 100)).toFixed(2)}</span>
            </div>
          )}
          {watchedValues.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tax ({watchedValues.tax}%):</span>
              <span className="text-sm font-medium">${(subtotal * (1 - watchedValues.discount / 100) * (watchedValues.tax / 100)).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span className="text-base font-medium">Total:</span>
            <span className="text-base font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};

export default BillingForm;
