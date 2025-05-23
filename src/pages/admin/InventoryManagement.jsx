import React from 'react';
import { useAuth } from '../../context/AuthContext';
import InventoryManagement from '../../components/inventory/InventoryManagement';
import AdminLayout from '../../layouts/AdminLayout';

const InventoryManagementPage = () => {
  const { auth } = useAuth();

  return (
    <AdminLayout>
      <InventoryManagement />
    </AdminLayout>
  );
};

export default InventoryManagementPage;
