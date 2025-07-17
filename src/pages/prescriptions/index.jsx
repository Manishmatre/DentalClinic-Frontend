import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrescriptionDetailPage from './PrescriptionDetailPage';

const PrescriptionRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<div>Prescription Dashboard</div>} />
      <Route path=":id" element={<PrescriptionDetailPage />} />
    </Routes>
  );
};

export default PrescriptionRoutes;
