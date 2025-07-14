import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import NotificationBell from '../components/notifications/NotificationBell';
import { useAuth } from '../context/AuthContext';
// Import custom styles
import '../styles/custom.css';

// Doctor Navigation Component
const DoctorNav = ({ user, clinic }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = profileRef; // Alias for consistency
  
  // Handle clicks outside of profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <nav className="header-gradient px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        {/* Logo and Clinic Name */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {clinic?.name || 'Dental Clinic'}
            </h1>
            <div className="flex items-center">
              <span className="text-xs text-indigo-100">Doctor Dashboard</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-white bg-opacity-20 text-white placeholder-indigo-100 rounded-full py-1 px-4 pl-9 focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-30 transition-all duration-300"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-100 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Notifications Bell - Cross-Role Communication */}
        <div className="relative">
          <NotificationBell />
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="relative flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="text-indigo-600 text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">Dr. {user?.name}</div>
                <div className="text-xs text-indigo-100">{user?.specialization || 'Doctor'}</div>
              </div>
              <svg className={`w-5 h-5 text-indigo-100 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm text-gray-700 font-medium truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <Link
                  to="/doctor/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/doctor/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </Link>
              </div>

              {/* Logout Section */}
              <div className="py-1 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Doctor Sidebar Component
const DoctorSidebar = ({ clinic, collapsed, setCollapsed }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);
  
  // Icons for menu items (using SVG for professional look)
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    patient: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    treatment: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    billing: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    staff: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dental: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    tooth: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    dentalImaging: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    dentalHistory: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    prescription: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  // Group menu items by category
  const menuCategories = [
    {
      title: 'Main',
      items: [
        { path: '/doctor/dashboard', label: 'Dashboard', icon: icons.dashboard },
        { path: '/doctor/appointment-management', label: 'Appointments', icon: icons.calendar },
      ]
    },
    {
      title: 'Patient Care',
      items: [
        { path: '/doctor/patients', label: 'Patient Records', icon: icons.patient },
        { path: '/doctor/treatments', label: 'Treatment Plans', icon: icons.treatment },
        { path: '/doctor/prescriptions', label: 'Prescriptions', icon: icons.prescription },
        { path: '/doctor/dental-management', label: 'Dental Management', icon: icons.dental },
        { path: '/doctor/dental-billing', label: 'Dental Billing', icon: icons.billing },
      ]
    },
    {
      title: 'Dental Services',
      items: [
        { path: '/doctor/dental-management', label: 'Dental EHR', icon: icons.dental },
        { path: '/doctor/patient/:patientId/dental', label: 'Tooth Chart', icon: icons.tooth },
        { path: '/doctor/dental-imaging', label: 'Dental Imaging', icon: icons.dentalImaging },
        { path: '/doctor/dental-treatments', label: 'Treatment History', icon: icons.dentalHistory },
        { path: '/doctor/dental-billing', label: 'Dental Billing', icon: icons.billing },
        { path: '/dental/chairs', label: 'Chair Management', icon: icons.dental }, // Added chair management link
      ]
    },
    {
      title: 'Administration',
      items: [
        { path: '/doctor/billing-management', label: 'Billing & Payments', icon: icons.billing },
        { path: '/doctor/staff-directory', label: 'Staff Directory', icon: icons.staff },
      ]
    }
  ];

  return (
    <div className={`h-full sidebar-gradient sidebar-transition ${collapsed ? 'w-16' : 'w-64'}`} style={{width: collapsed ? '4rem' : '16rem'}}>
      {/* Sidebar Header with Toggle */}
      <div className="flex items-center justify-end px-4 py-3 border-b border-indigo-100">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 focus:outline-none transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      <div className="py-4 overflow-y-auto h-[calc(100%-56px)] scrollbar-styled">
        {/* Navigation Menu - Categorized */}
        <div className="space-y-4 mb-6">
          {menuCategories.map((category, index) => (
            <div key={index} className="space-y-1">
              {!collapsed && (
                <h3 className="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  {category.title}
                </h3>
              )}
              {category.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md'
                      : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                  }`}
                >
                  <span className={`${collapsed ? '' : 'mr-3'} text-current`}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {!collapsed && (
          <div className="px-4 mb-6">
            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
              <h3 className="text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today's Schedule
              </h3>
              <p className="mt-1 text-sm font-semibold">
                You have 5 appointments today
              </p>
              <p className="mt-1 text-xs text-indigo-100">
                Next: John Doe at 2:00 PM
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main DoctorLayout Component
const DoctorLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Create wrapped components with shared state
  const SidebarWithState = (props) => (
    <DoctorSidebar 
      {...props} 
      collapsed={sidebarCollapsed} 
      setCollapsed={setSidebarCollapsed} 
    />
  );

  return (
    <BaseLayout
      navbar={DoctorNav}
      sidebar={SidebarWithState}
      sidebarCollapsed={sidebarCollapsed}
    />
  );
};

export default DoctorLayout;