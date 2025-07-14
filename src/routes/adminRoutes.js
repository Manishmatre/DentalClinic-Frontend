import React, { lazy } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import EditInventoryItem from '../pages/admin/EditInventoryItem';
import ViewInventoryItem from '../pages/admin/ViewInventoryItem';
import MedicineManagement from '../pages/admin/MedicineManagement.jsx';
import FixedDentalEHR from '../pages/dental/FixedDentalEHR';

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

// Additional pages for complete navigation
const PatientManagement = lazy(() => import('../pages/admin/PatientManagement'));
const AppointmentManagement = lazy(() => import('../pages/admin/AppointmentManagement'));
const BillingManagement = lazy(() => import('../pages/admin/BillingManagement'));
const PrescriptionManagement = lazy(() => import('../pages/admin/PrescriptionManagement'));
const DentalManagement = lazy(() => import('../pages/admin/DentalManagement'));
const DentalImaging = lazy(() => import('../pages/admin/DentalImaging'));
const DentalTreatments = lazy(() => import('../pages/admin/DentalTreatments'));
const DentalBilling = lazy(() => import('../pages/admin/DentalBilling'));
const DentalProcedureSchedule = lazy(() => import('../pages/admin/DentalProcedureSchedule'));
const FinancialReports = lazy(() => import('../pages/admin/FinancialReports'));
const ClinicProfile = lazy(() => import('../pages/admin/ClinicProfile'));
const Subscription = lazy(() => import('../pages/admin/Subscription'));
const ManageSubscription = lazy(() => import('../pages/admin/ManageSubscription'));
const ClinicActivation = lazy(() => import('../pages/admin/ClinicActivation'));
const AddStaff = lazy(() => import('../pages/admin/AddStaff'));
const AddInventoryItem = lazy(() => import('../pages/admin/AddInventoryItem'));
const ChairManagementPage = lazy(() => import('../pages/admin/ChairManagement'));
const AdminTreatmentManagementPage = lazy(() => import('../pages/admin/AdminTreatmentManagement'));
const DentalEHRDashboard = lazy(() => import('../pages/dental/DentalManagement.jsx'));
const DentalEHRClinicalNotes = () => <div>Dental EHR Clinical Notes (Coming Soon)</div>;
const DentalEHRAttachments = () => <div>Dental EHR Attachments (Coming Soon)</div>;
const DentalEHRDiagnosis = () => <div>Dental EHR Diagnosis (Coming Soon)</div>;
const DentalEHRChart = () => <div>Dental EHR Chart (Coming Soon)</div>;

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
      path: 'add-staff',
      element: AddStaff
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
      path: 'patient/:patientId/dental',
      element: <FixedDentalEHR />
    },
    // Patient Management
    {
      path: 'patient-management',
      element: PatientManagement
    },
    // Appointment Management
    {
      path: 'appointment-management',
      element: AppointmentManagement
    },
    // Billing Management
    {
      path: 'billing-management',
      element: BillingManagement
    },
    // Prescription Management
    {
      path: 'prescriptions',
      element: PrescriptionManagement
    },
    // Dental Management
    {
      path: 'dental-management',
      element: DentalManagement
    },
    {
      path: 'dental-imaging',
      element: DentalImaging
    },
    {
      path: 'dental-treatments',
      element: AdminTreatmentManagementPage
    },
    {
      path: 'dental-billing',
      element: DentalBilling
    },
    {
      path: 'dental-procedure-schedule',
      element: DentalProcedureSchedule
    },
    {
      path: 'dental/chairs',
      element: ChairManagementPage
    },
    // Dental EHR
    {
      path: 'dental-ehr',
      element: DentalEHRDashboard
    },
    {
      path: 'dental-ehr/clinical-notes',
      element: <DentalEHRClinicalNotes />
    },
    {
      path: 'dental-ehr/attachments',
      element: <DentalEHRAttachments />
    },
    {
      path: 'dental-ehr/diagnosis',
      element: <DentalEHRDiagnosis />
    },
    {
      path: 'dental-ehr/chart',
      element: <DentalEHRChart />
    },
    // Inventory and Reports
    {
      path: 'inventory',
      element: Inventory,
      meta: {
        requiresSubscription: true,
        feature: 'inventory'
      },
      children: [
        {
          path: 'add',
          element: AddInventoryItem,
          meta: {
            requiresSubscription: true,
            feature: 'inventory'
          }
        }
      ]
    },
    {
      path: 'reports',
      element: Reports,
      meta: {
        requiresSubscription: true,
        feature: 'reports'
      }
    },
    {
      path: 'financial-reports',
      element: FinancialReports,
      meta: {
        requiresSubscription: true,
        feature: 'reports'
      }
    },
    // Clinic Settings
    {
      path: 'clinic-profile',
      element: ClinicProfile
    },
    {
      path: 'subscription',
      element: Subscription
    },
    {
      path: 'subscription/manage',
      element: ManageSubscription
    },
    {
      path: 'clinic-activation',
      element: ClinicActivation
    },
    {
      path: '/admin/EditInventoryItem/:id',
      element: <EditInventoryItem />,
    },
    {
      path: '/admin/ViewInventoryItem/:id',
      element: <ViewInventoryItem />,
    },
    {
      path: '/admin/medicines',
      element: <ProtectedRoute roles={['admin', 'doctor']}><MedicineManagement /></ProtectedRoute>,
    },
  ]
};

export default adminRoutes;