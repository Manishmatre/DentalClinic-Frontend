import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthProvider';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NoClinic from './pages/auth/NoClinic';
import ClinicInactive from './pages/auth/ClinicInactive';

// Public Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageStaff from './pages/admin/ManageStaff';
import OldClinicSettings from './pages/admin/ClinicSettings'; // Aliased existing component
import ClinicSettingsPage from './pages/admin/ClinicSettingsPage'; // New page for clinic settings
import ClinicProfile from './pages/admin/ClinicProfile';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
// PatientsManagement removed - functionality consolidated in PatientManagement
import PatientManagement from './pages/admin/PatientManagement';
import PatientRequests from './pages/admin/PatientRequests';
import BillingManagement from './pages/admin/BillingManagement';
import Inventory from './pages/admin/Inventory';
import DentalProcedures from './pages/admin/DentalProcedures';
import DentalProcedureSchedule from './pages/admin/DentalProcedureSchedule';
import SubscriptionPage from './pages/admin/SubscriptionPage';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import StaffManagement from './pages/admin/StaffManagement';
import AddStaff from './pages/admin/AddStaff';
import StaffDetails from './pages/admin/StaffDetails';
import PatientDetails from './pages/admin/PatientDetails';
import AddPatient from './pages/admin/AddPatient';
import Reports from './pages/admin/Reports';
import AddInventoryItem from './pages/admin/AddInventoryItem';
import ChairManagementPage from './pages/admin/ChairManagement';
import AdminTreatmentManagementPage from './pages/admin/DentalTreatments';
import DentalBilling from './pages/admin/DentalBilling';
import DentalImaging from './pages/admin/DentalImaging';
import AdminChairManagementPage from './pages/admin/ChairManagement';
import MedicineManagement from './pages/admin/MedicineManagement';

// Routes
import BillingRoutes from './routes/BillingRoutes';
import PrescriptionRoutes from './pages/prescriptions';
import ClinicActivation from './pages/admin/ClinicActivation';

// New Universal Profile Pages
import AdminProfile from './pages/profile/AdminProfile';
import DoctorProfile from './pages/profile/DoctorProfile';
import StaffProfile from './pages/profile/StaffProfile';
import PatientProfile from './pages/profile/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointmentManagement from './pages/doctor/AppointmentManagement';
import PatientRecords from './pages/doctor/PatientRecords';
import PatientMedicalHistory from './pages/doctor/PatientMedicalHistory';
import TreatmentPlans from './pages/doctor/TreatmentPlans';
import DoctorPatientBilling from './pages/doctor/PatientBilling';
import DoctorStaffDirectory from './pages/doctor/StaffDirectory';
import DoctorPatientDocuments from './pages/doctor/PatientDocuments';

// Dental EHR Pages
import FixedDentalEHR from './pages/dental/FixedDentalEHR';
import DentalManagement from './pages/dental/DentalManagement';
import AdminDentalManagement from './pages/admin/DentalManagement';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import AppointmentScheduling from './pages/receptionist/AppointmentScheduling';
import PatientRegistration from './pages/receptionist/PatientRegistration';
import PatientList from './pages/receptionist/PatientList';
import ReceptionistStaffDirectory from './pages/receptionist/StaffDirectory';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointmentManagement from './pages/patient/AppointmentManagement';
import PatientAppointments from './pages/patient/PatientAppointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientBillingPage from './pages/patient/Billing';
import PatientDocuments from './pages/patient/PatientDocuments';

// Layouts

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import PatientLayout from './layouts/PatientLayout';

// Route Protection
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/no-clinic" element={<NoClinic />} />
        <Route path="/clinic-inactive" element={<ClinicInactive />} />

      {/* Protected Admin Routes */}
      <Route element={
        <ProtectedRoute 
          requiredRoles={['Admin']} 
          requireVerified={true}
          requireClinic={true}
        />
      }>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clinic-profile" element={<ClinicProfile />} />
          <Route path="/admin/staff" element={<ManageStaff />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/appointment-management" element={<AppointmentManagement />} />
          <Route path="/admin/appointment-management/dashboard" element={<AppointmentManagement initialTab="dashboard" />} />
          <Route path="/admin/appointment-management/calendar" element={<AppointmentManagement initialTab="calendar" />} />
          <Route path="/admin/appointment-management/list" element={<AppointmentManagement initialTab="list" />} />
          <Route path="/admin/appointment-management/settings" element={<AppointmentManagement initialTab="settings" />} />
          {/* PatientsManagement route removed - functionality consolidated in PatientManagement */}
          {/* Static routes must come before dynamic routes with parameters */}
          <Route path="/admin/patients/add" element={<AddPatient />} />
          <Route path="/admin/patients/new" element={<AddPatient />} />
          <Route path="/admin/patients/edit/:id" element={<AddPatient mode="edit" />} />
          <Route path="/admin/patients/:id" element={<PatientDetails />} />
          <Route path="/admin/patient-management" element={<PatientManagement />} />
          <Route path="/admin/staff-management" element={<ErrorBoundary><StaffManagement /></ErrorBoundary>} />
          <Route path="/admin/add-staff" element={<AddStaff />} />
          <Route path="/admin/staff/:id" element={<ErrorBoundary><StaffDetails /></ErrorBoundary>} />
          <Route path="/admin/staff/:id/edit" element={<AddStaff />} />
          <Route path="/admin/billing-management/*" element={<BillingRoutes />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/inventory/add" element={<AddInventoryItem />} />
          <Route path="/admin/dental-procedures" element={<DentalProcedures />} />
          <Route path="/admin/dental-procedure-schedule" element={<DentalProcedureSchedule />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/financial-reports" element={<Reports type="financial" />} />
          <Route path="/admin/clinic-settings" element={<ClinicSettingsPage />} />
          <Route path="/admin/clinic-activation" element={<ClinicActivation />} />
          <Route path="/admin/subscription" element={<SubscriptionPage />} />
          <Route path="/admin/subscription/manage" element={<SubscriptionManagement />} />
          <Route path="/admin/patient/:patientId/dental" element={<FixedDentalEHR />} />
          <Route path="/admin/dental-management" element={<DentalManagement />} />
          <Route path="/admin/dental-imaging" element={<DentalImaging />} />
          <Route path="/admin/dental-treatments" element={<AdminTreatmentManagementPage />} />
          <Route path="/admin/dental-billing" element={<DentalBilling />} />
          <Route path="/admin/dental-procedure-schedule" element={<DentalProcedureSchedule />} />
          <Route path="/admin/dental/chairs" element={<AdminChairManagementPage />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/prescriptions/*" element={<PrescriptionRoutes />} />
          <Route path="/admin/medicines" element={<MedicineManagement />} />
        </Route>
      </Route>

      {/* Protected Doctor Routes */}
      <Route element={
        <ProtectedRoute 
          requiredRoles={['Doctor']} 
          requireVerified={true}
          requireClinic={true}
        />
      }>
        <Route element={<DoctorLayout />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointment-management" element={<DoctorAppointmentManagement />} />
          <Route path="/doctor/patients" element={<PatientRecords />} />
          <Route path="/doctor/patient/:patientId/medical-history" element={<PatientMedicalHistory />} />
          <Route path="/doctor/treatments" element={<TreatmentPlans />} />
          <Route path="/doctor/billing-management/*" element={<BillingRoutes />} />
          <Route path="/doctor/staff-directory" element={<DoctorStaffDirectory />} />
          <Route path="/doctor/patient/:patientId/documents" element={<DoctorPatientDocuments />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/patient/:patientId/dental" element={<FixedDentalEHR />} />
          <Route path="/doctor/dental-management" element={<DentalManagement />} />
          <Route path="/doctor/prescriptions/*" element={<PrescriptionRoutes />} />
        </Route>
      </Route>

      {/* Protected Receptionist Routes */}
      <Route element={
        <ProtectedRoute 
          requiredRoles={['Receptionist']} 
          requireVerified={true}
          requireClinic={true}
        />
      }>
        <Route element={<ReceptionistLayout />}>
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/appointments" element={<AppointmentScheduling />} />
          <Route path="/receptionist/patients" element={<PatientList />} />
          <Route path="/receptionist/patients/register" element={<PatientRegistration />} />
          <Route path="/receptionist/billing-management/*" element={<BillingRoutes />} />
          <Route path="/receptionist/profile" element={<StaffProfile />} />
          <Route path="/receptionist/staff-directory" element={<ReceptionistStaffDirectory />} />
        </Route>
      </Route>

      {/* Protected Patient Routes */}
      <Route element={
        <ProtectedRoute 
          requiredRoles={['Patient']} 
          requireVerified={true}
          requireClinic={true}
        />
      }>
        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          {/* Updated routes for better navigation */}
          <Route path="/patient/appointments" element={<PatientAppointments view="upcoming" />} />
          <Route path="/patient/appointments/book" element={<PatientAppointments view="book" />} />
          <Route path="/patient/appointments/history" element={<PatientAppointments view="history" />} />
          <Route path="/patient/test-results" element={<MedicalHistory view="test-results" />} />
          <Route path="/patient/prescriptions" element={<MedicalHistory view="prescriptions" />} />
          <Route path="/patient/documents" element={<PatientDocuments />} />
          <Route path="/patient/profile-settings" element={<PatientProfile />} />
          {/* Keep old routes for backward compatibility */}
          <Route path="/patient/appointment-management" element={<PatientAppointmentManagement />} />
          <Route path="/patient/medical-history" element={<MedicalHistory />} />
          <Route path="/patient/billing-management/*" element={<BillingRoutes />} />
        </Route>
      </Route>

      {/* Catch All - Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;