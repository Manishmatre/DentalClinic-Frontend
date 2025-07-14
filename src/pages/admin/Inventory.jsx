import React from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import InventoryManagement from '../../components/inventory/InventoryManagement';

const Inventory = () => {
  // Match exactly /admin/inventory (no trailing slash)
  const match = useMatch('/admin/inventory');
  const isBaseInventory = !!match && match.pathname === '/admin/inventory';
  return (
    <>
      {isBaseInventory && <InventoryManagement />}
      <Outlet />
    </>
  );
};

export default Inventory;