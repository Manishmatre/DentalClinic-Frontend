import React, { useState, useEffect } from 'react';
import inventoryService from '../../api/inventory/inventoryService';
import Button from '../ui/Button';
import Input from '../ui/Input';

const DentalSupplierSelector = ({ 
  supplierData, 
  onSupplierChange,
  onCustomSupplierChange
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCustomSupplier, setIsCustomSupplier] = useState(!supplierData?.name || true); // Default to true until we load suppliers
  const [selectedSupplier, setSelectedSupplier] = useState(
    supplierData?.name ? supplierData.name : ''
  );

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryService.getDentalSuppliers();
        setSuppliers(data);
        
        // Update isCustomSupplier based on fetched suppliers
        if (supplierData?.name && data.some(s => s.name === supplierData.name)) {
          setIsCustomSupplier(false);
        }
      } catch (err) {
        console.error('Error fetching dental suppliers:', err);
        setError('Failed to load suppliers');
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [supplierData?.name]);

  // Handle selecting a predefined supplier
  const handleSupplierSelect = (e) => {
    const supplierName = e.target.value;
    setSelectedSupplier(supplierName);
    
    if (supplierName) {
      const supplier = suppliers.find(s => s.name === supplierName);
      if (supplier) {
        onSupplierChange({
          name: supplier.name,
          country: supplier.country || '',
          website: supplier.website || '',
          contactPerson: supplierData?.contactPerson || supplier.contactPerson || '',
          email: supplierData?.email || supplier.email || '',
          phone: supplierData?.phone || supplier.phone || '',
          address: supplierData?.address || supplier.address || ''
        });
      }
    } else {
      onSupplierChange({
        name: '',
        country: '',
        website: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: ''
      });
    }
  };

  // Handle toggling between predefined and custom supplier
  const toggleCustomSupplier = () => {
    setIsCustomSupplier(!isCustomSupplier);
    if (!isCustomSupplier) {
      setSelectedSupplier('');
      onSupplierChange({
        name: '',
        country: '',
        website: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: ''
      });
    }
  };

  // Handle custom supplier field changes
  const handleCustomFieldChange = (field, value) => {
    onCustomSupplierChange({
      ...supplierData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={toggleCustomSupplier}
        >
          {isCustomSupplier ? 'Use Predefined Supplier' : 'Add Custom Supplier'}
        </Button>
      </div>

      {isCustomSupplier ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="supplierName"
            label="Supplier Name *"
            value={supplierData?.name || ''}
            onChange={(e) => handleCustomFieldChange('name', e.target.value)}
            required
          />
          <Input
            id="supplierCountry"
            label="Country"
            value={supplierData?.country || ''}
            onChange={(e) => handleCustomFieldChange('country', e.target.value)}
          />
          <Input
            id="supplierWebsite"
            label="Website"
            value={supplierData?.website || ''}
            onChange={(e) => handleCustomFieldChange('website', e.target.value)}
          />
          <Input
            id="supplierContactPerson"
            label="Contact Person"
            value={supplierData?.contactPerson || ''}
            onChange={(e) => handleCustomFieldChange('contactPerson', e.target.value)}
          />
          <Input
            id="supplierEmail"
            label="Email"
            type="email"
            value={supplierData?.email || ''}
            onChange={(e) => handleCustomFieldChange('email', e.target.value)}
          />
          <Input
            id="supplierPhone"
            label="Phone"
            value={supplierData?.phone || ''}
            onChange={(e) => handleCustomFieldChange('phone', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              id="supplierAddress"
              label="Address"
              value={supplierData?.address || ''}
              onChange={(e) => handleCustomFieldChange('address', e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="supplierSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Supplier *
          </label>
          <select
            id="supplierSelect"
            value={selectedSupplier}
            onChange={handleSupplierSelect}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a supplier</option>
            {loading ? (
              <option disabled>Loading suppliers...</option>
            ) : error ? (
              <option disabled>Error loading suppliers</option>
            ) : (
              <>
                <optgroup label="Indian Suppliers">
                  {suppliers
                    .filter(s => s.country === 'India')
                    .map((supplier) => (
                      <option key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))
                  }
                </optgroup>
                <optgroup label="International Suppliers">
                  {suppliers
                    .filter(s => s.country !== 'India')
                    .map((supplier) => (
                      <option key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))
                  }
                </optgroup>
              </>
            )}
          </select>

          {selectedSupplier && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="supplierContactPerson"
                label="Contact Person"
                value={supplierData?.contactPerson || ''}
                onChange={(e) => handleCustomFieldChange('contactPerson', e.target.value)}
              />
              <Input
                id="supplierEmail"
                label="Email"
                type="email"
                value={supplierData?.email || ''}
                onChange={(e) => handleCustomFieldChange('email', e.target.value)}
              />
              <Input
                id="supplierPhone"
                label="Phone"
                value={supplierData?.phone || ''}
                onChange={(e) => handleCustomFieldChange('phone', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  id="supplierAddress"
                  label="Address"
                  value={supplierData?.address || ''}
                  onChange={(e) => handleCustomFieldChange('address', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DentalSupplierSelector;
