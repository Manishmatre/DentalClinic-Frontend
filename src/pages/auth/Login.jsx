import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaSignInAlt, FaTooth } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: localStorage.getItem('lastEmail') || '',
    password: '',
    role: localStorage.getItem('preferredRole') || ''
  });
  const [rememberRole, setRememberRole] = useState(!!localStorage.getItem('preferredRole'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendVerification, isAuthenticated, user } = useAuth();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        'Admin': '/admin/dashboard',
        'Doctor': '/doctor/dashboard',
        'Receptionist': '/receptionist/dashboard',
        'Patient': '/patient/dashboard'
      };
      
      // Check if there's a role in location state (from registration)
      const redirectRole = location.state?.role;
      if (redirectRole && roleRoutes[redirectRole]) {
        navigate(roleRoutes[redirectRole], { replace: true });
      } else {
        navigate(roleRoutes[user.role] || from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from, location.state]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setVerificationSent(false);
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await resendVerification(formData.email);
      setVerificationSent(true);
      setError('A new verification email has been sent. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // Handle remember role toggle
  const handleRememberRoleToggle = (e) => {
    setRememberRole(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('preferredRole');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields');
      return;
    }
    
    // Save preferred role if remember is checked
    if (rememberRole) {
      localStorage.setItem('preferredRole', formData.role);
    }
    
    // Save email for convenience
    localStorage.setItem('lastEmail', formData.email);

    try {
      setLoading(true);
      setError('');
      const response = await login(formData);
      
      if (!response.success) {
        // Check if email verification is required
        if (response.requiresVerification) {
          // The AuthProvider will handle the redirect to the verification page
          // Just set a message for the user
          setError('Please verify your email before logging in. Redirecting to verification page...');
          return;
        }
        
        throw new Error(response.error || 'Login failed');
      }

      const roleRoutes = {
        'Admin': '/admin/dashboard',
        'Doctor': '/doctor/dashboard',
        'Receptionist': '/receptionist/dashboard',
        'Patient': '/patient/dashboard'
      };
      
      // Store last successful login role for future logins
      localStorage.setItem('lastLoginRole', response.user.role);
      
      // Redirect to role-specific dashboard
      const redirectPath = roleRoutes[response.user.role] || from;
      console.log(`Redirecting to ${redirectPath} for role: ${response.user.role}`);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      
      // Prefer backend error message if available
      const backendMsg = error.response?.data?.message || error.message || '';
      if (
        backendMsg.toLowerCase().includes('role') ||
        backendMsg.toLowerCase().includes('registered as') ||
        backendMsg.toLowerCase().includes('select the correct role')
      ) {
        setError('Selected role does not match your account. Please check your role.');
      } else if (backendMsg.toLowerCase().includes('not found')) {
        setError('No account found with this email. Please check your email or register.');
      } else if (backendMsg.toLowerCase().includes('password')) {
        setError('Incorrect password. Please try again.');
      } else if (backendMsg.toLowerCase().includes('verify')) {
        setError('Please verify your email before logging in.');
        setVerificationSent(true);
      } else if (backendMsg) {
        setError(backendMsg);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <FaTooth className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DentalOS.AI
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your role and enter your credentials
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Role selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="role"
                name="role"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="" disabled>Select your role</option>
                <option value="Admin">Administrator</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Patient">Patient</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-role"
              name="remember-role"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={rememberRole}
              onChange={handleRememberRoleToggle}
            />
            <label htmlFor="remember-role" className="ml-2 block text-sm text-gray-900">
              Remember my role
            </label>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  {error.toLowerCase().includes('verify') && !verificationSent && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {verificationSent && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Verification email sent. Please check your inbox.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <FaSignInAlt className="mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create new account
              </Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
