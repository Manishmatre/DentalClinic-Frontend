import React, { lazy } from 'react';
import AdminLayout from '../layouts/AdminLayout';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const ClinicSettingsPage = lazy(() => import('../pages/admin/ClinicSettingsPage'));
const StaffManagement = lazy(() => import('../pages/admin/ManageStaff'));
const AdminAppointments = lazy(() => import('../pages/admin/Appointments'));
const Patients = lazy(() => import('../pages/admin/Patients'));
const PatientDetails = lazy(() => import('../pages/admin/PatientDetails'));
const PatientForm = lazy(() => import('../pages/admin/PatientForm'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const RoleManagement = lazy(() => import('../pages/admin/RoleManagement'));

// Lazy load components that require subscription
const Inventory = lazy(() => import('../pages/admin/Inventory'));
const Reports = lazy(() => import('../pages/admin/Reports'));

const adminRoutes = {
  path: '/admin',
  element: AdminLayout,
  children: [
    {
      path: 'dashboard',
      element: Dashboard
    },
    {
      path: 'clinic-settings',
      element: ClinicSettingsPage
    },
    {
      path: 'staff',
      element: StaffManagement
    },
    {
      path: 'users',
      element: UserManagement
    },
    {
      path: 'roles',
      element: RoleManagement
    },
    {
      path: 'appointments',
      element: AdminAppointments
    },
    // Patient routes
    {
      path: 'patients',
      element: Patients
    },
    {
      path: 'patients/add',
      element: PatientForm
    },
    {
      path: 'patients/edit/:id',
      element: PatientForm
    },
    {
      path: 'patients/:id',
      element: PatientDetails
    },
    {
      path: 'inventory',
      element: Inventory,
      meta: {
        requiresSubscription: true,
        feature: 'inventory'
      }
    },
    {
      path: 'reports',
      element: Reports,
      meta: {
        requiresSubscription: true,
        feature: 'reports'
      }
    }
  ]
};

export default adminRoutes;