import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/custom.css';
import { FaTooth } from 'react-icons/fa';

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="main-container min-h-screen flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <FaTooth className="h-8 w-8 text-indigo-600" />
              <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">DentalOS.AI</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'Admin' && (
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
                  )}
                  {user?.role === 'Doctor' && (
                    <Link to="/doctor/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
                  )}
                  {user?.role === 'Receptionist' && (
                    <Link to="/receptionist/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
                  )}
                  {user?.role === 'Patient' && (
                    <Link to="/patient/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
                  )}
                  {!['Admin', 'Doctor', 'Receptionist', 'Patient'].includes(user?.role) && (
                    <Link to="/" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
                  )}
                  <button onClick={logout} className="btn-primary-gradient text-white px-4 py-1 rounded-md text-sm font-semibold shadow">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-700 font-medium">Login</Link>
                  <Link to="/register" className="btn-primary-gradient text-white px-4 py-1 rounded-md text-sm font-semibold shadow">Register</Link>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center">
              <button className="mobile-menu-button outline-none" onClick={toggleMobileMenu}>
                <svg className="w-6 h-6 text-gray-500 hover:text-blue-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
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
      <section className="header-gradient text-white py-20 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">Dental Clinic Management System</h1>
          <p className="text-xl mb-8 font-medium opacity-90">Streamline your dental clinic operations with our comprehensive management solution</p>
          {!isAuthenticated && (
            <div className="space-x-4 flex justify-center">
              <Link to="/login" className="btn-primary-gradient text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transition">Log In</Link>
              <Link to="/register" className="btn-success-gradient text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transition">Register</Link>
            </div>
          )}
        </div>
      </section>
      {/* Main Content */}
      <div className="container mx-auto py-12 flex-1">
        {isAuthenticated ? (
          <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl mx-auto mt-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-blue-700">Welcome, {user?.name}!</h2>
            <p className="text-gray-500 mb-2 text-lg">Role: <span className="font-semibold text-blue-600">{user?.role}</span></p>
            <p className="mb-8 text-gray-700">Access your dashboard to manage dental clinic operations.</p>
            <div className="space-y-4">
              {user?.role === 'Admin' && (
                <Link to="/admin/dashboard" className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:scale-105 transition">Go to Admin Dashboard <span className="ml-1">→</span></Link>
              )}
              {user?.role === 'Doctor' && (
                <Link to="/doctor/dashboard" className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:scale-105 transition">Go to Doctor Dashboard <span className="ml-1">→</span></Link>
              )}
              {user?.role === 'Receptionist' && (
                <Link to="/receptionist/dashboard" className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:scale-105 transition">Go to Receptionist Dashboard <span className="ml-1">→</span></Link>
              )}
              {user?.role === 'Patient' && (
                <Link to="/patient/dashboard" className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:scale-105 transition">Go to Patient Dashboard <span className="ml-1">→</span></Link>
              )}
              {!['Admin', 'Doctor', 'Receptionist', 'Patient'].includes(user?.role) && (
                <div>
                  <p className="text-red-600 mb-2">Role-specific dashboard not found.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/admin/dashboard" className="btn-primary-gradient text-white px-4 py-2 rounded shadow text-center">Admin Dashboard</Link>
                    <Link to="/doctor/dashboard" className="btn-primary-gradient text-white px-4 py-2 rounded shadow text-center">Doctor Dashboard</Link>
                    <Link to="/receptionist/dashboard" className="btn-primary-gradient text-white px-4 py-2 rounded shadow text-center">Receptionist Dashboard</Link>
                    <Link to="/patient/dashboard" className="btn-primary-gradient text-white px-4 py-2 rounded shadow text-center">Patient Dashboard</Link>
                  </div>
                </div>
              )}
            </div>
            <button onClick={logout} className="mt-8 btn-primary-gradient text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:scale-105 transition">Logout</button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">Our Comprehensive Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-calendar-check"></i></div>
                <h3 className="text-xl font-bold mb-2">Appointment Management</h3>
                <p className="text-gray-500">Schedule and manage appointments efficiently with automated reminders.</p>
              </div>
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-user-injured"></i></div>
                <h3 className="text-xl font-bold mb-2">Patient Records</h3>
                <p className="text-gray-500">Securely store and access patient information and medical history.</p>
              </div>
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-pills"></i></div>
                <h3 className="text-xl font-bold mb-2">Inventory Management</h3>
                <p className="text-gray-500">Track supplies, medications, and equipment with automatic reorder alerts.</p>
              </div>
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-file-invoice-dollar"></i></div>
                <h3 className="text-xl font-bold mb-2">Billing & Payments</h3>
                <p className="text-gray-500">Streamline billing processes and manage payments efficiently.</p>
              </div>
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-chart-line"></i></div>
                <h3 className="text-xl font-bold mb-2">Reporting & Analytics</h3>
                <p className="text-gray-500">Generate comprehensive reports to analyze clinic performance.</p>
              </div>
              <div className="bg-white card-hover shadow-xl rounded-2xl p-8 text-center">
                <div className="text-blue-600 text-5xl mb-4"><i className="fas fa-notes-medical"></i></div>
                <h3 className="text-xl font-bold mb-2">Electronic Health Records</h3>
                <p className="text-gray-500">Maintain digital patient records with secure access controls.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12 shadow-inner">
        <div className="container mx-auto text-center">
          <p className="text-lg font-semibold">&copy; {new Date().getFullYear()} Dental Clinic Management System</p>
          <div className="space-x-6 mt-3">
            <a href="#about" className="text-gray-400 hover:text-white text-base">About</a>
            <a href="#contact" className="text-gray-400 hover:text-white text-base">Contact</a>
            <a href="#privacy" className="text-gray-400 hover:text-white text-base">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
