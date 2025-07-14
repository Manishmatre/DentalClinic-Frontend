import React, { useState, useEffect } from 'react';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt, 
  FaBell, 
  FaHistory,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFingerprint,
  FaGlobe,
  FaMobileAlt,
  FaSpinner
} from 'react-icons/fa';
import Button from '../../ui/Button';
import adminService from '../../../api/admin/adminService';

/**
 * Security Tab Component
 * Displays security settings and password change options
 */
const SecurityTab = ({ 
  formData, 
  isEditing, 
  isChangingPassword, 
  setIsChangingPassword, 
  handleInputChange 
}) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Check password strength
  useEffect(() => {
    if (!formData.newPassword) {
      setPasswordStrength({
        score: 0,
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
      return;
    }
    
    const password = formData.newPassword;
    
    // Check requirements
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    // Calculate score (0-4)
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    // Update state
    setPasswordStrength({
      score: Math.min(4, score),
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar
    });
  }, [formData.newPassword]);
  
  // Check if passwords match
  useEffect(() => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setPasswordMatch(true);
      return;
    }
    
    setPasswordMatch(formData.newPassword === formData.confirmPassword);
  }, [formData.newPassword, formData.confirmPassword]);
  
  // State for login history data
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changePasswordStatus, setChangePasswordStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  // Fetch login history
  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        setLoading(true);
        const data = await adminService.getLoginHistory();
        setLoginHistory(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching login history:', err);
        setError('Failed to load login history');
        setLoading(false);
      }
    };
    
    fetchLoginHistory();
  }, []);
  
  // Handle password change submission
  const handlePasswordChange = async () => {
    // Validate password requirements
    if (!formData.currentPassword) {
      setChangePasswordStatus({
        loading: false,
        success: false,
        error: 'Current password is required'
      });
      return;
    }
    
    if (!formData.newPassword) {
      setChangePasswordStatus({
        loading: false,
        success: false,
        error: 'New password is required'
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setChangePasswordStatus({
        loading: false,
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }
    
    // Check password strength
    if (passwordStrength.score < 3) {
      setChangePasswordStatus({
        loading: false,
        success: false,
        error: 'Password is too weak. Please make it stronger.'
      });
      return;
    }
    
    try {
      setChangePasswordStatus({
        loading: true,
        success: false,
        error: null
      });
      
      await adminService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setChangePasswordStatus({
        loading: false,
        success: true,
        error: null
      });
      
      // Reset password fields
      handleInputChange({ target: { name: 'currentPassword', value: '' } });
      handleInputChange({ target: { name: 'newPassword', value: '' } });
      handleInputChange({ target: { name: 'confirmPassword', value: '' } });
      
      // Close password change form after success
      setTimeout(() => {
        setIsChangingPassword(false);
        setChangePasswordStatus({
          loading: false,
          success: false,
          error: null
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      setChangePasswordStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || 'Failed to change password'
      });
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Password Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
        
        {isEditing ? (
          <div>
            {!isChangingPassword ? (
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsChangingPassword(true)}
              >
                <FaLock className="mr-2" /> Change Password
              </Button>
            ) : (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-800">Change Your Password</h4>
                
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Password Strength</span>
                      <span className="text-xs">
                        {passwordStrength.score === 0 && 'Very Weak'}
                        {passwordStrength.score === 1 && 'Weak'}
                        {passwordStrength.score === 2 && 'Fair'}
                        {passwordStrength.score === 3 && 'Good'}
                        {passwordStrength.score === 4 && 'Strong'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.score === 0 ? 'bg-gray-300' : 
                                           passwordStrength.score === 1 ? 'bg-red-500' : 
                                           passwordStrength.score === 2 ? 'bg-orange-500' : 
                                           passwordStrength.score === 3 ? 'bg-yellow-500' : 
                                           'bg-green-500'}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs">
                        {passwordStrength.hasMinLength ? 
                          <FaCheck className="text-green-500 mr-1" /> : 
                          <FaTimes className="text-red-500 mr-1" />}
                        <span className={passwordStrength.hasMinLength ? 'text-green-700' : 'text-gray-600'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.hasUppercase ? 
                          <FaCheck className="text-green-500 mr-1" /> : 
                          <FaTimes className="text-red-500 mr-1" />}
                        <span className={passwordStrength.hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                          Contains uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.hasLowercase ? 
                          <FaCheck className="text-green-500 mr-1" /> : 
                          <FaTimes className="text-red-500 mr-1" />}
                        <span className={passwordStrength.hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                          Contains lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.hasNumber ? 
                          <FaCheck className="text-green-500 mr-1" /> : 
                          <FaTimes className="text-red-500 mr-1" />}
                        <span className={passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                          Contains number
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.hasSpecialChar ? 
                          <FaCheck className="text-green-500 mr-1" /> : 
                          <FaTimes className="text-red-500 mr-1" />}
                        <span className={passwordStrength.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                          Contains special character
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${!passwordMatch && formData.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {!passwordMatch && formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <FaExclamationTriangle className="mr-1" /> Passwords do not match
                    </p>
                  )}
                </div>
                
                {/* Status messages */}
                {changePasswordStatus.error && (
                  <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{changePasswordStatus.error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {changePasswordStatus.success && (
                  <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaCheck className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">Password changed successfully!</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 mr-3"
                    onClick={() => {
                      setIsChangingPassword(false);
                      // Reset password fields
                      handleInputChange({ target: { name: 'currentPassword', value: '' } });
                      handleInputChange({ target: { name: 'newPassword', value: '' } });
                      handleInputChange({ target: { name: 'confirmPassword', value: '' } });
                      // Reset status
                      setChangePasswordStatus({
                        loading: false,
                        success: false,
                        error: null
                      });
                    }}
                    disabled={changePasswordStatus.loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handlePasswordChange}
                    disabled={changePasswordStatus.loading}
                  >
                    {changePasswordStatus.loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaLock className="text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                </div>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setIsChangingPassword(true);
                }}
              >
                Change
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Login History Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Login History</h3>
          <Button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1">
            <FaHistory className="mr-1" /> View Full History
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-3" />
            <p className="text-gray-500">Loading login history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-dashed border-red-300">
            <FaExclamationTriangle className="mx-auto text-4xl text-red-300 mb-3" />
            <p className="text-red-500 mb-2">{error}</p>
          </div>
        ) : loginHistory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No login history available.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {loginHistory.map((login, index) => {
              // Calculate time ago
              const loginDate = new Date(login.timestamp || login.loginTime);
              const now = new Date();
              const diffMs = now - loginDate;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);
              
              let timeAgo;
              if (diffMins < 1) timeAgo = 'Just now';
              else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
              else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
              else timeAgo = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
              
              return (
                <div 
                  key={login._id || `login-${index}`} 
                  className={`p-4 ${index !== loginHistory.length - 1 ? 'border-b border-gray-200' : ''} ${index === 0 ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors duration-200`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                      <span className="font-medium">{index === 0 ? 'Current session' : 'Previous login'}</span>
                      {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>}
                    </div>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                    <span className="text-sm text-gray-600 flex items-center">
                      <FaGlobe className="text-gray-400 mr-1" /> {login.location || 'Unknown location'}
                    </span>
                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700 mt-1 sm:mt-0 inline-flex items-center">
                      <FaFingerprint className="text-gray-500 mr-1" size={12} /> {login.ip || login.ipAddress || 'Unknown IP'}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <FaMobileAlt className="mr-1 text-gray-400" /> {login.device || login.browser || 'Unknown device'}
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">This wasn't me?</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Additional Security Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {/* Two-Factor Authentication */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FaShieldAlt className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full mr-3">Not Enabled</span>
                <Button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105">
                  Enable
                </Button>
              </div>
            </div>
            <div className="px-4 pb-4 text-xs text-gray-500 flex items-start">
              <FaInfoCircle className="text-blue-500 mr-2 mt-0.5" />
              <p>Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p>
            </div>
          </div>
          
          {/* Login Notifications */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <FaBell className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Login Notifications</p>
                  <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
              </div>
              <div className="relative inline-block w-14 h-7 rounded-full bg-gray-200 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gray-300">
                <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out"></div>
              </div>
            </div>
          </div>
          
          {/* Session Management */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <FaHistory className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Active Sessions</p>
                  <p className="text-sm text-gray-500">Manage your active login sessions</p>
                </div>
              </div>
              <Button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md">
                Manage
              </Button>
            </div>
          </div>
          
          {/* Account Recovery */}
          <div>
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <FaMobileAlt className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Recovery Options</p>
                  <p className="text-sm text-gray-500">Set up methods to recover your account</p>
                </div>
              </div>
              <Button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md">
                Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
