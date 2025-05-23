import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/billing/billingService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Billing = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await billingService.getPatientBills(user?._id);
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setIsLoading(true);
      setError(null);

      // In a real application, this would integrate with a payment gateway
      await billingService.processPayment(selectedBill._id, {
        amount: selectedBill.amount,
        method: e.target.paymentMethod.value
      });

      setShowPaymentForm(false);
      setSelectedBill(null);
      await fetchBills();
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  const totalOutstanding = bills.reduce((sum, bill) => 
    bill.status === 'Unpaid' ? sum + bill.amount : sum, 0
  );

  const startPayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Billing & Payments</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Total Outstanding</div>
            <div className="mt-1 text-3xl font-semibold text-red-600">
              ₹{totalOutstanding.toFixed(2)}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Bills Due</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {bills.filter(bill => bill.status === 'Unpaid').length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Last Payment</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">
              {bills.find(bill => bill.status === 'Paid')?.amount.toFixed(2) || '0.00'}
            </div>
          </div>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bill.description}</div>
                      <div className="text-sm text-gray-500">
                        {bill.services.map(service => service.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {bill.status === 'Unpaid' && (
                        <Button
                          onClick={() => startPayment(bill)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Make Payment
              </h3>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    ₹{selectedBill.amount.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a payment method</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedBill(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Pay ₹{selectedBill.amount.toFixed(2)}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;