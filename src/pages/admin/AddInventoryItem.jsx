import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import InventoryItemForm from '../../components/inventory/InventoryItemForm';
import inventoryService from '../../services/inventoryService';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddItem = async (itemData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await inventoryService.createInventoryItem(itemData);
      setSuccess('Inventory item added successfully!');
      setTimeout(() => navigate('/admin/inventory'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800">Add New Inventory Item</h1>
      <p className="text-gray-600 mb-6">Add a new item to your inventory. Fill in the details below.</p>
      {error && <Alert variant="error" message={error} className="mb-4" />}
      {success && <Alert variant="success" message={success} className="mb-4" />}
        <InventoryItemForm onSubmit={handleAddItem} isLoading={loading} />
    </div>
  );
};

export default AddInventoryItem;
