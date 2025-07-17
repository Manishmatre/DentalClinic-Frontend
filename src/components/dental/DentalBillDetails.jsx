import React, { useState } from 'react';
import Button from '../ui/Button';
import { FaPrint, FaTimes, FaUserMd, FaUser, FaFileInvoiceDollar, FaRupeeSign } from 'react-icons/fa';
import billService from '../../api/billing/billService';

const DentalBillDetails = ({ bill, onClose, payMode = false, onPaymentSuccess }) => {
  if (!bill) return null;

  const [payAmount, setPayAmount] = useState(bill.balanceAmount || 0);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);

  const handlePay = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    setPayError('');
    try {
      const result = await billService.addPayment(bill._id, { amount: payAmount, paymentMethod: payMethod });
      if (result && !result.error) {
        if (onPaymentSuccess) onPaymentSuccess();
        if (onClose) onClose();
      } else {
        setPayError(result?.error || 'Payment failed');
      }
    } catch (err) {
      setPayError(err?.message || 'Payment failed');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaFileInvoiceDollar className="mr-2 text-green-600" />
          Bill #{bill.billNumber || `BILL-${bill._id?.substring(0, 8)}`}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} icon={<FaPrint />}>Print</Button>
          <Button variant="danger" size="sm" onClick={onClose} icon={<FaTimes />}>Close</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center mb-2">
            <FaUser className="mr-2 text-blue-500" />
            <span className="font-medium">Patient:</span>
            <span className="ml-2">{bill.patientId?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center mb-2">
            <FaUserMd className="mr-2 text-indigo-500" />
            <span className="font-medium">Doctor:</span>
            <span className="ml-2">{bill.doctorId?.userId?.name || bill.doctorId?.name || bill.doctorId || 'N/A'}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Date:</span>
            <span className="ml-2">{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-'}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Status:</span>
            <span className="ml-2 capitalize">{bill.status || '-'}</span>
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="font-medium">Notes:</span>
            <span className="ml-2">{bill.notes || '-'}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Payment Method:</span>
            <span className="ml-2">{bill.paymentMethod || '-'}</span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Services / Items</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(bill.items || []).map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                  {(item.cost !== undefined || item.discountPercent !== undefined || item.discountAmount !== undefined || item.finalCost !== undefined) && (
                    <tr>
                      <td colSpan={4} className="px-4 pb-2 pt-0 text-xs text-gray-500">
                        {item.cost !== undefined && <span className="mr-4">Cost: <span className="font-semibold text-gray-700">{formatCurrency(item.cost)}</span></span>}
                        {item.discountPercent !== undefined && <span className="mr-4">Discount %: <span className="font-semibold text-gray-700">{item.discountPercent}%</span></span>}
                        {item.discountAmount !== undefined && <span className="mr-4">Discount Amt: <span className="font-semibold text-gray-700">{formatCurrency(item.discountAmount)}</span></span>}
                        {item.finalCost !== undefined && <span className="mr-4">Final Cost: <span className="font-semibold text-gray-700">{formatCurrency(item.finalCost)}</span></span>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <div className="flex space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span className="text-sm text-gray-500">Tax:</span>
            <span className="text-sm text-gray-500">Discount:</span>
            <span className="text-base font-semibold text-gray-900 mt-1">Total:</span>
            <span className="text-sm text-green-600">Paid:</span>
            <span className="text-sm text-red-600">Balance:</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-900">{formatCurrency(bill.subtotal)}</span>
            <span className="text-sm text-gray-900">{formatCurrency(bill.taxAmount)}</span>
            <span className="text-sm text-gray-900">{formatCurrency(bill.discountAmount)}</span>
            <span className="text-base font-bold text-gray-900 mt-1">{formatCurrency(bill.totalAmount)}</span>
            <span className="text-sm text-green-600">{formatCurrency(bill.paidAmount)}</span>
            <span className="text-sm text-red-600">{formatCurrency(bill.balanceAmount)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Payment History</h4>
        {bill.payments && bill.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bill.payments.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.paymentMethod || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{p.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No payments recorded yet.</div>
        )}
      </div>
      {payMode && bill.balanceAmount > 0 && (
        <form className="mt-6 p-4 border rounded bg-gray-50" onSubmit={handlePay}>
          <h4 className="font-semibold mb-2">Make a Payment</h4>
          <div className="flex flex-col md:flex-row md:space-x-4 mb-3">
            <div className="mb-2 md:mb-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                min={1}
                max={bill.balanceAmount}
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value))}
                className="border rounded px-3 py-1 w-32"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                className="border rounded px-3 py-1 w-32"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={payLoading}>
            {payLoading ? 'Processing...' : `Pay ₹${payAmount}`}
          </Button>
          {payError && <div className="text-red-600 text-sm mt-2">{payError}</div>}
        </form>
      )}
    </div>
  );
};

export default DentalBillDetails; 