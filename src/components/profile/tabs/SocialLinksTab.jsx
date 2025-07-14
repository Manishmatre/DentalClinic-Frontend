import React, { useState, useEffect } from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaYoutube, 
  FaGlobe, 
  FaPlus, 
  FaTrash,
  FaLock,
  FaUnlock,
  FaSpinner
} from 'react-icons/fa';
import adminService from '../../../api/admin/adminService';
import { toast } from 'react-toastify';

/**
 * Social Links Tab Component
 * Allows users to manage their social media profiles and online presence
 */
const SocialLinksTab = ({ formData, isEditing, handleInputChange, handleArrayInputChange, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Initialize social links if they don't exist
  const socialLinks = formData.socialLinks || [];
  
  // Get icon based on platform
  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'twitter':
      case 'x':
        return <FaTwitter className="text-blue-400" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      case 'youtube':
        return <FaYoutube className="text-red-600" />;
      default:
        return <FaGlobe className="text-gray-600" />;
    }
  };
  
  // Add a new social link
  const addSocialLink = async () => {
    try {
      setSaving(true);
      const newSocialLinks = [...socialLinks, { platform: '', url: '', isPublic: true }];
      
      // Update the local state first for immediate UI feedback
      handleArrayInputChange('socialLinks', newSocialLinks);
      
      // Save to database
      await adminService.updateSocialLinks(newSocialLinks);
      
      // Log activity
      await adminService.logActivity({
        action: 'Added social link',
        module: 'Profile',
        details: 'Added a new social media profile'
      });
      
      toast.success('Social link added successfully');
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link');
    } finally {
      setSaving(false);
    }
  };
  
  // Remove a social link
  const removeSocialLink = async (index) => {
    try {
      setSaving(true);
      const newSocialLinks = [...socialLinks];
      const removedLink = newSocialLinks[index];
      newSocialLinks.splice(index, 1);
      
      // Update the local state first for immediate UI feedback
      handleArrayInputChange('socialLinks', newSocialLinks);
      
      // Save to database
      await adminService.updateSocialLinks(newSocialLinks);
      
      // Log activity
      await adminService.logActivity({
        action: 'Removed social link',
        module: 'Profile',
        details: `Removed ${removedLink.platform || 'Unknown'} social media profile`
      });
      
      toast.success('Social link removed successfully');
    } catch (error) {
      console.error('Error removing social link:', error);
      toast.error('Failed to remove social link');
    } finally {
      setSaving(false);
    }
  };
  
  // Update a social link
  const updateSocialLink = async (index, field, value) => {
    try {
      const newSocialLinks = [...socialLinks];
      newSocialLinks[index][field] = value;
      
      // Update the local state first for immediate UI feedback
      handleArrayInputChange('socialLinks', newSocialLinks);
      
      // We don't save immediately on each keystroke to avoid too many API calls
      // Only save when changing isPublic status immediately
      if (field === 'isPublic') {
        setSaving(true);
        // Save to database
        await adminService.updateSocialLinks(newSocialLinks);
        
        // Log activity
        await adminService.logActivity({
          action: 'Updated social link privacy',
          module: 'Profile',
          details: `Changed ${newSocialLinks[index].platform || 'Unknown'} profile to ${value ? 'public' : 'private'}`
        });
        
        toast.success('Social link privacy updated successfully');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error updating social link:', error);
      toast.error('Failed to update social link');
      setSaving(false);
    }
  };
  
  // Save all social links
  const saveSocialLinks = async () => {
    try {
      setSaving(true);
      
      // Save to database
      await adminService.updateSocialLinks(socialLinks);
      
      // Log activity
      await adminService.logActivity({
        action: 'Updated social links',
        module: 'Profile',
        details: 'Updated social media profiles'
      });
      
      toast.success('Social links saved successfully');
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error('Failed to save social links');
    } finally {
      setSaving(false);
    }
  };
  
  // Save personal website and blog URL
  const saveOnlinePresence = async () => {
    try {
      setSaving(true);
      
      // Save to database
      await adminService.updateAdminProfile({
        personalWebsite: formData.personalWebsite,
        blogUrl: formData.blogUrl
      });
      
      // Log activity
      await adminService.logActivity({
        action: 'Updated online presence',
        module: 'Profile',
        details: 'Updated personal website and blog URL'
      });
      
      toast.success('Online presence saved successfully');
    } catch (error) {
      console.error('Error saving online presence:', error);
      toast.error('Failed to save online presence');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Social Media Profiles</h3>
        {isEditing && (
          <button
            type="button"
            onClick={addSocialLink}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin mr-1" /> : <FaPlus className="mr-1" />} Add Profile
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-500">
        Connect your social media accounts to enhance your professional network and online presence.
      </p>
      
      {socialLinks.length === 0 && !isEditing ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No social media profiles added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                {getPlatformIcon(link.platform)}
              </div>
              
              <div className="flex-grow">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor={`platform-${index}`} className="sr-only">Platform</label>
                      <select
                        id={`platform-${index}`}
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Platform</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter">Twitter</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Website">Website</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`url-${index}`} className="sr-only">URL</label>
                      <input
                        type="url"
                        id={`url-${index}`}
                        placeholder="https://example.com/profile"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <input
                          id={`isPublic-${index}`}
                          name={`isPublic-${index}`}
                          type="checkbox"
                          checked={link.isPublic}
                          onChange={(e) => updateSocialLink(index, 'isPublic', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`isPublic-${index}`} className="ml-2 block text-sm text-gray-700">
                          Public
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{link.platform || 'Unknown Platform'}</h4>
                      {link.isPublic !== undefined && (
                        <span className="ml-2" title={link.isPublic ? 'Public' : 'Private'}>
                          {link.isPublic ? <FaUnlock className="text-green-500 text-xs" /> : <FaLock className="text-gray-500 text-xs" />}
                        </span>
                      )}
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 truncate block">
                      {link.url}
                    </a>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  disabled={saving}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Online Presence</h3>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="personalWebsite" className="block text-sm font-medium text-gray-700">
              Personal Website
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="personalWebsite"
                name="personalWebsite"
                placeholder="https://example.com"
                value={formData.personalWebsite || ''}
                onChange={handleInputChange}
                onBlur={saveOnlinePresence}
                disabled={!isEditing || saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="blogUrl" className="block text-sm font-medium text-gray-700">
              Blog URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="blogUrl"
                name="blogUrl"
                placeholder="https://blog.example.com"
                value={formData.blogUrl || ''}
                onChange={handleInputChange}
                onBlur={saveOnlinePresence}
                disabled={!isEditing || saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksTab;
