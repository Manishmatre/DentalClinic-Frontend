import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../api/auth/authService';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await authService.resendVerification(email);
      setSuccess('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Email Verification Required</h2>
      
      {error && (
        <Alert 
          variant="error" 
          message={error}
          className="mb-4"
          onClose={() => setError('')}
        />
      )}
      
      {success && (
        <Alert 
          variant="success" 
          message={success}
          className="mb-4"
          onClose={() => setSuccess('')}
        />
      )}

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          We've sent a verification email to <strong>{email}</strong>.
          Please check your inbox and click the verification link.
        </p>
        
        <p className="text-gray-500 text-sm">
          If you haven't received the email, check your spam folder or click below to resend.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleResendVerification}
            loading={loading}
            className="w-full"
          >
            Resend Verification Email
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;