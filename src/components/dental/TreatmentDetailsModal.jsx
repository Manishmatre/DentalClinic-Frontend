import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { FaUserMd, FaTooth, FaRupeeSign, FaEdit, FaTrash, FaEye, FaHistory, FaFileAlt, FaNotesMedical, FaInfoCircle, FaPrint, FaFileExport } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
import { toast } from 'react-toastify';

const TreatmentDetailsModal = ({
  isOpen,
  onClose,
  treatment,
  onEdit,
  onDelete,
  userRole = 'Admin',
  isLoading = false,
  startInEditMode = false,
  doctorMap = {}
}) => {
  const [localTreatment, setLocalTreatment] = useState(null);
  const [notes, setNotes] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (treatment) {
      setLocalTreatment(treatment);
      setNotes(treatment.notes || '');
      setEditData(treatment);
      setEditMode(startInEditMode);
    }
  }, [treatment, startInEditMode]);

  useEffect(() => {
    if (!isOpen) setEditMode(false);
  }, [isOpen]);

  if (!localTreatment) return null;

  // Edit button handler
  const startEdit = () => {
    setEditData(localTreatment);
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
    setEditData(localTreatment);
  };
  const saveEdit = async () => {
    try {
      const updated = await dentalService.updateTreatment(editData._id, editData);
      setEditMode(false);
      setLocalTreatment(updated);
      setNotes(updated.notes || '');
      if (onEdit) onEdit(updated);
      toast.success('Treatment updated successfully');
    } catch (error) {
      toast.error('Failed to update treatment');
    }
  };

  const doctorDisplay = localTreatment.doctorName || doctorMap[localTreatment.doctor] || localTreatment.doctor?.name || localTreatment.doctor || '-';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Treatment Details" size="xl">
      <div className="p-4">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            Loading...
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Badge text={localTreatment.status} variant={localTreatment.status === 'planned' ? 'primary' : localTreatment.status === 'completed' ? 'success' : 'secondary'} pill />
              <h3 className="text-xl font-semibold text-gray-800 ml-2">
                {localTreatment.procedure} Treatment
              </h3>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <FaTooth className="mr-2" />
              <span>Tooth #{localTreatment.toothNumber}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <FaUserMd className="mr-2" />
              <span>{localTreatment.doctorName || localTreatment.doctor?.name || '-'}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <FaRupeeSign className="mr-2 text-green-500" />
              <span>{localTreatment.finalCost?.toFixed(2) || localTreatment.cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <Badge text={localTreatment.patientApprovalStatus} variant={localTreatment.patientApprovalStatus === 'approved' ? 'success' : localTreatment.patientApprovalStatus === 'pending' ? 'warning' : localTreatment.patientApprovalStatus === 'rejected' ? 'danger' : 'secondary'} pill />
            </div>
          </div>
          <div className="flex space-x-2">
            {!isConfirmingDelete ? (
              <>
                <Button variant="secondary" size="sm" onClick={startEdit} icon={<FaEdit />} title="Edit treatment details">Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setIsConfirmingDelete(true)} icon={<FaTrash />} title="Delete this treatment">Delete</Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} icon={<FaPrint />} title="Print">Print</Button>
                <Button variant="outline" size="sm" onClick={() => {}} icon={<FaFileExport />} title="Export">Export</Button>
              </>
            ) : (
              <>
                <Button variant="danger" size="sm" onClick={() => { onDelete(localTreatment._id); setIsConfirmingDelete(false); onClose(); }}>Confirm Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button>
              </>
            )}
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          {editMode ? (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tooth Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaTooth className="text-yellow-600" /></span>
                    <input type="number" className="w-full pl-10 p-2 border border-gray-300 rounded-md" value={editData.toothNumber || ''} onChange={e => setEditData({ ...editData, toothNumber: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editData.procedure || ''} onChange={e => setEditData({ ...editData, procedure: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUserMd className="text-indigo-500" /></span>
                    <input type="text" className="w-full pl-10 p-2 border border-gray-300 rounded-md" value={editData.doctorName || doctorMap[editData.doctor] || editData.doctor?.name || editData.doctor || ''} onChange={e => setEditData({ ...editData, doctorName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaRupeeSign className="text-green-500" /></span>
                    <input type="number" className="w-full pl-10 p-2 border border-gray-300 rounded-md" value={editData.finalCost || editData.cost || ''} onChange={e => setEditData({ ...editData, finalCost: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editData.status || ''} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                    <option value="planned">Planned</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editData.patientApprovalStatus || ''} onChange={e => setEditData({ ...editData, patientApprovalStatus: e.target.value })}>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-md" rows={4} value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
              </div>
              <div className="flex space-x-2">
                <Button variant="primary" size="sm" type="submit" icon={<FaEdit />}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FaTooth className="mr-2" /> Tooth & Procedure
                  </h4>
                  <p className="text-gray-800 font-medium">Tooth #{localTreatment.toothNumber}</p>
                  <p className="text-gray-600 text-sm">{localTreatment.procedure}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FaUserMd className="mr-2" /> Doctor
                  </h4>
                  <p className="text-gray-800 font-medium">{doctorDisplay}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <FaRupeeSign className="mr-2 text-green-500" /> Cost
                </h4>
                <p className="text-gray-800 font-medium">₹{localTreatment.finalCost?.toFixed(2) || localTreatment.cost?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <FaInfoCircle className="mr-2" /> Status & Approval
                </h4>
                <Badge text={localTreatment.status} variant={localTreatment.status === 'planned' ? 'primary' : localTreatment.status === 'completed' ? 'success' : 'secondary'} pill />
                <Badge text={localTreatment.patientApprovalStatus} variant={localTreatment.patientApprovalStatus === 'approved' ? 'success' : localTreatment.patientApprovalStatus === 'pending' ? 'warning' : localTreatment.patientApprovalStatus === 'rejected' ? 'danger' : 'secondary'} pill className="ml-2" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <FaNotesMedical className="mr-2" /> Notes
                </h4>
                <p className="text-gray-800">{localTreatment.notes || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TreatmentDetailsModal; 