// src/pages/auth/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // For linking back

const Unauthorized = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
      {/* Optional: Add links to navigate away */}
      <Link to="/">Go to Homepage</Link>
      {/* Or maybe a link back if 'from' state exists? */}
    </div>
  );
};

export default Unauthorized;
