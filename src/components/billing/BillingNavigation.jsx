import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaChartLine, 
  FaFileInvoiceDollar, 
  FaHistory, 
  FaUserMd, 
  FaUser, 
  FaFileInvoice, 
  FaMoneyBillWave, 
  FaReceipt, 
  FaChartBar, 
  FaFileExport, 
  FaFilePdf, 
  FaFileExcel,
  FaRupeeSign,
  FaClipboardList,
  FaCalculator,
  FaFileContract,
  FaRegCreditCard
} from 'react-icons/fa';

const BillingNavigation = ({ activeTab, setActiveTab, userRole }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  // Get the base path based on user role
  const getBasePath = () => {
    switch (user.role) {
      case 'Admin':
        return '/admin';
      case 'Doctor':
        return '/doctor';
      case 'Receptionist':
        return '/receptionist';
      case 'Patient':
        return '/patient';
      default:
        return '';
    }
  };
  
  const basePath = getBasePath();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    let items = [];
    
    // Common items for all roles
    if (['Admin', 'Receptionist'].includes(user.role)) {
      // Dashboard section for admins and receptionists
      items = [
        {
          path: `${basePath}/billing/dashboard`,
          label: 'Dashboard',
          icon: <FaChartLine className="mr-2" />
        },
        {
          path: `${basePath}/billing/invoices`,
          label: 'Invoices',
          icon: <FaFileInvoiceDollar className="mr-2" />
        },
        {
          path: `${basePath}/billing/payments`,
          label: 'Payments',
          icon: <FaMoneyBillWave className="mr-2" />
        },
        {
          path: `${basePath}/billing/receipts`,
          label: 'Receipts',
          icon: <FaReceipt className="mr-2" />
        },
        {
          path: `${basePath}/billing/gst-reports`,
          label: 'GST Reports',
          icon: <FaCalculator className="mr-2" />
        },
        {
          path: `${basePath}/billing/financial-reports`,
          label: 'Financial Reports',
          icon: <FaChartBar className="mr-2" />
        },
        {
          path: `${basePath}/billing/insurance-claims`,
          label: 'Insurance Claims',
          icon: <FaFileContract className="mr-2" />
        },
        {
          path: `${basePath}/billing/price-packages`,
          label: 'Price Packages',
          icon: <FaRupeeSign className="mr-2" />
        }
      ];
      
      // Admin-only items
      if (user.role === 'Admin') {
        items.push(
          {
            path: `${basePath}/billing/settings`,
            label: 'Billing Settings',
            icon: <FaClipboardList className="mr-2" />
          },
          {
            path: `${basePath}/billing/export`,
            label: 'Export Data',
            icon: <FaFileExport className="mr-2" />
          }
        );
      }
    } else if (user.role === 'Doctor') {
      // Doctor-specific billing navigation
      items = [
        {
          path: `${basePath}/billing/dashboard`,
          label: 'Billing Overview',
          icon: <FaChartLine className="mr-2" />
        },
        {
          path: `${basePath}/billing/patient-invoices`,
          label: 'Patient Invoices',
          icon: <FaFileInvoice className="mr-2" />
        },
        {
          path: `${basePath}/billing/payments`,
          label: 'Payments',
          icon: <FaMoneyBillWave className="mr-2" />
        },
        {
          path: `${basePath}/billing/service-charges`,
          label: 'Service Charges',
          icon: <FaRupeeSign className="mr-2" />
        }
      ];
    } else if (user.role === 'Patient') {
      // Patient-specific billing navigation
      items = [
        {
          path: `${basePath}/billing/my-invoices`,
          label: 'My Invoices',
          icon: <FaFileInvoice className="mr-2" />
        },
        {
          path: `${basePath}/billing/payment-history`,
          label: 'Payment History',
          icon: <FaHistory className="mr-2" />
        },
        {
          path: `${basePath}/billing/make-payment`,
          label: 'Make Payment',
          icon: <FaRegCreditCard className="mr-2" />
        },
        {
          path: `${basePath}/billing/insurance`,
          label: 'Insurance Claims',
          icon: <FaFileContract className="mr-2" />
        }
      ];
    }
    
    return items;
  };
  
  const navItems = getNavItems();
  
  // Convert path-based navigation to tab-based navigation
  const getTabItems = () => {
    // Extract tab name from path
    return navItems.map(item => {
      const tabName = item.path.split('/').pop(); // Get last segment of path
      return {
        id: tabName,
        label: item.label,
        icon: item.icon
      };
    });
  };

  const tabItems = getTabItems();

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="flex overflow-x-auto p-2">
        {tabItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BillingNavigation;
