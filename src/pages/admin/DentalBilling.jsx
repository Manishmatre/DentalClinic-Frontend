import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { FaMoneyBillWave, FaRupeeSign, FaFileInvoiceDollar, FaUser } from 'react-icons/fa';
import DentalBilling from '../../components/dental/DentalBilling';
import billService from '../../api/billing/billService';
import billingService from '../../api/billing/billingService';

// Helper: check if an invoice is dental (by service name/category)
const isDentalInvoice = (invoice) => {
  if (!Array.isArray(invoice.services)) return false;
  return invoice.services.some(s => {
    const name = (s.name || '').toLowerCase();
    return name.includes('dental') || name.includes('tooth') || name.includes('ortho') || name.includes('crown') || name.includes('root canal') || name.includes('extraction');
  });
};

const DentalBillingAdmin = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDentalBills = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all bills
        const billRes = await billService.getBills({ limit: 1000 });
        const allBills = Array.isArray(billRes.bills) ? billRes.bills : [];
        const dentalBills = allBills.filter(bill => Array.isArray(bill.items) && bill.items.some(item => item.procedureId));
        // Fetch all invoices
        const invoiceRes = await billingService.getInvoices({ limit: 1000 });
        const allInvoices = Array.isArray(invoiceRes.invoices) ? invoiceRes.invoices : Array.isArray(invoiceRes) ? invoiceRes : [];
        const dentalInvoices = allInvoices.filter(isDentalInvoice);
        // Normalize invoices to bill-like objects for display
        const normalizedInvoices = dentalInvoices.map(inv => ({
          ...inv,
          billNumber: inv.invoiceNumber,
          billDate: inv.createdAt,
          totalAmount: inv.total,
          paidAmount: inv.paidAmount,
          balanceAmount: (inv.total || 0) - (inv.paidAmount || 0),
          status: inv.paymentStatus ? inv.paymentStatus.toLowerCase() : 'pending',
          items: inv.services,
          patientId: inv.patientId,
          doctorId: inv.doctorId,
          isInvoice: true
        }));
        // Merge bills and invoices
        setBills([...dentalBills, ...normalizedInvoices]);
      } catch (err) {
        setError('Failed to load dental bills/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchAllClinicDentalBilling();
  }, []);

  // Analytics
  const totalBilled = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalBalance = bills.reduce((sum, b) => sum + (b.balanceAmount || ((b.totalAmount || 0) - (b.paidAmount || 0))), 0);
  const numBills = bills.length;
  const numPatients = new Set(bills.map(b => b.patientId?._id || b.patientId)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaMoneyBillWave className="mr-2 text-indigo-600" />
            Dental Billing
          </h1>
          <p className="text-gray-500">Manage and analyze all dental billing and payments for your clinic</p>
        </div>
      </div>
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-3 p-4">
          <FaFileInvoiceDollar className="text-2xl text-green-600" />
          <div>
            <div className="text-xs text-gray-500">Total Billed</div>
            <div className="text-lg font-bold text-gray-900 flex items-center"><FaRupeeSign className="mr-1" />{totalBilled.toLocaleString()}</div>
          </div>
        </Card>
        <Card className="flex items-center space-x-3 p-4">
          <FaMoneyBillWave className="text-2xl text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">Total Paid</div>
            <div className="text-lg font-bold text-gray-900 flex items-center"><FaRupeeSign className="mr-1" />{totalPaid.toLocaleString()}</div>
          </div>
        </Card>
        <Card className="flex items-center space-x-3 p-4">
          <FaMoneyBillWave className="text-2xl text-red-600" />
          <div>
            <div className="text-xs text-gray-500">Total Balance</div>
            <div className="text-lg font-bold text-gray-900 flex items-center"><FaRupeeSign className="mr-1" />{totalBalance.toLocaleString()}</div>
          </div>
        </Card>
        <Card className="flex items-center space-x-3 p-4">
          <FaUser className="text-2xl text-indigo-600" />
          <div>
            <div className="text-xs text-gray-500">Patients Billed</div>
            <div className="text-lg font-bold text-gray-900">{numPatients}</div>
          </div>
        </Card>
      </div>
      {/* Dental Billing Table/Management */}
      <Card className="p-0">
        {/* Pass no patientId and readOnly=false for admin-wide management */}
        <DentalBilling patientId={null} readOnly={false} bills={bills} loading={loading} error={error} />
      </Card>
    </div>
  );
};

export default DentalBillingAdmin; 