import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/billing/billingService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Billing = () => {
  const { clinic } = useAuth();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingService.getBills({ clinicId: clinic._id });
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.response?.data?.message || 'Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  }, [clinic._id]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Billing & Payments</h1>
        <Button onClick={() => window.location.href = '/receptionist/billing/new'}>
          + Create New Bill
        </Button>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card title="Today's Collection">
          <div className="text-2xl font-bold text-indigo-600">₹0.00</div>
          <div className="text-sm text-gray-500">From 0 payments</div>
        </Card>

        <Card title="Pending Payments">
          <div className="text-2xl font-bold text-yellow-600">₹0.00</div>
          <div className="text-sm text-gray-500">From 0 bills</div>
        </Card>

        <Card title="Total Revenue (This Month)">
          <div className="text-2xl font-bold text-green-600">₹0.00</div>
          <div className="text-sm text-gray-500">From 0 transactions</div>
        </Card>
      </div>

      <Card title="Recent Bills">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No bills found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.patient?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : bill.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = `/receptionist/billing/${bill._id}`}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Billing;