import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import { useAuth } from '../context/AuthContext';
import { useResourceLimits } from '../hooks/useResourceLimits';
import NotificationBell from '../components/notifications/NotificationBell';
// Import custom styles
import '../styles/custom.css';

// Admin Navigation Component
const AdminNav = ({ user, clinic }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
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
              <span className="text-xs text-indigo-100">Admin Dashboard</span>
              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs text-white">
                {clinic?.subscriptionPlan || 'Free'} Plan
              </span>
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
        <div className="relative" ref={dropdownRef}>
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
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-indigo-100">{user?.role}</div>
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
                  to="/admin/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/admin/clinic-profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                  </svg>
                  Clinic Profile
                </Link>

                <Link
                  to="/admin/clinic-settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Clinic Settings
                </Link>

                <Link
                  to="/admin/notifications"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  Notifications
                </Link>
              </div>

              {/* Subscription Section */}
              <div className="py-1 border-t border-gray-100">
                <Link
                  to="/admin/subscription"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Manage Subscription
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

// Admin Sidebar Component
const AdminSidebar = ({ clinic, collapsed, setCollapsed }) => {
  const location = useLocation();
  const { limits } = useResourceLimits();
  const isActive = (path) => location.pathname.startsWith(path);
  
  // Icons for menu items (using SVG for professional look)
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    treatment: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
    staff: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    doctor: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    roles: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    patient: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    list: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    notification: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    billing: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    inventory: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    reports: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    financial: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    clinic: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    activate: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  // Group menu items by category for better organization
  const menuCategories = [
    {
      title: 'Dashboard',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard },
      ]
    },
    {
      title: 'Staff & Users',
      items: [
        { path: '/admin/staff', label: 'Staff List', icon: icons.staff },
        { path: '/admin/staff-management', label: 'Staff Management', icon: icons.doctor },
        { path: '/admin/roles', label: 'Role Management', icon: icons.roles },
      ]
    },
    {
      title: 'Patients & Appointments',
      items: [
        { path: '/admin/patients-management', label: 'Patient Management', icon: icons.patient },
        { path: '/admin/appointment-management', label: 'Appointment Calendar', icon: icons.calendar },
        { path: '/admin/appointment-list', label: 'Appointment List', icon: icons.list },
        { path: '/admin/appointment-requests', label: 'Appointment Requests', icon: icons.notification },
        { path: '/admin/appointment-settings', label: 'Appointment Settings', icon: icons.settings },
      ]
    },
    {
      title: 'Finance & Inventory',
      items: [
        { path: '/admin/billing-management', label: 'Billing & Payments', icon: icons.billing },
        { path: '/admin/inventory', label: 'Inventory', icon: icons.inventory },
      ]
    },
    {
      title: 'Dental Services',
      items: [
        { path: '/admin/dental-management', label: 'Dental EHR', icon: icons.treatment },
        { path: '/admin/patient/:patientId/dental', label: 'Tooth Chart', icon: icons.tooth },
        { path: '/admin/dental-imaging', label: 'Dental Imaging', icon: icons.dentalImaging },
        { path: '/admin/dental-treatments', label: 'Treatment History', icon: icons.dentalHistory },
        { path: '/admin/dental-billing', label: 'Dental Billing', icon: icons.billing },
      ]
    },
    {
      title: 'Reports & Analytics',
      items: [
        { path: '/admin/reports', label: 'Reports', icon: icons.reports },
        { path: '/admin/financial-reports', label: 'Financial Reports', icon: icons.financial },
      ]
    },
    {
      title: 'Clinic Settings',
      items: [
        { path: '/admin/clinic-profile', label: 'Clinic Profile', icon: icons.clinic },
        { path: '/admin/clinic-settings', label: 'Clinic Settings', icon: icons.settings },
        { path: '/admin/clinic-activation', label: 'Activate Clinic', icon: icons.activate },
      ]
    }
  ];
  
  // Flatten menu items for rendering
  const menuItems = menuCategories.flatMap(category => category.items);

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
          <>
            {/* Clinic Status */}
            <div className="px-4 mb-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
                <h3 className="text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Subscription Status
                </h3>
                <p className="mt-1 text-sm font-semibold">
                  {clinic?.subscription?.status === 'active' 
                    ? `${clinic?.subscriptionPlan} Plan (Active)`
                    : 'Requires Attention'
                  }
                </p>
                {clinic?.subscription?.endDate && (
                  <p className="mt-1 text-xs text-indigo-100">
                    Expires: {new Date(clinic.subscription.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="px-4">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resource Usage
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-medium">Doctors</span>
                    <span className="font-semibold">{limits?.doctors?.current || 0}/{limits?.doctors?.max || 0}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
                      style={{
                        width: `${((limits?.doctors?.current || 0) / (limits?.doctors?.max || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-medium">Patients</span>
                    <span className="font-semibold">{limits?.patients?.current || 0}/{limits?.patients?.max || 0}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
                      style={{
                        width: `${((limits?.patients?.current || 0) / (limits?.patients?.max || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main AdminLayout Component
const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Create wrapped components with shared state
  const SidebarWithState = (props) => (
    <AdminSidebar 
      {...props} 
      collapsed={sidebarCollapsed} 
      setCollapsed={setSidebarCollapsed} 
    />
  );

  return (
    <BaseLayout
      navbar={AdminNav}
      sidebar={SidebarWithState}
      sidebarCollapsed={sidebarCollapsed}
    />
  );
};

export default AdminLayout;