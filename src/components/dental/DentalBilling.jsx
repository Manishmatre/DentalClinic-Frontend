import React, { useEffect, useState } from 'react';
import { FaSearch, FaFileExport, FaPrint, FaEdit, FaTrash, FaEye, FaFileInvoiceDollar, FaRupeeSign, FaUserMd } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';
import billService from '../../api/billing/billService';
import Modal from '../ui/Modal';
import DentalBillDetails from './DentalBillDetails';
import { useAuth } from '../../context/AuthContext';
import doctorService from '../../api/doctors/doctorService';
import patientService from '../../api/patients/patientService';
import serviceService from '../../api/services/serviceService';

// Accept bills, loading, error as props for admin mode
const DentalBillList = ({ patientId, readOnly, bills: billsProp, loading: loadingProp, error: errorProp }) => {
  // If billsProp is provided, use it; otherwise, manage local state
  const [bills, setBills] = useState(billsProp || []);
  const [loading, setLoading] = useState(loadingProp ?? true);
  const [error, setError] = useState(errorProp ?? null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billsPerPage, setBillsPerPage] = useState(10);
  const [billsPage, setBillsPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [payMode, setPayMode] = useState(false);
  const [refreshingBill, setRefreshingBill] = useState(false);
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    doctorId: user?.role === 'Doctor' ? user._id : '',
      patientId: patientId || '',
    appointmentId: '',
    notes: '',
    items: [
      { name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
    ],
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (billsProp) {
      setBills(billsProp);
      setLoading(loadingProp ?? false);
      setError(errorProp ?? null);
      return;
    }
    // Fetch doctors, patients, services, appointments
    doctorService.getDoctors().then(data => setDoctors(data?.doctors || data || []));
    patientService.getPatients().then(setPatients);
    serviceService.getServices().then(data => {
      // Accepts array or object with array property
      if (Array.isArray(data)) setServices(data);
      else if (Array.isArray(data?.services)) setServices(data.services);
      else if (Array.isArray(data?.data)) setServices(data.data);
      else setServices([]);
    });
    // Optionally fetch appointments for patient
    if (patientId) {
      // Replace with actual appointment fetch if available
    }
  }, [patientId, billsProp, loadingProp, errorProp]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx][field] = value;
      return { ...f, items };
    });
  };
  const handleAddItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }] }));
  };
  const handleRemoveItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };
  const handleFormCancel = () => {
    setShowAddForm(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      doctorId: user?.role === 'Doctor' ? user._id : '',
      patientId: patientId || '',
      appointmentId: '',
      notes: '',
      items: [
        { name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }
      ],
    });
    setFormError(null);
  };
  const handleFormSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      // Validate
      if (!form.patientId || !form.doctorId || form.items.length === 0 || !form.items[0].name) {
        setFormError('Please fill all required fields');
        setSaving(false);
      return;
    }
      const payload = {
        ...form,
        items: form.items.map(item => ({
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          tax: Number(item.tax)
        })),
      };
      await billService.createBill(payload);
      setShowAddForm(false);
      handleFormCancel();
      fetchBills();
    } catch (err) {
      setFormError('Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  // Fetch bills only if not in admin mode
  const fetchBills = async () => {
    if (billsProp) return;
    setLoading(true);
    setError(null);
    try {
      const res = await billService.getPatientBills(patientId);
      setBills(Array.isArray(res.bills) ? res.bills : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (patientId && !billsProp) fetchBills(); }, [patientId, billsProp]);

  const handleDelete = async (billId) => {
    if (!window.confirm('Delete this bill?')) return;
    await billService.deleteBill(billId);
    fetchBills();
  };

  const handlePaymentSuccess = async () => {
    setRefreshingBill(true);
    // Refetch bills and update selectedBill
    await fetchBills();
    if (selectedBill?._id) {
      const updated = await billService.getBillById(selectedBill._id);
      setSelectedBill(updated);
    }
    setRefreshingBill(false);
  };

  // Ensure bills is always an array
  const safeBills = Array.isArray(bills) ? bills : [];

  // Filter, search, and paginate
  const filteredBills = safeBills.filter(bill => {
    if (statusFilter !== 'all' && bill.paymentStatus !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (bill.invoiceNumber && bill.invoiceNumber.toLowerCase().includes(s)) ||
        (bill.doctorId?.name && bill.doctorId.name.toLowerCase().includes(s))
      );
    }
    return true;
  });
  const totalPages = Math.ceil(filteredBills.length / billsPerPage) || 1;
  const paginatedBills = filteredBills.slice((billsPage - 1) * billsPerPage, billsPage * billsPerPage);

  useEffect(() => { setBillsPage(1); }, [search, statusFilter, billsPerPage]);

  // CSV Export
  const csvData = filteredBills.map(bill => ({
    Date: bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-',
    'Invoice #': bill.billNumber || `BILL-${bill._id.substring(0, 8)}`,
    Doctor: bill.doctorId?.userId?.name || bill.doctorId?.name || bill.doctorId || 'N/A',
    Amount: bill.totalAmount || 0,
    Status: bill.status || '-',
    Notes: bill.notes || ''
  }));

  return (
    <div>
      {/* Add Bill Form only opens from header bar button */}
      {!readOnly && showAddForm && (
        <div className="bg-white border border-blue-100 rounded-lg p-6 mb-6 shadow-md animate-fade-in space-y-6">
          <form onSubmit={handleFormSave}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} required className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" />
              </div>
              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleFormChange} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" />
              </div>
              {/* Doctor Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Doctor <span className="text-red-500">*</span></label>
                <select name="doctorId" value={form.doctorId} onChange={handleFormChange} required className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2">
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name}</option>)}
                </select>
              </div>
              {/* Appointment Dropdown (optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Appointment</label>
                <select name="appointmentId" value={form.appointmentId} onChange={handleFormChange} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2">
                  <option value="">Select Appointment</option>
                  {appointments.map(app => <option key={app._id} value={app._id}>{app.date} - {app.reason}</option>)}
                </select>
              </div>
            </div>
            {/* Bill Items */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Bill Items <span className="text-red-500">*</span></label>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end border-b pb-4">
                  <div>
                    <select placeholder="Service/Item" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" required>
                      <option value="">Select Service</option>
                      {services.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <input type="number" min={1} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" placeholder="Qty" required />
                  </div>
                  <div>
                    <input type="number" min={0} value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" placeholder="Unit Price" required />
                  </div>
                  <div>
                    <input type="number" min={0} value={item.discount} onChange={e => handleItemChange(idx, 'discount', e.target.value)} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" placeholder="Discount" />
                  </div>
                  <div>
                    <input type="number" min={0} value={item.tax} onChange={e => handleItemChange(idx, 'tax', e.target.value)} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" placeholder="Tax" />
                  </div>
                  <div>
                    <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddItem}>+ Add Item</Button>
            </div>
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleFormChange} className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm px-3 py-2" rows={2} />
            </div>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <div className="flex justify-end gap-2 items-center">
              <Button type="button" variant="secondary" onClick={handleFormCancel}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>Save Bill</Button>
            </div>
          </form>
        </div>
      )}
      {/* Header Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search bills..."
              value={search}
              onChange={e => { setSearch(e.target.value); setBillsPage(1); }}
            />
          </div>
            <select
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setBillsPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        <div className="flex space-x-2 items-center">
          <label htmlFor="billsPerPage" className="text-xs text-gray-500 mr-1">Rows per page:</label>
          <select
            id="billsPerPage"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={billsPerPage}
            onChange={e => { setBillsPerPage(Number(e.target.value)); setBillsPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={filteredBills.length}>Show All</option>
          </select>
          <CSVLink
            data={csvData}
            filename="dental_bills.csv"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaFileExport className="mr-2" /> Export
          </CSVLink>
                        <Button
            variant="outline"
                          size="sm"
            onClick={() => window.print()}
            icon={<FaPrint />}
                        >
            Print
                        </Button>
          {!readOnly && (
            <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
              + Add Bill
                </Button>
          )}
          {/* Add Bill button removed; AddBillForm will be rendered inline below */}
        </div>
      </div>
      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : paginatedBills.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No bills found</div>
      ) : (
            <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 max-w-xs">Notes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                      {bill.billNumber || `BILL-${bill._id.substring(0, 8)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaUserMd className="h-5 w-5 text-indigo-500 mr-2" />
                      <Tooltip content={`Doctor ID: ${bill.doctorId?._id || bill.doctorId || 'Unknown'}`}>
                        <span>
                          {bill.doctorId?.userId?.name || bill.doctorId?.name || bill.doctorId || 'N/A'}
                        </span>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-green-500" />
                      {(bill.totalAmount || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-blue-500" />
                      {(bill.paidAmount || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-red-500" />
                      {(bill.balanceAmount || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      text={bill.status || '-'}
                      variant={bill.status === 'paid' ? 'success' : bill.status === 'pending' ? 'warning' : bill.status === 'partially_paid' ? 'primary' : bill.status === 'cancelled' ? 'danger' : 'secondary'}
                      pill
                        />
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={bill.notes}>{bill.notes || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => { setSelectedBill(bill); setShowDetailsModal(true); }}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                        title="View Bill"
                      >
                        <FaEye size={16} />
                      </button>
                      {!readOnly && (
                        <button
                          onClick={() => { setSelectedBill(bill); setShowDetailsModal(true); }}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center"
                          title="Edit Bill"
                        >
                          <FaEdit size={16} />
                        </button>
                      )}
                      {!readOnly && (
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                          title="Delete Bill"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        className="!px-2 !py-1"
                        onClick={() => window.print()}
                        title="Print Bill"
                        icon={<FaPrint size={14} className="mr-1" />}
                      >
                        Print
                      </Button>
                      {bill.balanceAmount > 0 && (
                        <Button
                          variant="primary"
                          size="xs"
                          className="!px-2 !py-1"
                          onClick={() => { setSelectedBill(bill); setPayMode(true); setShowDetailsModal(true); }}
                          title="Pay Bill"
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillsPage(billsPage - 1)}
              disabled={billsPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillsPage(billsPage + 1)}
              disabled={billsPage === totalPages}
            >
              Next
            </Button>
            </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(billsPage - 1) * billsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(billsPage * billsPerPage, filteredBills.length)}</span>{' '}
                of <span className="font-medium">{filteredBills.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setBillsPage(billsPage - 1)}
                  disabled={billsPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    billsPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => setBillsPage(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      billsPage === number + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => setBillsPage(billsPage + 1)}
                  disabled={billsPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    billsPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
              </div>
            </div>
        </div>
      )}
      {/* AddBillForm will be rendered inline below */}
      {/* Bill Details Modal */}
      {showDetailsModal && selectedBill && (
        <Modal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setPayMode(false); }} title="Bill Details" size="lg">
          <DentalBillDetails
            bill={selectedBill}
            onClose={() => { setShowDetailsModal(false); setPayMode(false); }}
            payMode={payMode}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Modal>
      )}
    </div>
  );
};

export default DentalBillList;
