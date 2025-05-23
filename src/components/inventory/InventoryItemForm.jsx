import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// Zod schema for validation
const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['Medication', 'Medical Supply', 'Equipment', 'Office Supply', 'Other']),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  currentQuantity: z.number().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative').optional(),
  idealQuantity: z.number().min(0, 'Ideal quantity cannot be negative').optional(),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
  supplier: z.object({
    name: z.string().optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional()
  }).optional(),
  notes: z.string().optional()
});

const InventoryItemForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  error = null
}) => {
  const [showSupplierFields, setShowSupplierFields] = useState(initialData?.supplier?.name ? true : false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: initialData || {
      name: '',
      category: 'Medical Supply',
      description: '',
      unitOfMeasure: '',
      currentQuantity: 0,
      reorderLevel: 10,
      idealQuantity: 50,
      unitCost: 0,
      expiryDate: '',
      location: '',
      supplier: {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      },
      notes: ''
    }
  });

  const handleFormSubmit = (data) => {
    // Format date fields
    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate);
    }

    // If supplier fields are not shown, remove supplier data
    if (!showSupplierFields) {
      data.supplier = {};
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Item Name */}
        <Input
          id="name"
          label="Item Name"
          {...register('name')}
          error={errors.name?.message}
        />

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            {...register('category')}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
          >
            <option value="Medication">Medication</option>
            <option value="Medical Supply">Medical Supply</option>
            <option value="Equipment">Equipment</option>
            <option value="Office Supply">Office Supply</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>

        {/* Unit of Measure */}
        <Input
          id="unitOfMeasure"
          label="Unit of Measure"
          placeholder="e.g., Box, Bottle, Each"
          {...register('unitOfMeasure')}
          error={errors.unitOfMeasure?.message}
        />

        {/* Current Quantity */}
        <Input
          id="currentQuantity"
          label="Current Quantity"
          type="number"
          {...register('currentQuantity', { valueAsNumber: true })}
          error={errors.currentQuantity?.message}
        />

        {/* Reorder Level */}
        <Input
          id="reorderLevel"
          label="Reorder Level"
          type="number"
          {...register('reorderLevel', { valueAsNumber: true })}
          error={errors.reorderLevel?.message}
        />

        {/* Ideal Quantity */}
        <Input
          id="idealQuantity"
          label="Ideal Quantity"
          type="number"
          {...register('idealQuantity', { valueAsNumber: true })}
          error={errors.idealQuantity?.message}
        />

        {/* Unit Cost */}
        <Input
          id="unitCost"
          label="Unit Cost ($)"
          type="number"
          step="0.01"
          {...register('unitCost', { valueAsNumber: true })}
          error={errors.unitCost?.message}
        />

        {/* Expiry Date */}
        <Input
          id="expiryDate"
          label="Expiry Date (if applicable)"
          type="date"
          {...register('expiryDate')}
          error={errors.expiryDate?.message}
        />

        {/* Location */}
        <Input
          id="location"
          label="Storage Location"
          placeholder="e.g., Room 101, Cabinet A"
          {...register('location')}
          error={errors.location?.message}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Supplier Information */}
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
          <div className="ml-auto">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-900"
              onClick={() => setShowSupplierFields(!showSupplierFields)}
            >
              {showSupplierFields ? 'Hide Supplier Fields' : 'Add Supplier Details'}
            </button>
          </div>
        </div>

        {showSupplierFields && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="supplier.name"
                label="Supplier Name"
                {...register('supplier.name')}
                error={errors.supplier?.name?.message}
              />

              <Input
                id="supplier.contactPerson"
                label="Contact Person"
                {...register('supplier.contactPerson')}
                error={errors.supplier?.contactPerson?.message}
              />

              <Input
                id="supplier.phone"
                label="Phone Number"
                {...register('supplier.phone')}
                error={errors.supplier?.phone?.message}
              />

              <Input
                id="supplier.email"
                label="Email"
                type="email"
                {...register('supplier.email')}
                error={errors.supplier?.email?.message}
              />
            </div>

            <div>
              <label htmlFor="supplier.address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="supplier.address"
                {...register('supplier.address')}
                rows={2}
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
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

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryItemForm;