import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import InventoryItemForm from '../../components/inventory/InventoryItemForm';
import AdminLayout from '../../layouts/AdminLayout';

const EditInventoryItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryService.getInventoryItemById(id);
        setItem(data);
      } catch (err) {
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await inventoryService.updateInventoryItem(id, formData);
      navigate('/admin/InventoryManagement');
    } catch (err) {
      setError('Failed to update item');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Inventory Item</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <InventoryItemForm initialValues={item} onSubmit={handleSubmit} isEdit />
        )}
      </div>
    </AdminLayout>
  );
};

export default EditInventoryItem; 