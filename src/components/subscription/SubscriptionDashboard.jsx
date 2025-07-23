import React, { useState, useEffect } from 'react';
import { FaCrown, FaCalendarAlt, FaHistory, FaCreditCard, FaChartLine, FaExchangeAlt, FaRegClock, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionCheckout from './SubscriptionCheckout';
import { Tooltip } from '@chakra-ui/react'; // Added Tooltip import
import { Button } from '@chakra-ui/react'; // Added Button import

const SubscriptionDashboard = ({ initialTab, onUpgrade }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const { currentUser } = useAuth();

  // Define fetchSubscriptionData outside useEffect so it can be called from other functions
  const fetchSubscriptionData = async (showToast = true) => {
    try {
      setLoading(true);
      
      // Get clinic ID from current user
      const clinicId = currentUser?.clinic?._id || 'mock_clinic_id';
      
      // Fetch subscription data
      const subscriptionResponse = await subscriptionService.getClinicSubscription(clinicId);
      console.log('Subscription data fetched:', subscriptionResponse);
      
      // Use API data or fallback to localStorage data if available
      if (subscriptionResponse?.data) {
        setSubscription(subscriptionResponse.data);
      } else {
        console.warn('No subscription data found');
        setSubscription(null);
      }
      
      // Fetch subscription history
      const historyResponse = await subscriptionService.getSubscriptionHistory(clinicId);
      console.log('Subscription history fetched:', historyResponse);
      
      if (historyResponse?.data?.length > 0) {
        setSubscriptionHistory(historyResponse.data);
      } else {
        console.warn('No subscription history found');
        setSubscriptionHistory([]);
      }
      
      if (showToast) {
        toast.success('Subscription data refreshed');
      }
      
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      toast.error('Failed to fetch subscription data');
      
      // Try to use localStorage data as fallback if API fails
      try {
        const storedSubscription = localStorage.getItem('mockSubscription');
        if (storedSubscription) {
          const localSubscription = JSON.parse(storedSubscription);
          setSubscription(localSubscription);
          console.log('Using stored subscription data as fallback');
          
          const storedPayment = localStorage.getItem('mockPayment');
          if (storedPayment) {
            const payment = JSON.parse(storedPayment);
            setSubscriptionHistory([{
              _id: payment._id,
              date: payment.paidAt,
              amount: payment.amount,
              description: payment.description,
              status: payment.status,
              paymentMethod: payment.paymentMethod,
              invoiceNumber: payment.gatewayPaymentId,
              reference: payment.gatewayOrderId
            }]);
          }
        }
      } catch (e) {
        console.warn('Error using localStorage fallback:', e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch subscription data when component mounts
  useEffect(() => {
    fetchSubscriptionData();
  }, [currentUser]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate days remaining in subscription
  const calculateDaysRemaining = () => {
    if (!subscription || !subscription.endDate) return 0;

    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === 0) return 'Free';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'success': { bg: 'bg-green-100', text: 'text-green-800', label: 'Successful' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'refunded': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' }
    };
    
    const defaultStatus = { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    const statusStyle = statusMap[status?.toLowerCase()] || defaultStatus;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
        {statusStyle.label}
      </span>
    );
  };
  
  // Handle manual refresh of subscription data
  const handleRefreshData = () => {
    fetchSubscriptionData(true); // Show toast notification
  };

  // Handle plan selection
  const handleSelectPlan = (plan, billingCycle) => {
    console.log('Plan selected in dashboard:', plan);
    console.log('Billing cycle:', billingCycle);
    
    // Make sure we set the selected plan and billing cycle
    setSelectedPlan(plan);
    setSelectedBillingCycle(billingCycle || 'monthly');
    
    // Scroll to the checkout section
    setTimeout(() => {
      const checkoutElement = document.getElementById('subscription-checkout');
      if (checkoutElement) {
        checkoutElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);
      console.log('Processing successful payment with data:', paymentData);
      
      // If payment data already includes subscription data (from our updated checkout flow)
      // we don't need to verify again, just update the local state
      if (paymentData.subscriptionData) {
        console.log('Subscription data already included:', paymentData.subscriptionData);
        
        // Update subscription in state
        setSubscription(paymentData.subscriptionData);
        
        // Store in localStorage for persistence during development
        try {
          localStorage.setItem('mockSubscription', JSON.stringify(paymentData.subscriptionData));
        } catch (e) {
          console.warn('Could not store subscription in localStorage', e);
        }
        
        // Add to subscription history if we have payment data
        if (paymentData.paymentData) {
          const payment = paymentData.paymentData;
          const newHistoryItem = {
            _id: payment._id || 'invoice_' + Date.now(),
            date: payment.paidAt || new Date().toISOString(),
            amount: payment.amount || paymentData.amount || 0,
            description: payment.description || `Payment for ${paymentData.planName || 'subscription'} (${paymentData.billingCycle})`,
            status: payment.status || 'success',
            paymentMethod: payment.paymentMethod || 'razorpay',
            invoiceNumber: payment.gatewayPaymentId || paymentData.razorpay_payment_id,
            reference: payment.gatewayOrderId || paymentData.razorpay_order_id
          };
          
          setSubscriptionHistory(prev => [newHistoryItem, ...prev]);
          
          // Store in localStorage for persistence during development
          try {
            localStorage.setItem('mockPayment', JSON.stringify(payment));
          } catch (e) {
            console.warn('Could not store payment in localStorage', e);
          }
        } else {
          // Create a basic history item if no payment data
          const newHistoryItem = {
            _id: 'invoice_' + Date.now(),
            date: new Date().toISOString(),
            amount: paymentData.amount || 0,
            description: `Payment for ${paymentData.planName || 'subscription'} (${paymentData.billingCycle})`,
            status: 'success',
            paymentMethod: 'razorpay',
            invoiceNumber: paymentData.razorpay_payment_id,
            reference: paymentData.razorpay_order_id
          };
          
          setSubscriptionHistory(prev => [newHistoryItem, ...prev]);
        }
        
        toast.success(`${paymentData.subscriptionData.planName || 'Subscription'} activated successfully!`);
      } else {
        // Verify payment with backend if not already verified
        console.log('Verifying payment with backend...');
        const verificationResponse = await subscriptionService.verifyRazorpayPayment({
          ...paymentData,
          planId: selectedPlan?._id,
          billingCycle: selectedBillingCycle,
          clinicId: currentUser?.clinic?._id || 'mock_clinic_id'
        });
        
        console.log('Payment verification successful:', verificationResponse);
        
        // Check for different possible response formats and extract subscription data
        const subscription = verificationResponse.data?.subscription || 
                           verificationResponse.data?.data?.subscription || 
                           null;
        
        console.log('Extracted subscription data in dashboard:', subscription);
        
        if (subscription) {
          // Update subscription in state
          setSubscription(subscription);
          
          // Store in localStorage for persistence during development
          try {
            localStorage.setItem('mockSubscription', JSON.stringify(subscription));
          } catch (e) {
            console.warn('Could not store subscription in localStorage', e);
          }
        } else {
          console.warn('No valid subscription data found in response, creating mock data');
          
          // Create mock subscription data as fallback
          const mockSubscription = {
            _id: 'sub_' + Date.now(),
            plan: selectedPlan?._id || paymentData.plan || 'plan_basic',
            planName: selectedPlan?.name || paymentData.planName || 'Basic Plan',
            status: 'active',
            clinicId: currentUser?.clinic?._id || paymentData.clinicId || 'mock_clinic_id',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (paymentData.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            billingCycle: paymentData.billingCycle || 'monthly',
            amount: paymentData.amount || 0,
            currency: paymentData.currency || 'INR',
            autoRenew: true,
            features: selectedPlan?.features || []
          };
          
          setSubscription(mockSubscription);
          
          // Store in localStorage for persistence during development
          try {
            localStorage.setItem('mockSubscription', JSON.stringify(mockSubscription));
          } catch (e) {
            console.warn('Could not store mock subscription in localStorage', e);
          }
        }
        
        // Add to subscription history
        if (verificationResponse.data?.payment) {
          const payment = verificationResponse.data.payment;
          const newHistoryItem = {
            _id: payment._id || 'invoice_' + Date.now(),
            date: payment.paidAt || new Date().toISOString(),
            amount: payment.amount || paymentData.amount || 0,
            description: payment.description || `Payment for ${subscription?.planName || 'subscription'} (${subscription?.billingCycle || 'monthly'})`,
            status: payment.status || 'success',
            paymentMethod: payment.paymentMethod || 'razorpay',
            invoiceNumber: payment.gatewayPaymentId || paymentData.razorpay_payment_id,
            reference: payment.gatewayOrderId || paymentData.razorpay_order_id
          };
          
          setSubscriptionHistory(prev => [newHistoryItem, ...prev]);
          
          // Store in localStorage for persistence during development
          try {
            localStorage.setItem('mockPayment', JSON.stringify(payment));
          } catch (e) {
            console.warn('Could not store payment in localStorage', e);
          }
        } else {
          // Create a basic history item if no payment data
          const newHistoryItem = {
            _id: 'invoice_' + Date.now(),
            date: new Date().toISOString(),
            amount: paymentData.amount || 0,
            description: `Payment for ${subscription?.planName || selectedPlan?.name || 'subscription'} (${subscription?.billingCycle || selectedBillingCycle || 'monthly'})`,
            status: 'success',
            paymentMethod: 'razorpay',
            invoiceNumber: paymentData.razorpay_payment_id,
            reference: paymentData.razorpay_order_id
          };
          
          setSubscriptionHistory(prev => [newHistoryItem, ...prev]);
        }
        
        // If there was no subscription data in the verification response, fetch from API
        if (!verificationResponse.data?.subscription && !verificationResponse.data?.data?.subscription) {
          console.log('No subscription data in response, fetching from API...');
          await fetchSubscriptionData(false);
        }
        
        toast.success('Payment successful! Your subscription has been activated.');
      }
      
      // Reset state
      setSelectedPlan(null);
      setShowUpgrade(false);
      
      // Activate the plan in the UI
      setActiveTab('overview');
      
      // Log the successful activation
      console.log('Subscription activated successfully');
      
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error(err.message || 'Payment verification failed. Please contact support.');
      
      // Try to fetch subscription data anyway in case the payment went through
      // but there was an error in the response handling
      await fetchSubscriptionData(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        if (!subscription?._id) {
          throw new Error('No active subscription found');
        }
        
        // Call the API to cancel the subscription
        await subscriptionService.cancelSubscription(subscription._id);
        
        toast.success('Subscription cancelled successfully');
        
        // Update local state
        setSubscription(prev => ({
          ...prev,
          status: 'cancelled',
          autoRenew: false,
          cancelledAt: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error cancelling subscription:', err);
        toast.error(err.message || 'Failed to cancel subscription. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add handleDownloadInvoice function
  const handleDownloadInvoice = (invoiceId) => {
    if (!invoiceId) return;
    // Open the invoice PDF in a new tab (adjust endpoint as needed)
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center my-8">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading subscription information...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded my-4">{error}</div>;
  }

  // If showing upgrade/change plan view
  if (showUpgrade) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-center mb-8 font-semibold text-xl text-gray-800">Choose a New Plan</h2>
        
        <SubscriptionPlans onSelectPlan={handleSelectPlan} />
        
        {selectedPlan && (
          <div id="subscription-checkout" className="mt-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Your Subscription</h3>
            <SubscriptionCheckout 
              selectedPlan={selectedPlan}
              billingCycle={selectedBillingCycle}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => setSelectedPlan(null)}
            />
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button 
            className="px-6 py-3 bg-transparent text-gray-600 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
            onClick={() => {
              setShowUpgrade(false);
              setSelectedPlan(null);
            }}
          >
            Back to Subscription Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="max-w-7xl mx-auto p-4 font-sans">
      {/* Subscription Status Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="flex items-center text-xl font-semibold text-gray-800">
              <FaCrown className="text-yellow-400 mr-2" />
              Subscription Status
            </h4>
            <button 
              onClick={handleRefreshData}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              disabled={loading}
            >
              <FaExchangeAlt className="mr-1" />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="flex flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="mb-4 flex items-center">
                <div className="flex items-center bg-indigo-50 px-4 py-3 rounded-lg">
                  <div className="mr-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaCrown className="text-indigo-600 text-xl" />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-800">
                      {subscription?.plan || 'Free'} Plan
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 
                        subscription?.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        subscription?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription?.status ? 
                          subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 
                          'Inactive'}
                      </span>
                      
                      {subscription?.price > 0 && (
                        <span className="ml-2 text-gray-500 text-xs">
                          {formatCurrency(subscription.price)}/{subscription?.billingCycle || 'month'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Billing Cycle</span>
                    <span className="text-gray-800 font-medium">
                      {subscription?.billingCycle ? 
                        subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1) : 
                        'Monthly'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Auto-Renewal</span>
                    <span className="text-gray-800 font-medium flex items-center">
                      {subscription?.autoRenew ? 
                        <><FaCheck className="text-green-500 mr-1" /> Enabled</> : 
                        <><FaTimes className="text-red-500 mr-1" /> Disabled</>}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Start Date</span>
                    <span className="text-gray-800 font-medium">{formatDate(subscription?.startDate) || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Next Billing Date</span>
                    <span className="text-gray-800 font-medium">{formatDate(subscription?.endDate) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center min-w-[200px] flex-1 mt-4 md:mt-0">
              {subscription?.status === 'active' && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-600 flex flex-col items-center justify-center mb-2 shadow-md">
                    <div className="text-2xl font-bold text-indigo-600">{calculateDaysRemaining()}</div>
                    <div className="text-xs text-gray-500">days left</div>
                  </div>
                  
                  <div className="text-gray-600 text-sm text-center mt-1">
                    <span className="font-medium">
                      {subscription?.autoRenew ? 
                        'Auto-renews on ' + formatDate(subscription?.endDate) : 
                        'Expires on ' + formatDate(subscription?.endDate)}
                    </span>
                  </div>
                </div>
              )}
              
              {(!subscription || subscription?.status === 'cancelled' || subscription?.plan === 'Free') && (
                <button 
                  className="px-5 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors mb-4"
                  onClick={() => {
                    if (onUpgrade) {
                      onUpgrade();
                    } else {
                      setShowUpgrade(true);
                      setActiveTab('overview');
                    }
                  }}
                >
                  {!subscription || subscription?.plan === 'Free' ? 'Upgrade Now' : 'Renew Subscription'}
                </button>
              )}
              
              {subscription?.status === 'active' && subscription?.plan !== 'Free' && (
                <>
                  <button 
                    className="px-5 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors mb-4"
                    onClick={() => {
                      if (onUpgrade) {
                        onUpgrade();
                      } else {
                        setShowUpgrade(true);
                        setActiveTab('overview');
                      }
                    }}
                  >
                    Change Plan
                  </button>
                  
                  <button 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`px-5 py-3 border-b-2 font-medium flex items-center ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-200'}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine className="mr-2" /> Overview
          </button>
          <button 
            className={`px-5 py-3 border-b-2 font-medium flex items-center ${activeTab === 'features' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-200'}`}
            onClick={() => setActiveTab('features')}
          >
            <FaCrown className="mr-2" /> Features & Limits
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h5 className="font-semibold text-gray-800">Usage Overview</h5>
                    </div>
                    <div className="p-6">
                      {subscription?.usage ? (
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Patients</span>
                              <span>{subscription?.usage?.patients?.used || 0} / {subscription?.usage?.patients?.limit || 'Unlimited'}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${subscription?.usage?.patients?.percentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                                style={{ width: `${subscription?.usage?.patients?.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Appointments</span>
                              <span>{subscription?.usage?.appointments?.used || 0} / {subscription?.usage?.appointments?.limit || 'Unlimited'}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${subscription?.usage?.appointments?.percentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                                style={{ width: `${subscription?.usage?.appointments?.percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Staff Members</span>
                              <span>{subscription?.usage?.users?.used || 0} / {subscription?.usage?.users?.limit || 'Unlimited'}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${subscription?.usage?.users?.percentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                                style={{ width: `${subscription?.usage?.users?.percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Storage</span>
                              <span>{subscription?.usage?.storage?.used || '0'} / {subscription?.usage?.storage?.limit || 'Unlimited'}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${subscription?.usage?.storage?.percentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                                style={{ width: `${subscription?.usage?.storage?.percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No usage data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h5 className="font-semibold text-gray-800">Quick Actions</h5>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 flex items-center">
                          <FaCreditCard className="mr-2 text-indigo-600" /> Update Payment Method
                        </button>
                        
                        <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 flex items-center">
                          <FaExchangeAlt className="mr-2 text-indigo-600" /> Change Billing Cycle
                        </button>
                        
                        <button 
                          className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 flex items-center"
                          onClick={() => {
                            if (onUpgrade) {
                              onUpgrade();
                            } else {
                              setShowUpgrade(true);
                              setActiveTab('overview');
                            }
                          }}
                        >
                          <FaCrown className="mr-2 text-indigo-600" /> Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h5 className="font-semibold text-gray-800">Subscription Details</h5>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium">{subscription?.plan || 'Free'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{subscription?.price || 0}/{subscription?.interval || 'month'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">{subscription?.status || 'Inactive'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Billing:</span>
                          <span className="font-medium">{formatDate(subscription?.endDate)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auto-Renew:</span>
                          <span className="font-medium">{subscription?.autoRenew ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Included Features</h4>
                  <ul className="space-y-3">
                    {subscription?.features && subscription?.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-3 flex-shrink-0 text-green-500">
                          <FaCheck />
                        </span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Resource Limits</h4>
                  <ul className="space-y-3">
                    {subscription?.usage && Object.entries(subscription?.usage).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        <span className="mr-3 flex-shrink-0 text-indigo-500">
                          <FaRegClock />
                        </span>
                        <span className="text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value.used} / {value.limit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Excluded Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="mr-3 flex-shrink-0 text-red-500">
                        <FaTimes />
                      </span>
                      <span className="text-gray-700">Multi-branch management</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 flex-shrink-0 text-red-500">
                        <FaTimes />
                      </span>
                      <span className="text-gray-700">Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 flex-shrink-0 text-red-500">
                        <FaTimes />
                      </span>
                      <span className="text-gray-700">API access</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 flex-shrink-0 text-red-500">
                        <FaTimes />
                      </span>
                      <span className="text-gray-700">24/7 dedicated support</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Need more features or higher limits? Upgrade your plan today!</p>
                <button 
                  className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    if (onUpgrade) {
                      onUpgrade();
                    } else {
                      setShowUpgrade(true);
                      setActiveTab('overview');
                    }
                  }}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
          
          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                <button 
                  onClick={handleRefreshData}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  disabled={loading}
                >
                  <FaExchangeAlt className="mr-1" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {subscriptionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <FaHistory className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-600 font-medium">No payment history available.</p>
                  <p className="text-gray-500 text-sm mt-1">Your payment records will appear here once you subscribe to a plan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptionHistory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="font-medium">{item.description || `Payment for ${item.plan || 'subscription'}`}</div>
                            <div className="text-xs text-gray-500 mt-1">{item.invoiceNumber || item.reference || item._id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPaymentStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {item.invoiceNumber || item.reference ? (
                              <Tooltip content="Download Invoice PDF">
                                <Button
                                  variant="success"
                                  size="xs"
                                  className="p-2"
                                  onClick={() => handleDownloadInvoice(item.invoiceNumber || item.reference)}
                                >
                                  <FaFilePdf size={16} />
                                </Button>
                              </Tooltip>
                            ) : null}
                            {item.invoiceUrl && (
                              <a 
                                href={item.invoiceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              >
                                <FaRegClock className="mr-1" /> View Invoice
                              </a>
                            )}
                            {!item.invoiceUrl && item.status === 'success' && (
                              <span className="text-gray-400 cursor-not-allowed">Processing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Usage and limits summary section */}
      {subscription && subscription.features && (
        <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Usage & Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Resource Usage</h4>
              <ul className="space-y-2">
                <li>Doctors: {typeof subscription.usage?.doctors === 'object' ? `${subscription.usage.doctors.used} / ${subscription.usage.doctors.limit}` : `${subscription.usage?.doctors || 0} / ${subscription.features.maxDoctors}`}</li>
                <li>Patients: {typeof subscription.usage?.patients === 'object' ? `${subscription.usage.patients.used} / ${subscription.usage.patients.limit}` : `${subscription.usage?.patients || 0} / ${subscription.features.maxPatients}`}</li>
                <li>Staff: {typeof subscription.usage?.staff === 'object' ? `${subscription.usage.staff.used} / ${subscription.usage.staff.limit}` : `${subscription.usage?.staff || 0} / ${subscription.features.maxStaff}`}</li>
                <li>Storage: {typeof subscription.usage?.storage === 'object' ? `${subscription.usage.storage.used} MB / ${subscription.usage.storage.limit} MB` : `${subscription.usage?.storage || 0} MB / ${subscription.features.maxStorage * 1024} MB`}</li>
                <li>Appointments: {typeof subscription.usage?.appointments === 'object' ? `${subscription.usage.appointments.used} / ${subscription.usage.appointments.limit}` : `${subscription.usage?.appointments || 0}`}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Included Features</h4>
              <ul className="space-y-2">
                {(subscription.features.allowedModules || []).map(f => (
                  <li key={f} className="text-green-700">✔ {f.charAt(0).toUpperCase() + f.slice(1)}</li>
                ))}
                {(subscription.features.customFeatures || []).filter(f => f.enabled).map(f => (
                  <li key={f.name} className="text-green-700">✔ {f.name} {f.limit ? `(Limit: ${f.limit})` : ''}</li>
                ))}
              </ul>
              <h4 className="font-medium mt-4 mb-2">Excluded Features</h4>
              <ul className="space-y-2">
                {['chat', 'analytics', 'marketing', 'telehealth'].filter(f => !(subscription.features.allowedModules || []).includes(f)).map(f => (
                  <li key={f} className="text-red-600">✖ {f.charAt(0).toUpperCase() + f.slice(1)}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Upgrade prompt if any limit is reached */}
          {(subscription.usage?.doctors >= subscription.features.maxDoctors ||
            subscription.usage?.patients >= subscription.features.maxPatients ||
            subscription.usage?.staff >= subscription.features.maxStaff ||
            subscription.usage?.storage >= (subscription.features.maxStorage * 1024)) && (
            <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded">
              <strong>Limit reached:</strong> You have reached your plan's resource limit. <button className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setShowUpgrade(true)}>Upgrade Now</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;