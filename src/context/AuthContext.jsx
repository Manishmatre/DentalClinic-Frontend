// src/context/AuthContext.jsx
import { createContext, useContext } from 'react';

// Create the authentication context
export const AuthContext = createContext(null);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// The actual AuthProvider component is defined in AuthProvider.jsx and uses this context
