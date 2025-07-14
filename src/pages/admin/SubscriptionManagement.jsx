import React, { useState, useEffect } from 'react';
import { FaCrown, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SubscriptionDashboard from '../../components/subscription/SubscriptionDashboard';
import SubscriptionPlans from '../../components/subscription/SubscriptionPlans';
import SubscriptionCheckout from '../../components/subscription/SubscriptionCheckout';
import subscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';

const SubscriptionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, plans, checkout
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch subscription data
  useEffect(() => {
    if (!currentUser?.clinic?._id) {
      setLoading(false);
      return;
    }
    
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getClinicSubscription(currentUser.clinic._id);
        setSubscription(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        if (err.message?.includes('not found')) {
          // No subscription found, that's okay
          setSubscription(null);
        } else {
          setError('Failed to load subscription data. Please try again later.');
          toast.error('Error loading subscription data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [currentUser]);

  // Handle plan selection
  const handleSelectPlan = (plan, billingCycle) => {
    setSelectedPlan(plan);
    setSelectedBillingCycle(billingCycle);
    setView('checkout');
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentData) => {
    toast.success(`Successfully subscribed to ${paymentData.plan} plan!`);
    
    // Refresh subscription data
    try {
      setLoading(true);
      const response = await subscriptionService.getClinicSubscription(currentUser.clinic._id);
      setSubscription(response.data);
      setView('dashboard');
    } catch (err) {
      console.error('Error refreshing subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render page title and description
  const renderPageHeader = () => {
    let title = 'Subscription Management';
    let description = 'Manage your clinic subscription, view usage, and upgrade your plan.';
    
    if (view === 'plans') {
      title = 'Choose a Subscription Plan';
      description = 'Select the plan that best fits your clinic needs.';
    } else if (view === 'checkout') {
      title = 'Complete Your Subscription';
      description = 'Review and confirm your subscription details.';
    }
    
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center my-8">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 font-sans">
      {renderPageHeader()}
      
      {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}
      
      {view !== 'dashboard' && (
        <button 
          className="flex items-center px-4 py-2 mb-6 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => setView('dashboard')}
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
      )}
      
      {view === 'dashboard' && (
        <>
          {(!subscription || subscription?.plan === 'Free') && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-2">
                    <FaCrown className="mr-2 text-yellow-500" />
                    Upgrade Your Clinic Experience
                  </h4>
                  <p className="text-gray-600">
                    Get access to premium features, increased limits, and priority support.
                  </p>
                </div>
                <button 
                  className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                  onClick={() => setView('plans')}
                >
                  View Plans
                </button>
              </div>
            </div>
          )}
          
          <SubscriptionDashboard />
          
          <div className="text-center mt-8">
            <button 
              className="px-6 py-3 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/admin/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </>
      )}
      
      {view === 'plans' && (
        <SubscriptionPlans onSelectPlan={handleSelectPlan} />
      )}
      
      {view === 'checkout' && selectedPlan && (
        <SubscriptionCheckout 
          selectedPlan={selectedPlan} 
          billingCycle={selectedBillingCycle}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setView('plans')}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;
