import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// Zod schema for validation
const transactionSchema = z.object({
  transactionType: z.enum(['Purchase', 'Usage', 'Adjustment', 'Return', 'Disposal', 'Transfer']),
  quantity: z.number()
    .refine(val => val !== 0, 'Quantity cannot be zero'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative').optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});

const InventoryTransactionForm = ({
  onSubmit,
  item,
  isLoading = false,
  error = null
}) => {
  const [transactionType, setTransactionType] = useState('Purchase');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: 'Purchase',
      quantity: 1,
      unitCost: item?.unitCost || 0,
      referenceNumber: '',
      notes: ''
    }
  });

  const watchedTransactionType = watch('transactionType');
  const watchedQuantity = watch('quantity');
  const watchedUnitCost = watch('unitCost');

  // Update transaction type state when form value changes
  React.useEffect(() => {
    setTransactionType(watchedTransactionType);
  }, [watchedTransactionType]);

  // Ensure quantity is negative for certain transaction types
  React.useEffect(() => {
    if (['Usage', 'Return', 'Disposal', 'Transfer'].includes(transactionType)) {
      if (watchedQuantity > 0) {
        setValue('quantity', -Math.abs(watchedQuantity));
      }
    } else if (watchedQuantity < 0) {
      setValue('quantity', Math.abs(watchedQuantity));
    }
  }, [transactionType, watchedQuantity, setValue]);

  const handleFormSubmit = (data) => {
    // Calculate total cost
    const totalCost = Math.abs(data.quantity) * (data.unitCost || item.unitCost);
    
    // Add item ID to the data
    const transactionData = {
      ...data,
      itemId: item._id,
      totalCost
    };
    
    onSubmit(transactionData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Item Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-sm text-gray-900">{item.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Code</p>
            <p className="text-sm text-gray-900">{item.itemCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Quantity</p>
            <p className="text-sm text-gray-900">{item.currentQuantity} {item.unitOfMeasure}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unit Cost</p>
            <p className="text-sm text-gray-900">${item.unitCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Transaction Type */}
        <div>
          <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            id="transactionType"
            {...register('transactionType')}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${errors.transactionType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
          >
            <option value="Purchase">Purchase</option>
            <option value="Usage">Usage</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Return">Return</option>
            <option value="Disposal">Disposal</option>
            <option value="Transfer">Transfer</option>
          </select>
          {errors.transactionType && <p className="mt-1 text-sm text-red-600">{errors.transactionType.message}</p>}
        </div>

        {/* Quantity */}
        <Input
          id="quantity"
          label={`Quantity (${item.unitOfMeasure})`}
          type="number"
          step="1"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
          helperText={['Usage', 'Return', 'Disposal', 'Transfer'].includes(transactionType) ? 'Will be recorded as negative' : ''}
        />

        {/* Unit Cost (only for Purchase and Adjustment) */}
        {(transactionType === 'Purchase' || transactionType === 'Adjustment') && (
          <Input
            id="unitCost"
            label="Unit Cost ($)"
            type="number"
            step="0.01"
            {...register('unitCost', { valueAsNumber: true })}
            error={errors.unitCost?.message}
          />
        )}

        {/* Reference Number */}
        <Input
          id="referenceNumber"
          label="Reference Number (Optional)"
          placeholder="e.g., Invoice #, PO #"
          {...register('referenceNumber')}
          error={errors.referenceNumber?.message}
        />
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

      {/* Transaction Summary */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Summary</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Type:</span>
            <span className="text-sm font-medium">{transactionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Quantity:</span>
            <span className="text-sm font-medium">
              {['Usage', 'Return', 'Disposal', 'Transfer'].includes(transactionType) ? '-' : '+'}
              {Math.abs(watchedQuantity)} {item.unitOfMeasure}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Unit Cost:</span>
            <span className="text-sm font-medium">
              ${(watchedUnitCost || item.unitCost).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-base font-medium">Total Value:</span>
            <span className="text-base font-bold">
              ${(Math.abs(watchedQuantity) * (watchedUnitCost || item.unitCost)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Record Transaction</Button>
      </div>
    </form>
  );
};

export default InventoryTransactionForm;