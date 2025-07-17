import React, { useEffect, useState } from 'react';
import { FaSearch, FaFileExport, FaPrint, FaEdit, FaTrash, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import Button from '../ui/Button';
import staffService from '../../api/staff/staffService';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';
import { FaUserMd, FaRupeeSign, FaTooth } from 'react-icons/fa';
import TreatmentDetailsModal from './TreatmentDetailsModal';
import billService from '../../api/billing/billService';
import BillList from '../../pages/billing/BillList';
import dentalService from '../../api/dental/dentalService';

const TreatmentList = ({ treatments = [], loading = false, error = null, onEdit, onDelete, onView, patientId, clinicId }) => {
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [treatmentStatusFilter, setTreatmentStatusFilter] = useState('all');
  const [treatmentApprovalFilter, setTreatmentApprovalFilter] = useState('approved');
  const [treatmentSort, setTreatmentSort] = useState({ key: 'date', direction: 'desc' });
  const [treatmentsPerPage, setTreatmentsPerPage] = useState(10);
  const [treatmentsPage, setTreatmentsPage] = useState(1);
  const [doctorMap, setDoctorMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [detailsModalEditMode, setDetailsModalEditMode] = useState(false);
  const [localTreatments, setLocalTreatments] = useState(treatments);
  const [billLoading, setBillLoading] = useState(false);
  const [billLoadingId, setBillLoadingId] = useState(null);
  const [bills, setBills] = useState([]);
  const [showBills, setShowBills] = useState(false);

  useEffect(() => {
    // Fetch all doctors for the clinic (limit 100 for now)
    staffService.getStaff({ role: 'Doctor', status: 'Active', limit: 100 }).then(res => {
      const docs = Array.isArray(res?.data) ? res.data : [];
      const map = {};
      docs.forEach(doc => {
        map[doc._id] = doc.name;
        if (doc.userId) map[doc.userId] = doc._id; // Map userId to Doctor _id
      });
      setDoctorMap(map);
    });
  }, []);

  useEffect(() => { setLocalTreatments(treatments); }, [treatments]);

  const handleEdit = (updatedTreatment) => {
    setLocalTreatments(prev => prev.map(t => t._id === updatedTreatment._id ? { ...t, ...updatedTreatment } : t));
    if (onEdit) onEdit(updatedTreatment);
  };

  const fetchBills = async () => {
    if (!patientId) return;
    try {
      const response = await billService.getBills({ patientId });
      if (response && response.bills) setBills(response.bills);
    } catch {}
  };

  // Handler for generating bill from treatment
  const handleGenerateBill = async (treatment) => {
    if (billLoadingId) return;
    setBillLoadingId(treatment._id);
    try {
      // Always use Doctor collection _id for bill doctorId
      let doctorId = null;
      if (treatment.doctor?._id) {
        // If treatment.doctor is a Doctor object
        doctorId = treatment.doctor._id;
      } else if (doctorMap[treatment.doctor]) {
        // If treatment.doctor is a staff/user _id, map to Doctor _id
        doctorId = doctorMap[treatment.doctor];
      } else if (typeof treatment.doctor === 'string' && /^[a-fA-F0-9]{24}$/.test(treatment.doctor)) {
        doctorId = treatment.doctor;
      }
      // If doctorId is not a valid 24-char hex string, set to undefined
      if (typeof doctorId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(doctorId)) doctorId = undefined;
      // Prepare bill data from treatment
      const billData = {
        clinicId,
        patientId,
        doctorId,
        appointmentId: treatment.appointmentId || undefined,
        billDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        items: [
          {
            name: treatment.procedure,
            description: treatment.notes || '',
            quantity: 1,
            unitPrice: treatment.cost || 0, // Always use full/original cost
            discount: treatment.discountAmount || 0, // Discount amount
            discountPercent: treatment.discountPercent || 0, // Discount percent
            finalCost: treatment.finalCost || ((treatment.cost || 0) - (treatment.discountAmount || 0)), // Final cost after discount
            tax: 0,
            totalAmount: (treatment.cost || 0) * 1, // Full price for 1 qty, no discount
            procedureId: treatment._id,
            category: 'procedure',
            cost: treatment.cost || 0, // Store original cost for reference
          }
        ],
        subtotal: treatment.cost || 0,
        taxAmount: 0,
        discountAmount: treatment.discountAmount || 0,
        totalAmount: (treatment.cost || 0) - (treatment.discountAmount || 0),
        paidAmount: 0,
        balanceAmount: (treatment.cost || 0) - (treatment.discountAmount || 0),
        status: 'pending',
        notes: treatment.notes || '',
      };
      const result = await billService.createBill(billData);
      if (result && !result.error) {
        await fetchBills();
        setShowBills(true);
        // Optimistically update the treatment as billed in the UI
        setLocalTreatments(prev => prev.map(t =>
          t._id === treatment._id ? { ...t, billId: result._id || true, billed: true } : t
        ));
        // Then fetch the updated treatment from the backend to ensure accuracy
        try {
          const updatedTreatment = await dentalService.getTreatmentById(treatment._id);
          setLocalTreatments(prev => prev.map(t =>
            t._id === treatment._id ? updatedTreatment : t
          ));
        } catch (err) {
          // fallback: do nothing, UI will update on next reload
        }
      }
    } catch (error) {
      // toast.error('Failed to generate bill');
    } finally {
      setBillLoadingId(null);
    }
  };

  useEffect(() => { if (showBills) fetchBills(); }, [showBills, patientId]);

  const filteredTreatments = localTreatments
    .filter(t =>
      (!treatmentSearch ||
        t.procedure?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        t.doctor?.name?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        t.notes?.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
        String(t.toothNumber).includes(treatmentSearch)
      ) &&
      (treatmentStatusFilter === 'all' || t.status === treatmentStatusFilter) &&
      (treatmentApprovalFilter === 'all' || t.patientApprovalStatus === treatmentApprovalFilter)
    );
  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    let aValue = a[treatmentSort.key];
    let bValue = b[treatmentSort.key];
    if (treatmentSort.key === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    if (aValue < bValue) return treatmentSort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return treatmentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sortedTreatments.length / treatmentsPerPage);
  const paginatedTreatments = sortedTreatments.slice((treatmentsPage - 1) * treatmentsPerPage, treatmentsPage * treatmentsPerPage);

  const csvData = sortedTreatments.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    'Tooth #': t.toothNumber,
    Procedure: t.procedure,
    Doctor: t.doctor?.name || t.doctor || '-',
    Cost: t.finalCost || t.cost || 0,
    Status: t.status,
    Approval: t.patientApprovalStatus,
    Notes: t.notes || ''
  }));

  return (
    <div>
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search treatments..."
              value={treatmentSearch}
              onChange={e => { setTreatmentSearch(e.target.value); setTreatmentsPage(1); }}
            />
          </div>
          <select
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={treatmentStatusFilter}
            onChange={e => { setTreatmentStatusFilter(e.target.value); setTreatmentsPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={treatmentApprovalFilter}
            onChange={e => { setTreatmentApprovalFilter(e.target.value); setTreatmentsPage(1); }}
          >
            <option value="all">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex space-x-2 items-center">
          <label htmlFor="treatmentsPerPage" className="text-xs text-gray-500 mr-1">Rows per page:</label>
          <select
            id="treatmentsPerPage"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={treatmentsPerPage}
            onChange={e => { setTreatmentsPerPage(Number(e.target.value)); setTreatmentsPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={sortedTreatments.length}>Show All</option>
          </select>
          <CSVLink
            data={csvData}
            filename="treatments.csv"
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
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : paginatedTreatments.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No approved or completed treatments</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'date', direction: s.key === 'date' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'toothNumber', direction: s.key === 'toothNumber' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Tooth #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'procedure', direction: s.key === 'procedure' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Procedure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'doctor', direction: s.key === 'doctor' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'finalCost', direction: s.key === 'finalCost' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'status', direction: s.key === 'status' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setTreatmentSort(s => ({ key: 'patientApprovalStatus', direction: s.key === 'patientApprovalStatus' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTreatments.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaTooth className="h-5 w-5 text-yellow-600 mr-2" />
                      {t.toothNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.procedure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <FaUserMd className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <Tooltip content={`Doctor ID: ${t.doctor?._id || t.doctor || 'Unknown'}`}> 
                          <div className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                            {doctorMap[t.doctor] || t.doctor?.name || t.doctor || '-'}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-green-500" />
                      {t.finalCost?.toFixed(2) || t.cost?.toFixed(2) || '0.00'}
                      {t.billId || t.billed ? (
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">Bill Generated</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      text={t.status}
                      variant={t.status === 'planned' ? 'primary' : t.status === 'completed' ? 'success' : 'secondary'}
                      pill
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      text={t.patientApprovalStatus}
                      variant={t.patientApprovalStatus === 'approved' ? 'success' : t.patientApprovalStatus === 'pending' ? 'warning' : t.patientApprovalStatus === 'rejected' ? 'danger' : 'secondary'}
                      pill
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.notes || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => { setSelectedTreatment(t); setDetailsModalEditMode(false); setShowDetailsModal(true); }}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                        title="View Treatment"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => { setSelectedTreatment(t); setDetailsModalEditMode(true); setShowDetailsModal(true); }}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center"
                        title="Edit Treatment"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(t._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                        title="Delete Treatment"
                      >
                        <FaTrash size={16} />
                      </button>
                      <Button
                        variant="secondary"
                        size="xs"
                        className="!px-2 !py-1"
                        onClick={() => handleGenerateBill(t)}
                        title="Generate Bill"
                        icon={<FaFileInvoiceDollar size={14} className="mr-1" />}
                        disabled={!!(t.billId || t.billed) || billLoadingId === t._id}
                      >
                        {t.billId || t.billed ? 'Bill Generated' : billLoadingId === t._id ? 'Generating...' : 'Bill'}
                      </Button>
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
              onClick={() => setTreatmentsPage(treatmentsPage - 1)}
              disabled={treatmentsPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTreatmentsPage(treatmentsPage + 1)}
              disabled={treatmentsPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(treatmentsPage - 1) * treatmentsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(treatmentsPage * treatmentsPerPage, sortedTreatments.length)}</span>{' '}
                of <span className="font-medium">{sortedTreatments.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setTreatmentsPage(treatmentsPage - 1)}
                  disabled={treatmentsPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    treatmentsPage === 1 
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
                    onClick={() => setTreatmentsPage(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      treatmentsPage === number + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => setTreatmentsPage(treatmentsPage + 1)}
                  disabled={treatmentsPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    treatmentsPage === totalPages 
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
      {/* Remove bill list display from here. Bills will be shown in the Billing tab only. */}
      <TreatmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        treatment={selectedTreatment}
        onEdit={handleEdit}
        onDelete={onDelete}
        startInEditMode={detailsModalEditMode}
        doctorMap={doctorMap}
      />
    </div>
  );
};

export default TreatmentList; 