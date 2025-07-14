import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Select from '../ui/Select';

// Zod schema for validation
const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  brand: z.string().optional(),
  batchNumber: z.string().optional(),
  category: z.enum([
    'Consumables',
    'Implants',
    'Medicines',
    'Disposables',
    'Lab Materials',
    'Composite',
    'Cement',
    'Impression Material',
    'Endo Files',
    'Burs',
    'Sutures',
    'Dental Material',
    'Dental Instrument',
    'Dental Equipment',
    'Medication',
    'Office Supply',
    'Sterilization Supply',
    'Other',
  ]),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  currentQuantity: z.number().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative').optional(),
  idealQuantity: z.number().min(0, 'Ideal quantity cannot be negative').optional(),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  gst: z.number().min(0, 'GST must be at least 0%').max(28, 'GST cannot exceed 28%').optional(),
  hsnCode: z.string().optional(),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
  age: z.number().min(0, 'Age cannot be negative').optional(),
  dentalSpecific: z
    .object({
      shade: z.string().optional(),
      size: z.string().optional(),
      sterilizable: z.boolean().optional(),
      expiryNotificationDays: z.number().min(0).optional(),
    })
    .optional(),
  supplier: z
    .object({
      name: z.string().optional(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Invalid email').optional().or(z.literal('')),
      address: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

const InventoryItemForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  error = null,
}) => {
  const [showSupplierFields, setShowSupplierFields] = useState(
    initialData?.supplier?.name ? true : false
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: initialData || {
      name: '',
      brand: '',
      batchNumber: '',
      category: 'Consumables',
      description: '',
      unitOfMeasure: '',
      currentQuantity: 0,
      reorderLevel: 10,
      idealQuantity: 50,
      unitCost: 0,
      gst: 0,
      hsnCode: '',
      expiryDate: '',
      location: '',
      age: '',
      dentalSpecific: {
        shade: '',
        size: '',
        sterilizable: false,
        expiryNotificationDays: 30,
      },
      supplier: {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
      },
      notes: '',
    },
  });

  // Example supplier list (replace with real data/fetch in production)
  const supplierOptions = [
    { id: 1, name: 'MedSupply Co.' },
    { id: 2, name: 'DentalPro' },
  ];
  const [selectedSupplier, setSelectedSupplier] = useState(initialData?.supplier || '');

  // Dropdown options
  const unitOptions = ['box', 'pack', 'piece', 'bottle', 'tube', 'strip', 'tablet', 'vial', 'ampoule', 'sachet', 'kit', 'set', 'other'];
  const locationOptions = ['Main Store', 'Room 101', 'Cabinet A', 'Pharmacy', 'Lab', 'other'];
  const brandOptions = ['Colgate', 'Dentsply', '3M', 'GC', 'Ivoclar', 'other'];
  const shadeOptions = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'D2', 'other'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'other'];
  const [customBrand, setCustomBrand] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customShade, setCustomShade] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [unitOfMeasure, setUnitOfMeasure] = useState(initialData?.unitOfMeasure || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [shade, setShade] = useState(initialData?.dentalSpecific?.shade || '');
  const [size, setSize] = useState(initialData?.dentalSpecific?.size || '');

  const handleFormSubmit = (data) => {
    // Format date fields
    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate);
    }
    // Set supplier from dropdown
    data.supplier = selectedSupplier;
    // Set brand, unit, location, shade, size from dropdowns/custom
    data.brand = brand === 'other' ? customBrand : brand;
    data.unitOfMeasure = unitOfMeasure === 'other' ? customUnit : unitOfMeasure;
    data.location = location === 'other' ? customLocation : location;
    if (!data.dentalSpecific) data.dentalSpecific = {};
    data.dentalSpecific.shade = shade === 'other' ? customShade : shade;
    data.dentalSpecific.size = size === 'other' ? customSize : size;
    // Ensure dentalSpecific fields are properly formatted
    if (data.dentalSpecific) {
      if (typeof data.dentalSpecific.expiryNotificationDays === 'string') {
        data.dentalSpecific.expiryNotificationDays = parseInt(
          data.dentalSpecific.expiryNotificationDays,
          10
        ) || 30;
      }
      data.dentalSpecific.sterilizable = !!data.dentalSpecific.sterilizable;
    }
    // Ensure age is a number
    if (typeof data.age === 'string') {
      data.age = parseInt(data.age, 10) || 0;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
      {error && <Alert variant="error" title="Error" message={error} />}

      {/* General Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
            <Input id="name" placeholder="Enter item name" {...register('name')} error={errors.name?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Brand (dropdown + custom) */}
          <div>
            <Select label="Brand" id="brand" value={brand} onChange={e => setBrand(e.target.value)} error={errors.brand?.message} required>
              <option value="">Select Brand</option>
              {brandOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'other' ? 'Other (specify)' : opt}</option>
              ))}
            </Select>
            {brand === 'other' && (
              <Input
                id="customBrand"
                placeholder="Enter custom brand"
                value={customBrand}
                onChange={e => setCustomBrand(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
          {/* Batch Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
            <Input id="batchNumber" placeholder="e.g., BN12345" {...register('batchNumber')} error={errors.batchNumber?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Category */}
          <div>
            <Select id="category" label="Category" required error={errors.category?.message} {...register('category')} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select Category</option>
              <option value="Consumables">Consumables</option>
              <option value="Implants">Implants</option>
              <option value="Medicines">Medicines</option>
              <option value="Disposables">Disposables</option>
              <option value="Lab Materials">Lab Materials</option>
              <option value="Composite">Composite</option>
              <option value="Cement">Cement</option>
              <option value="Impression Material">Impression Material</option>
              <option value="Endo Files">Endo Files</option>
              <option value="Burs">Burs</option>
              <option value="Sutures">Sutures</option>
              <option value="Dental Material">Dental Material</option>
              <option value="Dental Instrument">Dental Instrument</option>
              <option value="Dental Equipment">Dental Equipment</option>
              <option value="Medication">Medication</option>
              <option value="Office Supply">Office Supply</option>
              <option value="Sterilization Supply">Sterilization Supply</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          {/* Supplier Dropdown */}
          <div>
            <Select label="Supplier" id="supplier" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} error={errors.supplier?.name?.message} required>
              <option value="">Select Supplier</option>
              {supplierOptions.map(sup => (
                <option key={sup.id} value={sup.name}>{sup.name}</option>
              ))}
            </Select>
          </div>
          {/* Unit of Measure (dropdown + custom) */}
          <div>
            <Select label="Unit of Measure" id="unitOfMeasure" value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} error={errors.unitOfMeasure?.message} required>
              <option value="">Select Unit</option>
              {unitOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'other' ? 'Other (specify)' : opt}</option>
              ))}
            </Select>
            {unitOfMeasure === 'other' && (
              <Input
                id="customUnit"
                placeholder="Enter custom unit"
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
          {/* Current Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Quantity <span className="text-red-500">*</span></label>
            <Input id="currentQuantity" type="number" min={0} {...register('currentQuantity', { valueAsNumber: true })} error={errors.currentQuantity?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Reorder Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reorder Level</label>
            <Input id="reorderLevel" type="number" min={0} {...register('reorderLevel', { valueAsNumber: true })} error={errors.reorderLevel?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Ideal Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ideal Quantity</label>
            <Input id="idealQuantity" type="number" min={0} {...register('idealQuantity', { valueAsNumber: true })} error={errors.idealQuantity?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Unit Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Cost <span className="text-red-500">*</span></label>
            <Input id="unitCost" type="number" min={0} step={0.01} {...register('unitCost', { valueAsNumber: true })} error={errors.unitCost?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* GST */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">GST (%)</label>
            <Input id="gst" type="number" min={0} max={28} {...register('gst', { valueAsNumber: true })} error={errors.gst?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* HSN Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">HSN Code</label>
            <Input id="hsnCode" placeholder="e.g., 3004" {...register('hsnCode')} error={errors.hsnCode?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} error={errors.expiryDate?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* Storage Location (dropdown + custom) */}
          <div>
            <Select label="Storage Location" id="location" value={location} onChange={e => setLocation(e.target.value)} error={errors.location?.message} required>
              <option value="">Select Location</option>
              {locationOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'other' ? 'Other (specify)' : opt}</option>
              ))}
            </Select>
            {location === 'other' && (
              <Input
                id="customLocation"
                placeholder="Enter custom location"
                value={customLocation}
                onChange={e => setCustomLocation(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
          {/* Age (months) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Age (months)</label>
            <Input id="age" type="number" min={0} {...register('age', { valueAsNumber: true })} error={errors.age?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
        {/* Description */}
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea id="description" {...register('description')} rows={3} className="block w-full rounded border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      {/* Dental-Specific Information */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Dental-Specific Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shade (dropdown + custom) */}
          <div>
            <Select label="Shade" id="shade" value={shade} onChange={e => setShade(e.target.value)} error={errors.dentalSpecific?.shade?.message} required>
              <option value="">Select Shade</option>
              {shadeOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'other' ? 'Other (specify)' : opt}</option>
              ))}
            </Select>
            {shade === 'other' && (
              <Input
                id="customShade"
                placeholder="Enter custom shade"
                value={customShade}
                onChange={e => setCustomShade(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
          {/* Size (dropdown + custom) */}
          <div>
            <Select label="Size" id="size" value={size} onChange={e => setSize(e.target.value)} error={errors.dentalSpecific?.size?.message} required>
              <option value="">Select Size</option>
              {sizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'other' ? 'Other (specify)' : opt}</option>
              ))}
            </Select>
            {size === 'other' && (
              <Input
                id="customSize"
                placeholder="Enter custom size"
                value={customSize}
                onChange={e => setCustomSize(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Notification Days</label>
            <Input id="dentalSpecific.expiryNotificationDays" type="number" min={0} {...register('dentalSpecific.expiryNotificationDays', { valueAsNumber: true })} error={errors.dentalSpecific?.expiryNotificationDays?.message} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-center mt-6">
            <input id="dentalSpecific.sterilizable" type="checkbox" {...register('dentalSpecific.sterilizable')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="dentalSpecific.sterilizable" className="ml-2 block text-sm text-gray-700">Sterilizable Item</label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
        <textarea id="notes" {...register('notes')} rows={3} className="block w-full rounded border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" className="px-6 py-2 text-lg font-semibold rounded shadow bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryItemForm;
