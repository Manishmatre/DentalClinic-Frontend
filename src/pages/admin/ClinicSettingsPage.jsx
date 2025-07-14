import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaSave, 
  FaHospital, 
  FaClock, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaFileInvoiceDollar, 
  FaUserLock, 
  FaEnvelope,
  FaCheckCircle,
  FaCog
} from 'react-icons/fa';
import ClinicInfoSettings from './ClinicInfoSettings';
import WorkingHoursSettings from './WorkingHoursSettings';
import AppointmentRulesSettings from './AppointmentRulesSettings';
import PatientFormSettings from './PatientFormSettings';
import BillingSetupSettings from './BillingSetupSettings';
import StaffAccessSettings from './StaffAccessSettings';
import CommunicationPrefsSettings from './CommunicationPrefsSettings';
import ServiceForm from '../../components/clinic/ServiceForm';
import serviceService from '../../api/clinic/serviceService';
import Button from '../../components/ui/Button';

// Styling for the tabbed interface
const styles = {
  pageContainer: {
    padding: '24px',
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: 'calc(100vh - 100px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headingIcon: {
    color: '#4f46e5',
    width: '28px',
    height: '28px',
  },
  headingText: {
    position: 'relative',
  },
  headingAccent: {
    position: 'absolute',
    bottom: '-4px',
    left: '0',
    height: '4px',
    width: '40%',
    background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)',
    borderRadius: '2px',
  },
  subHeading: {
    fontSize: '15px',
    color: '#6b7280',
    marginTop: '6px',
    maxWidth: '600px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    scrollbarWidth: 'thin',
    scrollbarColor: '#d1d5db #f9fafb',
  },
  tab: {
    padding: '16px 20px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  activeTab: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
    backgroundColor: '#ffffff',
    fontWeight: '600',
  },
  tabIcon: {
    width: '18px',
    height: '18px',
  },
  contentContainer: {
    padding: '28px',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
  },
  actionButtonHover: {
    backgroundColor: '#4338ca',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 6px rgba(79, 70, 229, 0.4)',
  },
  successBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    marginLeft: '12px',
  },
  successIcon: {
    width: '14px',
    height: '14px',
  },
};

const ClinicSettingsPage = () => {
  // State to track the active tab and saved state
  const [activeTab, setActiveTab] = useState('clinic-info');
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Service management state
  const [services, setServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch services for the clinic
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await serviceService.getServices();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setServices(data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'services') fetchServices();
  }, [activeTab]);

  // Add, edit, delete handlers
  const handleAddService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };
  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await serviceService.deleteService(serviceId);
      toast.success('Service deleted');
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };
  const handleServiceFormSubmit = async (formData) => {
    try {
      if (editingService) {
        await serviceService.updateService(editingService._id, formData);
        toast.success('Service updated');
      } else {
        await serviceService.createService(formData);
        toast.success('Service created');
      }
      setShowServiceForm(false);
      fetchServices();
    } catch {
      toast.error('Failed to save service');
    }
  };

  // Function to handle save action
  const handleSaveAll = () => {
    // In a real implementation, this would save all settings
    // For now, we'll just show a success message
    toast.success('All clinic settings saved successfully!');
    setIsSaved(true);
    
    // Reset the saved state after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  // Tab definitions with React icons
  const tabs = [
    { 
      id: 'clinic-info', 
      label: 'Clinic Information',
      icon: <FaHospital />
    },
    { 
      id: 'working-hours', 
      label: 'Working Hours & Holidays',
      icon: <FaClock />
    },
    { 
      id: 'appointment-rules', 
      label: 'Appointment Rules',
      icon: <FaCalendarAlt />
    },
    { 
      id: 'patient-forms', 
      label: 'Patient Forms',
      icon: <FaClipboardList />
    },
    { 
      id: 'billing-setup', 
      label: 'Billing & Invoices',
      icon: <FaFileInvoiceDollar />
    },
    { 
      id: 'staff-access', 
      label: 'Staff Access Control',
      icon: <FaUserLock />
    },
    { 
      id: 'communication-prefs', 
      label: 'Communication',
      icon: <FaEnvelope />
    },
    { id: 'services', label: 'Services', icon: <FaClipboardList /> },
  ];

  // Render the appropriate component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'clinic-info':
        return <ClinicInfoSettings />;
      case 'working-hours':
        return <WorkingHoursSettings />;
      case 'appointment-rules':
        return <AppointmentRulesSettings />;
      case 'patient-forms':
        return <PatientFormSettings />;
      case 'billing-setup':
        return <BillingSetupSettings />;
      case 'staff-access':
        return <StaffAccessSettings />;
      case 'communication-prefs':
        return <CommunicationPrefsSettings />;
      case 'services':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Clinic Services</h2>
              <Button onClick={handleAddService}>Add Service</Button>
            </div>
            {loadingServices ? (
              <div>Loading services...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Duration</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service._id} className="border-b">
                      <td className="px-4 py-2">{service.name}</td>
                      <td className="px-4 py-2">{service.category}</td>
                      <td className="px-4 py-2">{service.duration} min</td>
                      <td className="px-4 py-2">${service.price}</td>
                      <td className="px-4 py-2">{service.status}</td>
                      <td className="px-4 py-2">
                        <Button size="sm" onClick={() => handleEditService(service)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteService(service._id)} style={{ marginLeft: 8 }}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {showServiceForm && (
              <div className="mt-6">
                <ServiceForm
                  onSubmit={handleServiceFormSubmit}
                  initialData={editingService}
                  isLoading={false}
                />
                <Button onClick={() => setShowServiceForm(false)} className="mt-2">Cancel</Button>
              </div>
            )}
          </div>
        );
      default:
        return <ClinicInfoSettings />;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            <FaCog style={styles.headingIcon} />
            <span style={styles.headingText}>
              Clinic Settings
              <div style={styles.headingAccent}></div>
            </span>
          </h1>
          <p style={styles.subHeading}>
            Configure your clinic's settings, including working hours, appointment rules, billing, and more.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isSaved && (
            <div style={styles.successBadge}>
              <FaCheckCircle style={styles.successIcon} />
              Settings saved
            </div>
          )}
          <button 
            style={{
              ...styles.actionButton,
              ...(isHovered ? styles.actionButtonHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSaveAll}
          >
            <FaSave style={{ width: '16px', height: '16px' }} />
            Save All Changes
          </button>
        </div>
      </div>
      
      <div style={styles.card}>
        {/* Tabs */}
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ ...styles.tabIcon, color: activeTab === tab.id ? '#4f46e5' : '#6b7280' }}>
                {tab.icon}
              </span>
              {tab.label}
            </div>
          ))}
        </div>
        
        {/* Tab Content */}
        <div style={styles.contentContainer}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ClinicSettingsPage;
