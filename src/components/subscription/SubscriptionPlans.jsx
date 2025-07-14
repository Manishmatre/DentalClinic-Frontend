import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaCrown, FaRocket, FaLeaf, FaBuilding } from 'react-icons/fa';
import subscriptionService from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SubscriptionPlans = ({ onSelectPlan = null }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { currentUser } = useAuth();

  // Plan icons mapping
  const planIcons = {
    'Free': <FaLeaf size={24} className="text-success" />,
    'Basic': <FaRocket size={24} className="text-primary" />,
    'Premium': <FaCrown size={24} className="text-warning" />,
    'Enterprise': <FaBuilding size={24} className="text-danger" />
  };

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getSubscriptionPlans();
        setPlans(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load subscription plans. Please try again later.');
        toast.error('Error loading subscription plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    console.log('Plan selected:', plan);
    console.log('Current billing cycle:', billingCycle);
    
    // Ensure the callback is called with the selected plan and billing cycle
    if (onSelectPlan) {
      console.log('Calling onSelectPlan callback');
      onSelectPlan(plan, billingCycle);
    } else {
      console.log('onSelectPlan callback is not defined');
    }
  };

  // Calculate price based on billing cycle
  const calculatePrice = (plan) => {
    if (plan.name === 'Free' || plan.price === 0) return 0;
    
    // Check if we have the new pricing structure with different billing cycles
    if (plan.pricing) {
      switch (billingCycle) {
        case 'monthly':
          return plan.pricing.monthly;
        case 'quarterly':
          return plan.pricing.quarterly;
        case 'annual':
          return plan.pricing.annual;
        default:
          return plan.pricing.monthly;
      }
    } else {
      // Handle the current mock data structure which just has a single price
      // Apply discounts for different billing cycles
      switch (billingCycle) {
        case 'monthly':
          return plan.price;
        case 'quarterly':
          // 10% discount for quarterly
          return Math.round(plan.price * 3 * 0.9);
        case 'annual':
          // 20% discount for annual
          return Math.round(plan.price * 12 * 0.8);
        default:
          return plan.price;
      }
    }
  };

  // Calculate savings percentage for annual billing
  const calculateSavings = (plan) => {
    if (plan.name === 'Free' || plan.price === 0) return 0;
    
    if (plan.pricing) {
      const monthlyPrice = plan.pricing.monthly;
      const annualPrice = plan.pricing.annual / 12;
      
      if (monthlyPrice === 0) return 0;
      return Math.round(((monthlyPrice - annualPrice) / monthlyPrice) * 100);
    } else {
      // For the current mock data structure, we're applying a 20% discount for annual plans
      return 20;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center my-8">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading subscription plans...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded my-4">{error}</div>;
  }

  return (
    <div className="p-4 font-sans">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-indigo-50 to-indigo-100 p-1 rounded-full shadow-sm border border-indigo-100">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`relative min-w-[90px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out ${billingCycle === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-white/50 hover:text-indigo-500'}`}
            aria-label="Select monthly billing cycle"
          >
            Monthly
          </button>
          
          <button
            onClick={() => setBillingCycle('quarterly')}
            className={`relative min-w-[90px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out ${billingCycle === 'quarterly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-white/50 hover:text-indigo-500'}`}
            aria-label="Select quarterly billing cycle"
          >
            Quarterly
            <span className="absolute -top-2 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">-10%</span>
          </button>
          
          <button
            onClick={() => setBillingCycle('annual')}
            className={`relative min-w-[90px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out ${billingCycle === 'annual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-white/50 hover:text-indigo-500'}`}
            aria-label="Select annual billing cycle"
          >
            Annual
            <span className="absolute -top-2 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">-20%</span>
            {billingCycle === 'annual' && (
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">Best Value</span>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-4">
          {billingCycle === 'monthly' && "Flexible month-to-month billing with no long-term commitment"}
          {billingCycle === 'quarterly' && "Save 10% compared to monthly billing with quarterly payments"}
          {billingCycle === 'annual' && "Our best value option - save 20% with annual billing"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {plans.map((plan) => (
          <div key={plan._id} className="flex">
            <div 
              className={`flex flex-col w-full bg-white rounded-lg border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative ${selectedPlan?._id === plan._id ? 'border-indigo-600 shadow-md shadow-indigo-100 -translate-y-1' : 'border-gray-200 shadow-sm'}`}
            >
              {plan.name === 'Premium' && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Most Popular</span>
                </div>
              )}
              
              <div className={`p-6 text-center border-b border-gray-200 ${plan.name === 'Free' ? 'bg-green-50' : plan.name === 'Basic' ? 'bg-blue-50' : plan.name === 'Premium' ? 'bg-amber-50' : 'bg-red-50'}`}>
                <div className="flex justify-center mb-3">
                  {planIcons[plan.name] || <FaRocket size={24} />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              </div>
              
              <div className="p-6 flex-grow">
                <div className="text-center mb-5">
                  <h2 className="text-3xl font-bold text-gray-900">
                    ₹{calculatePrice(plan)}
                    <span className="text-base font-normal text-gray-500 ml-1">/{billingCycle === 'annual' ? 'year' : billingCycle === 'quarterly' ? 'quarter' : 'month'}</span>
                  </h2>
                  
                  {billingCycle === 'annual' && plan.name !== 'Free' && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Save {calculateSavings(plan)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <hr className="h-px my-5 bg-gray-200 border-0" />
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-4">Features</h5>
                  <ul className="space-y-3">
                    {Array.isArray(plan.features) ? (
                      // Handle features as an array of strings
                      plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-3 flex-shrink-0">
                            <FaCheck className="text-green-500" />
                          </span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))
                    ) : (
                      // Handle features as an object with key-value pairs
                      plan.features && Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-center">
                          <span className="mr-3 flex-shrink-0">
                            {value ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaTimes className="text-red-500" />
                            )}
                          </span>
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .replace(/Max/g, 'Max ')
                              .replace(/Num/g, '# of ')}
                            {typeof value === 'number' && value > 0 ? `: ${value}` : ''}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <button 
                  className={`w-full py-3 px-4 rounded font-medium transition-colors ${selectedPlan?._id === plan._id ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'} ${plan.name === 'Free' && currentUser?.subscription?.plan === 'Free' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.name === 'Free' && currentUser?.subscription?.plan === 'Free'}
                >
                  {selectedPlan?._id === plan._id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
