import React from 'react';
import { 
  FaUser, 
  FaShieldAlt, 
  FaHistory, 
  FaBriefcase, 
  FaHeartbeat,
  FaLink,
  FaCreditCard,
  FaHospital,
  FaBell
} from 'react-icons/fa';

/**
 * Profile Tabs Component
 * Displays navigation tabs for different profile sections
 */
const ProfileTabs = ({ activeTab, handleTabClick, userRole }) => {
  // Define tabs based on user role
  const getTabs = () => {
    // Common tabs for all roles
    const commonTabs = [
      {
        id: 'personal',
        label: 'Personal Info',
        icon: <FaUser />,
      },
      {
        id: 'security',
        label: 'Security',
        icon: <FaShieldAlt />,
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <FaHistory />,
      }
    ];
    
    // Role-specific tabs
    const roleTabs = {
      doctor: [
        {
          id: 'professional',
          label: 'Professional',
          icon: <FaBriefcase />,
        }
      ],
      admin: [
        {
          id: 'professional',
          label: 'Professional',
          icon: <FaBriefcase />,
        },
        {
          id: 'social',
          label: 'Social Links',
          icon: <FaLink />,
        },
        {
          id: 'payments',
          label: 'Payment Methods',
          icon: <FaCreditCard />,
        },
        {
          id: 'clinic',
          label: 'Clinic Details',
          icon: <FaHospital />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <FaBell />,
        }
      ],
      staff: [
        {
          id: 'professional',
          label: 'Professional',
          icon: <FaBriefcase />,
        }
      ],
      patient: [
        {
          id: 'medical',
          label: 'Medical Info',
          icon: <FaHeartbeat />,
        }
      ]
    };
    
    // Return combined tabs based on role
    return [...commonTabs, ...(roleTabs[userRole] || [])];
  };
  
  const tabs = getTabs();
  
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              transition-colors duration-200
            `}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className={`
              mr-2 
              ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
