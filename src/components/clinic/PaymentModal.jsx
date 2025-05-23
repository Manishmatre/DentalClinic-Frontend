import React, { useState } from 'react';
import paymentService from '../../api/clinic/paymentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from "../ui/Modal";
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const PaymentModal = ({ isOpen, onClose, plan, amount }) => {
  const { clinic, updateClinicData } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Initialize payment
      const initResponse = await paymentService.initializePayment(clinic._id, {
        plan,
        amount,
        paymentMethod
      });

      // Process payment with card details
      const paymentResponse = await paymentService.processPayment({
        paymentId: initResponse.paymentId,
        cardDetails
      });

      // Verify payment
      await paymentService.verifyPayment(paymentResponse.paymentId);

      // Update clinic data to reflect new subscription
      await updateClinicData();

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <div className="p-6">
        {error && (
          <Alert
            variant="error"
            title="Payment Error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
          <p className="mt-1 text-sm text-gray-600">
            Upgrading to {plan} plan - ${amount}/month
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                name="number"
                value={cardDetails.number}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={cardDetails.expiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <input
                  type="text"
                  name="cvc"
                  value={cardDetails.cvc}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cardholder Name
              </label>
              <input
                type="text"
                name="name"
                value={cardDetails.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${amount}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;