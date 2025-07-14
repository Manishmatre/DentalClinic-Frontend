import React, { useState, useEffect } from 'react';
import { 
  FaHeartbeat, 
  FaAllergies, 
  FaPhone, 
  FaUserFriends, 
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaFileMedical,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import adminService from '../../../api/admin/adminService';
import { toast } from 'react-toastify';

/**
 * Medical Tab Component
 * Displays medical information for patients
 */
const MedicalTab = ({ formData, isEditing, handleInputChange, handleArrayInputChange, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Handle allergies input change with comma-separated values
  const handleAllergiesChange = async (e) => {
    const allergies = e.target.value.split(',').map(allergy => allergy.trim()).filter(Boolean);
    
    // Update the local state first for immediate UI feedback
    handleArrayInputChange('allergies', allergies);
    
    // We don't save immediately on each keystroke to avoid too many API calls
    // The parent component will handle saving when the user clicks Save
  };
  
  // Get allergies as comma-separated string
  const getAllergiesString = () => {
    return (formData.allergies || []).join(', ');
  };

  // Save medical information
  const saveMedicalInfo = async (data) => {
    try {
      setSaving(true);
      
      // Save to database
      await adminService.updateAdminProfile(data);
      
      // Log activity
      await adminService.logActivity({
        action: 'Updated medical information',
        module: 'Profile',
        details: `Updated medical profile information`
      });
      
      toast.success('Medical information updated successfully');
    } catch (error) {
      console.error('Error updating medical information:', error);
      toast.error('Failed to update medical information');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle emergency contact update
  const updateEmergencyContact = async () => {
    if (formData.emergencyContact) {
      await saveMedicalInfo({ emergencyContact: formData.emergencyContact });
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Basic Medical Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Medical Information</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blood Group */}
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup || ''}
                onChange={(e) => {
                  handleInputChange(e);
                  if (isEditing && e.target.value) {
                    saveMedicalInfo({ bloodGroup: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            {/* Allergies */}
            <div className="md:col-span-2">
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={getAllergiesString()}
                onChange={handleAllergiesChange}
                onBlur={() => {
                  if (isEditing && formData.allergies) {
                    saveMedicalInfo({ allergies: formData.allergies });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Penicillin, Peanuts, Latex (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter allergies separated by commas
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Blood Group */}
            <div className="flex items-start">
              <FaHeartbeat className="mt-1 text-red-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Blood Group</h4>
                <p className="mt-1 text-base">{formData.bloodGroup || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Allergies */}
            <div className="flex items-start md:col-span-2">
              <FaAllergies className="mt-1 text-red-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Allergies</h4>
                <p className="mt-1 text-base">
                  {formData.allergies && formData.allergies.length > 0
                    ? formData.allergies.join(', ')
                    : 'No known allergies'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contact Name */}
            <div>
              <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                id="emergencyContact.name"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Emergency Contact Relationship */}
            <div>
              <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                id="emergencyContact.relationship"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Spouse, Parent, Child"
              />
            </div>
            
            {/* Emergency Contact Phone */}
            <div>
              <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                id="emergencyContact.phone"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div>
            {formData.emergencyContact && (
              formData.emergencyContact.name || 
              formData.emergencyContact.relationship || 
              formData.emergencyContact.phone
            ) ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <FaUserFriends className="text-blue-500 mr-2" />
                  <h4 className="font-medium text-blue-800">
                    {formData.emergencyContact.name || 'Unnamed Contact'}
                    {formData.emergencyContact.relationship && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        ({formData.emergencyContact.relationship})
                      </span>
                    )}
                  </h4>
                </div>
                
                {formData.emergencyContact.phone && (
                  <div className="flex items-center text-blue-700">
                    <FaPhone className="mr-2" />
                    <span>{formData.emergencyContact.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <FaExclamationTriangle className="mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600">No emergency contact information provided.</p>
                <p className="text-sm text-gray-500 mt-1">
                  We recommend adding emergency contact information for your safety.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Medical History Summary */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History Summary</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Recent Medical Records</h4>
              <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                {loading ? (
                  <FaSpinner className="animate-spin inline mr-1" />
                ) : (
                  'View All Records'
                )}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <FaFileMedical className="mt-1 text-blue-500 mr-3" />
                  <div>
                    <h5 className="font-medium">General Checkup</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Dr. Sarah Johnson • May 15, 2023
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <FaNotesMedical className="mt-1 text-blue-500 mr-3" />
                  <div>
                    <h5 className="font-medium">Blood Test Results</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Dr. Robert Smith • April 28, 2023
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Medications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Active Prescriptions</h4>
              <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                {loading ? (
                  <FaSpinner className="animate-spin inline mr-1" />
                ) : (
                  'View All Prescriptions'
                )}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <FaPrescriptionBottleAlt className="mt-1 text-blue-500 mr-3" />
                <div>
                  <h5 className="font-medium">Amoxicillin</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    500mg • 3 times daily • 7 days
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Prescribed by Dr. Sarah Johnson on May 15, 2023
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalTab;
