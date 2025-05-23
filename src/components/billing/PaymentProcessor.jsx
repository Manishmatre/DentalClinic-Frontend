import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import billingService from '../../api/billing/billingService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// Zod schema for validation
const paymentSchema = z.object({
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .refine(val => !isNaN(val), {
      message: 'Amount must be a valid number',
    }),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cheque', 'Wallet', 'Insurance', 'Bank Transfer']),
  transactionId: z.string().optional(),
  upiId: z.string().optional(),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional()
});

const PaymentProcessor = ({ invoice, onPaymentComplete, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Calculate remaining balance
  const remainingBalance = invoice ? invoice.total - invoice.paidAmount : 0;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance,
      paymentMethod: 'Cash',
      transactionId: '',
      upiId: '',
      chequeNumber: '',
      bankName: '',
      notes: ''
    }
  });
  
  // Watch amount and payment method to validate and show conditional fields
  const watchedAmount = watch('amount');
  const watchedPaymentMethod = watch('paymentMethod');
  
  // Handle payment submission
  const onSubmit = async (data) => {
    if (data.amount > remainingBalance) {
      setError(`Payment amount cannot exceed the remaining balance of ₹${remainingBalance.toFixed(2)}`);
      return;
    }
    
    if (data.amount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate new paid amount and determine payment status
      const newPaidAmount = (invoice.paidAmount || 0) + parseFloat(data.amount);
      let paymentStatus;
      
      if (newPaidAmount >= invoice.total) {
        paymentStatus = 'Paid';
      } else if (newPaidAmount > 0) {
        paymentStatus = 'Partial';
      } else {
        paymentStatus = 'Pending';
      }
      
      // Create payment data
      const paymentData = {
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        paymentStatus,
        paidAmount: newPaidAmount,
        // Include additional payment details based on payment method
        ...(data.transactionId && { transactionId: data.transactionId }),
        ...(data.upiId && { upiId: data.upiId }),
        ...(data.chequeNumber && { chequeNumber: data.chequeNumber }),
        ...(data.bankName && { bankName: data.bankName }),
        paymentDate: new Date().toISOString()
      };
      
      // Process the payment
      const result = await billingService.processPayment(invoice._id, paymentData);
      
      if (result && result.success) {
        setSuccess(`Payment of ₹${data.amount.toFixed(2)} processed successfully`);
        
        // Notify parent component of successful payment
        if (onPaymentComplete) {
          onPaymentComplete({
            ...invoice,
            paidAmount: newPaidAmount,
            paymentStatus
          });
        }
      } else {
        setError(result?.error || 'Failed to process payment');
      }
    } catch (err) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error processing payment:', err.message || 'Unknown error');
      }
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle paying full amount
  const handlePayFull = () => {
    setValue('amount', remainingBalance);
  };
  
  if (!invoice) {
    return <div>No invoice data available</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Invoice Number</p>
            <p className="font-medium">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-medium">{invoice.patientId?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">₹{invoice.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Paid</p>
            <p className="font-medium">₹{invoice.paidAmount.toFixed(2)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Remaining Balance</p>
            <p className="text-xl font-bold text-indigo-600">₹{remainingBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {success && (
        <Alert
          variant="success"
          title="Success"
          message={success}
        />
      )}
      
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
        />
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              step="0.01"
              className={`block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md ${
                errors.amount
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="0.00"
              {...register('amount', {
                valueAsNumber: true,
              })}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                className="h-full py-0 px-3 border-l border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                onClick={handlePayFull}
              >
                Full Amount
              </button>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
          {watchedAmount > remainingBalance && (
            <p className="mt-1 text-sm text-red-600">
              Amount cannot exceed the remaining balance of ${remainingBalance.toFixed(2)}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            className={`block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.paymentMethod ? 'border-red-300' : ''
            }`}
            {...register('paymentMethod')}
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cheque">Cheque</option>
            <option value="Wallet">Wallet</option>
            <option value="Insurance">Insurance</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Conditional fields based on payment method */}
        {(watchedPaymentMethod === 'Credit Card' || watchedPaymentMethod === 'Debit Card') && (
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID / Reference Number
            </label>
            <input
              type="text"
              id="transactionId"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter transaction ID"
              {...register('transactionId')}
            />
          </div>
        )}

        {watchedPaymentMethod === 'UPI' && (
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID / Reference Number
            </label>
            <input
              type="text"
              id="upiId"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter UPI ID or reference"
              {...register('upiId')}
            />
          </div>
        )}

        {watchedPaymentMethod === 'Cheque' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Number
              </label>
              <input
                type="text"
                id="chequeNumber"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter cheque number"
                {...register('chequeNumber')}
              />
            </div>
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter bank name"
                {...register('bankName')}
              />
            </div>
          </div>
        )}

        {(watchedPaymentMethod === 'Net Banking' || watchedPaymentMethod === 'Bank Transfer') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter transaction ID"
                {...register('transactionId')}
              />
            </div>
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter bank name"
                {...register('bankName')}
              />
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add any payment notes here..."
            {...register('notes')}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || watchedAmount > remainingBalance || watchedAmount <= 0}
          >
            Process Payment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentProcessor;
