import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import AdminLayout from '../../layouts/AdminLayout';

const ViewInventoryItem = () => {
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

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-8">
        <button className="mb-4 text-blue-600 hover:underline" onClick={() => navigate('/admin/InventoryManagement')}>
          &larr; Back to Inventory
        </button>
        <h1 className="text-2xl font-bold mb-6">View Inventory Item</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : item ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4"><strong>Name:</strong> {item.name}</div>
            <div className="mb-4"><strong>Category:</strong> {item.category}</div>
            <div className="mb-4"><strong>Supplier:</strong> {item.supplier}</div>
            <div className="mb-4"><strong>Quantity:</strong> {item.quantity}</div>
            <div className="mb-4"><strong>Minimum Stock:</strong> {item.minimumStock}</div>
            <div className="mb-4"><strong>Expiry Date:</strong> {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</div>
            <div className="mb-4"><strong>Description:</strong> {item.description || 'N/A'}</div>
            {/* Add more fields as needed */}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default ViewInventoryItem; 