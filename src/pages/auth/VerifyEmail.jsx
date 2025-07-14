import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaTooth, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = location.state?.email;
  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  // Handle token verification from URL
  useEffect(() => {
    if (token && userId) {
      verifyEmailToken(token, userId);
    }
  }, [token, userId]);

  // Function to verify email token
  const verifyEmailToken = async (token, userId) => {
    try {
      setVerifying(true);
      setError('');
      
      const response = await api.get(`/auth/verify-email?token=${token}&id=${userId}`);
      
      if (response.data && response.data.message) {
        setVerificationSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! You can now log in.'
            },
            replace: true 
          });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed. Please try again or request a new verification email.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address is required. Please go back to login and try again.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await resendVerification(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { state: { fromVerification: true }, replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-8 text-white text-center">
          <div className="flex justify-center mb-4">
            {verificationSuccess ? (
              <FaCheckCircle className="h-16 w-16 text-white" />
            ) : (
              <FaEnvelope className="h-16 w-16 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {verificationSuccess ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="text-sm text-indigo-100">
            {verificationSuccess 
              ? 'Your email has been successfully verified. Redirecting to login...' 
              : 'Please check your email for verification instructions'}
          </p>
        </div>

        <div className="px-6 py-8 space-y-6">
          {/* Verification in progress */}
          {verifying && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaSpinner className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Verifying your email address...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification success */}
          {verificationSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Your email has been verified successfully! You will be redirected to the login page in a few seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email sent success */}
          {!verificationSuccess && success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Verification email sent! Please check your inbox and spam folders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Information for users who haven't received the email */}
          {!verificationSuccess && !success && !verifying && !token && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Haven't received the verification email? Click the button below to resend it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!verificationSuccess && (
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={loading || success || verifying}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || success || verifying
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;