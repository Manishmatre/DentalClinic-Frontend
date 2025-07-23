import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import dentalProcedureService from '../../api/dental/dentalProcedureService';
import inventoryService from '../../api/inventory/inventoryService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import InventoryItemSelector from '../inventory/InventoryItemSelector';

// Validation schema
const procedureSchema = z.object({
  name: z.string().min(1, 'Procedure name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  patient: z.string().min(1, 'Patient is required'),
  dentist: z.string().min(1, 'Dentist is required'),
  date: z.date(),
  duration: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.string().min(1, 'Status is required')
});

const DentalProcedureForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  error,
  patients,
  dentists
}) => {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemError, setItemError] = useState(null);

  // Form setup
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm({
    resolver: zodResolver(procedureSchema),
    defaultValues: initialData || {
      name: '',
      category: '',
      description: '',
      patient: '',
      dentist: user?._id || '',
      date: new Date(),
      duration: 30,
      notes: '',
      status: 'Scheduled'
    }
  });

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        patient: initialData.patient?._id || initialData.patient || '',
        dentist: initialData.dentist?._id || initialData.dentist || user?._id || ''
      });

      // Set selected inventory items if available
      if (initialData.inventoryItems && initialData.inventoryItems.length > 0) {
        setSelectedItems(initialData.inventoryItems.map(item => ({
          ...item,
          itemId: item.item._id || item.item,
          name: item.item.name || '',
          category: item.item.category || ''
        })));
      }
    }
  }, [initialData, reset, user]);

  // No need to fetch inventory items here as InventoryItemSelector handles it

  // Handle adding an inventory item to the procedure
  const handleAddItem = (item, quantity) => {
    // Check if item is already selected
    const existingItem = selectedItems.find(i => i.itemId === item._id);
    
    if (existingItem) {
      // Update quantity if already selected
      setSelectedItems(selectedItems.map(i => 
        i.itemId === item._id 
          ? { 
              ...i, 
              quantity: i.quantity + quantity,
              totalCost: (i.quantity + quantity) * item.unitCost
            } 
          : i
      ));
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item._id,
          name: item.name,
          category: item.category,
          quantity,
          unitCost: item.unitCost,
          totalCost: quantity * item.unitCost
        }
      ]);
    }
  };

  // Handle removing an inventory item
  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  // Handle updating an inventory item quantity
  const handleUpdateQuantity = (itemId, quantity) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.itemId === itemId) {
        return {
          ...item,
          quantity,
          totalCost: quantity * item.unitCost
        };
      }
      return item;
    }));
  };

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Format inventory items for submission
    const inventoryItemsForSubmission = selectedItems.map(item => ({
      item: item.itemId,
      quantity: item.quantity
    }));

    // Submit form data with inventory items
    onSubmit({
      ...data,
      inventoryItems: inventoryItemsForSubmission
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 scrollbar-none" style={{ maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {error && <Alert variant="error" title="Error" message={error} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Procedure Name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Procedure Name *"
              {...field}
              error={errors.name?.message}
            />
          )}
        />

        {/* Category */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Category *"
              options={dentalProcedureService.getProcedureCategories().map(cat => ({
                value: cat,
                label: cat
              }))}
              {...field}
              error={errors.category?.message}
            />
          )}
        />

        {/* Patient */}
        <Controller
          name="patient"
          control={control}
          render={({ field }) => (
            <Select
              label="Patient *"
              options={Array.isArray(patients) ? patients.map(patient => ({
                value: patient._id,
                label: `${patient.firstName} ${patient.lastName}`
              })) : []}
              {...field}
              error={errors.patient?.message}
            />
          )}
        />

        {/* Dentist */}
        <Controller
          name="dentist"
          control={control}
          render={({ field }) => (
            <Select
              label="Dentist *"
              options={Array.isArray(dentists) ? dentists.map(dentist => ({
                value: dentist._id,
                label: `${dentist.firstName} ${dentist.lastName}`
              })) : []}
              {...field}
              error={errors.dentist?.message}
            />
          )}
        />

        {/* Date */}
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date *"
              selected={field.value}
              onChange={field.onChange}
              error={errors.date?.message}
            />
          )}
        />

        {/* Duration */}
        <Controller
          name="duration"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <Input
              label="Duration (minutes)"
              type="number"
              min="0"
              onChange={e => onChange(parseInt(e.target.value) || 0)}
              value={value}
              {...field}
              error={errors.duration?.message}
            />
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status *"
              options={dentalProcedureService.getProcedureStatuses().map(status => ({
                value: status,
                label: status
              }))}
              {...field}
              error={errors.status?.message}
            />
          )}
        />
      </div>

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            label="Description"
            {...field}
            error={errors.description?.message}
          />
        )}
      />

      {/* Notes */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Input
            label="Notes"
            {...field}
            multiline
            rows={3}
            error={errors.notes?.message}
          />
        )}
      />

      {/* Inventory Items Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Inventory Items Used</h3>
        
        {/* Search and add items */}
        <div className="mb-4">
          {itemError && <Alert variant="error" message={itemError} className="mb-2" />}
          
          {/* Item selector */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium mb-2">Select Items to Add</h4>
            
            <InventoryItemSelector
              onItemSelect={handleAddItem}
              selectedItems={selectedItems.map(item => ({ itemId: item.itemId }))}
              excludeIds={[]}
            />
          </div>
        </div>
        
        {/* Selected items */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Selected Items</h4>
          
          {selectedItems.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-md">
              No items selected
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateQuantity(item.itemId, parseInt(e.target.value) || 1)}
                          className="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventoryService.formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventoryService.formatCurrency(item.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      Total Cost:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inventoryService.formatCurrency(
                        selectedItems.reduce((sum, item) => sum + item.totalCost, 0)
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
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
          loading={isLoading}
        >
          {initialData ? 'Update Procedure' : 'Create Procedure'}
        </Button>
      </div>
    </form>
  );
};

export default DentalProcedureForm;
