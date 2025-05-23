import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/custom.css';

// Receptionist Navigation Component
const ReceptionistNav = ({ user, clinic }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Handle clicks outside of profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock notifications
  const notifications = [
    { id: 1, text: 'New patient registered', time: '5 min ago', read: false },
    { id: 2, text: 'Appointment rescheduled', time: '1 hour ago', read: false },
    { id: 3, text: 'Staff meeting at 3 PM', time: '3 hours ago', read: true }
  ];
  
  return (
    <nav className="header-gradient px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        {/* Logo and Clinic Name */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{clinic?.name || 'Dental Clinic'}</h1>
            <p className="text-xs text-indigo-100">Receptionist Portal</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="ml-8 relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-64 px-4 py-2 rounded-full bg-white bg-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40"
          />
          <button className="absolute right-3 top-2.5 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Cross-Role Notification System */}
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
                  {user?.name?.charAt(0).toUpperCase() || 'R'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">{user?.name || 'Receptionist'}</div>
                <div className="text-xs text-indigo-100">Front Desk</div>
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
                <p className="text-sm text-gray-700 font-medium truncate">{user?.email || 'receptionist@clinic.com'}</p>
                <p className="text-xs text-gray-500 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <Link
                  to="/receptionist/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/receptionist/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </Link>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
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

// Receptionist Sidebar Component
const ReceptionistSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);
  
  // Icons for menu items (using SVG for professional look)
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    schedule: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    patient: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    appointment: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    newPatient: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    )
  };

  // Group menu items by category
  const menuCategories = [
    {
      title: 'Main',
      items: [
        { path: '/receptionist/dashboard', label: 'Dashboard', icon: icons.dashboard },
        { path: '/receptionist/appointments', label: 'Schedule', icon: icons.schedule },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/receptionist/patients', label: 'Patient List', icon: icons.patient },
        { path: '/receptionist/patients/register', label: 'Register Patient', icon: icons.newPatient },
        { path: '/receptionist/billing-management', label: 'Billing & Payments', icon: icons.billing },
        { path: '/receptionist/staff-directory', label: 'Staff Directory', icon: icons.staff },
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
          <div className="px-4 mt-8">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                className="flex items-center justify-center px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                onClick={() => window.location.href = '/receptionist/appointments/new'}
              >
                {icons.appointment}
                <span className="ml-2">New Appointment</span>
              </button>
              <button
                className="flex items-center justify-center px-4 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 transition-all duration-200 mt-2"
                onClick={() => window.location.href = '/receptionist/patients/register'}
              >
                {icons.newPatient}
                <span className="ml-2">New Patient</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main ReceptionistLayout Component
const ReceptionistLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <BaseLayout
      navbar={props => <ReceptionistNav {...props} />}
      sidebar={props => <ReceptionistSidebar {...props} collapsed={collapsed} setCollapsed={setCollapsed} />}
      sidebarCollapsed={collapsed}
    />
  );
};

export default ReceptionistLayout;