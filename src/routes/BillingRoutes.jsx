import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Billing Pages
import BillList from '../pages/billing/BillList';
import BillingDashboard from '../pages/billing/BillingDashboard';

// Auth
import ProtectedRoute from '../utils/ProtectedRoute';

const BillingRoutes = () => {
  return (
    <Routes>
      {/* Use requiredRoles instead of roles to match the utils/ProtectedRoute API */}
      <Route element={<ProtectedRoute requiredRoles={['Admin', 'Staff', 'Doctor', 'Receptionist']} />}>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/bills" element={<BillList />} />
      </Route>
    </Routes>
  );
};

export default BillingRoutes;
