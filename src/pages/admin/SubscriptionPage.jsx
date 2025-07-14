import React, { useState, useEffect } from 'react';
import { FaCrown, FaChartLine, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import SubscriptionDashboard from '../../components/subscription/SubscriptionDashboard';
import SubscriptionPlans from '../../components/subscription/SubscriptionPlans';
import SubscriptionCheckout from '../../components/subscription/SubscriptionCheckout';
import subscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';

const SubscriptionPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const { currentUser } = useAuth();

  // Define fetchSubscription outside useEffect so it can be called from other functions
  const fetchSubscription = async () => {
    if (!currentUser?.clinic?._id) {
      setLoading(false);
      return;
    }
    
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
  
  // Fetch subscription data on component mount
  useEffect(() => {
    fetchSubscription();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center my-8">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading subscription information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your clinic's subscription plan and billing details</p>
          </div>
          {subscription && subscription.plan !== 'Free' && (
            <div className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-full flex items-center font-medium shadow-md">
              <FaCrown className="mr-2 text-yellow-300" />
              <span>{subscription.plan} Plan</span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div>
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-5 py-4 font-medium flex items-center flex-1 justify-center ${activeTab === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartLine className="mr-2" /> Dashboard
            </button>
            <button 
              className={`px-5 py-4 font-medium flex items-center flex-1 justify-center ${activeTab === 'plans' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('plans')}
            >
              <FaCrown className="mr-2" /> Plans & Pricing
            </button>
            <button 
              className={`px-5 py-4 font-medium flex items-center flex-1 justify-center ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory className="mr-2" /> Billing History
            </button>

          </div>
          
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="min-h-[300px]">
                <SubscriptionDashboard onUpgrade={() => setActiveTab('plans')} />
              </div>
            )}
            
            {activeTab === 'plans' && (
              <div className="min-h-[300px]">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Available Subscription Plans</h3>
                <SubscriptionPlans 
                  onSelectPlan={(plan, billingCycle) => {
                    console.log('Plan selected in SubscriptionPage:', plan);
                    
                    // Store the selected plan and billing cycle in state
                    setSelectedPlan(plan);
                    setSelectedBillingCycle(billingCycle);
                    
                    // Switch to checkout tab
                    setActiveTab('checkout');
                  }}
                />
              </div>
            )}
            
            {activeTab === 'checkout' && selectedPlan && (
              <div className="min-h-[300px]">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Complete Your Subscription</h3>
                <div className="bg-gray-50 p-4 mb-6 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Selected Plan:</span>
                    <span className="font-bold text-indigo-600">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Billing Cycle:</span>
                    <span className="font-bold text-indigo-600">{selectedBillingCycle}</span>
                  </div>
                </div>
                
                <SubscriptionCheckout 
                  selectedPlan={selectedPlan} 
                  billingCycle={selectedBillingCycle}
                  onPaymentSuccess={async (data) => {
                    console.log('Payment successful with data:', data);
                    
                    try {
                      // If the data includes subscription details, we don't need to fetch again
                      if (data.subscriptionData) {
                        console.log('Subscription data received from payment:', data.subscriptionData);
                        
                        // Update local state
                        setSubscription(data.subscriptionData);
                        
                        // Show success message
                        toast.success(`${selectedPlan.name} plan activated successfully!`);
                      } else {
                        // Fetch updated subscription data
                        console.log('Fetching updated subscription data...');
                        await fetchSubscription();
                        
                        // Show success message
                        toast.success('Subscription activated successfully!');
                      }
                      
                      // Clear selected plan data
                      setSelectedPlan(null);
                      setSelectedBillingCycle('monthly');
                      
                      // Navigate to dashboard
                      setActiveTab('dashboard');
                      
                    } catch (error) {
                      console.error('Error updating subscription data:', error);
                      toast.error('There was an issue updating your subscription data. Please refresh the page.');
                      
                      // Try to fetch subscription data anyway
                      fetchSubscription();
                    }
                  }}
                  onCancel={() => {
                    setActiveTab('plans');
                    setSelectedPlan(null);
                  }}
                />
                
                <div className="mt-6 text-center">
                  <button 
                    className="px-6 py-2 bg-transparent text-gray-600 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveTab('plans')}
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="min-h-[300px]">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Billing & Payment History</h3>
                {subscription ? (
                  <div>
                    {/* This section will be populated by the SubscriptionDashboard component */}
                    <SubscriptionDashboard initialTab="history" onUpgrade={() => setActiveTab('plans')} />
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-md text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">No Billing History Available</h4>
                      <p className="text-gray-600 mb-6">You don't have any billing records yet. Subscribe to a paid plan to start tracking your payment history.</p>
                      <button 
                        onClick={() => setActiveTab('plans')} 
                        className="px-5 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Explore Subscription Plans
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
          <h5 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h5>
          <p className="text-gray-600 mb-6 flex-grow">
            If you have any questions about your subscription or need assistance, our support team is here to help.
          </p>
          <button className="text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300 py-2 px-4 rounded font-medium">
            Contact Support
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
          <h5 className="text-lg font-semibold text-gray-800 mb-3">Billing FAQs</h5>
          <p className="text-gray-600 mb-6 flex-grow">
            Find answers to common questions about billing, payments, and subscription management.
          </p>
          <button className="text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300 py-2 px-4 rounded font-medium">
            View FAQs
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
          <h5 className="text-lg font-semibold text-gray-800 mb-3">Feature Comparison</h5>
          <p className="text-gray-600 mb-6 flex-grow">
            Compare different subscription plans and their features to find the best fit for your clinic.
          </p>
          <button 
            className="text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300 py-2 px-4 rounded font-medium"
            onClick={() => setActiveTab('plans')}
          >
            Compare Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
