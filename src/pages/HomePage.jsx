import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">Clinic MS</Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'Admin' && (
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  )}
                  {user?.role === 'Doctor' && (
                    <Link to="/doctor/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  )}
                  {user?.role === 'Receptionist' && (
                    <Link to="/receptionist/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  )}
                  {user?.role === 'Patient' && (
                    <Link to="/patient/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  )}
                  {/* Fallback for any role */}
                  {!['Admin', 'Doctor', 'Receptionist', 'Patient'].includes(user?.role) && (
                    <Link to="/" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  )}
                  <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">Register</Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                className="mobile-menu-button outline-none" 
                onClick={toggleMobileMenu}
              >
                <svg className="w-6 h-6 text-gray-500 hover:text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`mobile-menu md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'Admin' && (
                  <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Dashboard</Link>
                )}
                {user?.role === 'Doctor' && (
                  <Link to="/doctor/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Dashboard</Link>
                )}
                {user?.role === 'Receptionist' && (
                  <Link to="/receptionist/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Dashboard</Link>
                )}
                {user?.role === 'Patient' && (
                  <Link to="/patient/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Dashboard</Link>
                )}
                {/* Fallback for any role */}
                {!['Admin', 'Doctor', 'Receptionist', 'Patient'].includes(user?.role) && (
                  <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Home</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Complete Clinic Management System</h1>
          <p className="text-lg mb-6">
            Streamline your clinic operations with our comprehensive management solution
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link to="/login" className="bg-white text-blue-600 px-6 py-2 rounded shadow hover:bg-gray-200">
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto py-10">
        {isAuthenticated ? (
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
            <p className="text-gray-600 mb-4">Role: {user?.role}</p>
            <p className="mb-6">Access your dashboard to manage clinic operations.</p>
            <div className="space-y-4">
              {user?.role === 'Admin' && (
                <Link to="/admin/dashboard" className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200">
                  Go to Admin Dashboard
                  <span className="ml-1">→</span>
                </Link>
              )}
              {user?.role === 'Doctor' && (
                <Link to="/doctor/dashboard" className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200">
                  Go to Doctor Dashboard
                  <span className="ml-1">→</span>
                </Link>
              )}
              {user?.role === 'Receptionist' && (
                <Link to="/receptionist/dashboard" className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200">
                  Go to Receptionist Dashboard
                  <span className="ml-1">→</span>
                </Link>
              )}
              {user?.role === 'Patient' && (
                <Link to="/patient/dashboard" className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200">
                  Go to Patient Dashboard
                  <span className="ml-1">→</span>
                </Link>
              )}
              {/* Fallback for any other role */}
              {!['Admin', 'Doctor', 'Receptionist', 'Patient'].includes(user?.role) && (
                <div>
                  <p className="text-red-600 mb-2">Role-specific dashboard not found.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/admin/dashboard" className="block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-center">
                      Admin Dashboard
                    </Link>
                    <Link to="/doctor/dashboard" className="block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-center">
                      Doctor Dashboard
                    </Link>
                    <Link to="/receptionist/dashboard" className="block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-center">
                      Receptionist Dashboard
                    </Link>
                    <Link to="/patient/dashboard" className="block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-center">
                      Patient Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <button onClick={logout} className="mt-6 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Our Comprehensive Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Appointment Management</h3>
                <p>Schedule and manage appointments efficiently with automated reminders.</p>
              </div>
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-user-injured"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Patient Records</h3>
                <p>Securely store and access patient information and medical history.</p>
              </div>
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-pills"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Inventory Management</h3>
                <p>Track supplies, medications, and equipment with automatic reorder alerts.</p>
              </div>
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Billing & Payments</h3>
                <p>Streamline billing processes and manage payments efficiently.</p>
              </div>
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Reporting & Analytics</h3>
                <p>Generate comprehensive reports to analyze clinic performance.</p>
              </div>
              <div className="bg-white shadow rounded p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className="fas fa-notes-medical"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Electronic Health Records</h3>
                <p>Maintain digital patient records with secure access controls.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Complete Clinic Management System</p>
          <div className="space-x-4 mt-2">
            <a href="#about" className="text-gray-400 hover:text-white">About</a>
            <a href="#contact" className="text-gray-400 hover:text-white">Contact</a>
            <a href="#privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
