import React, { useEffect, useRef, useState } from 'react';
import TreatmentsList from '../../components/treatment/TreatmentsList';
import TreatmentFormModal from '../../components/treatment/TreatmentFormModal';
import treatmentService from '../../api/treatments';
import { toast } from 'react-toastify';

const AdminTreatmentManagementPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTreatment, setEditTreatment] = useState(null);
  const [formError, setFormError] = useState('');
  const nameInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTreatments, setTotalTreatments] = useState(0);

  const fetchTreatments = async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    setError('');
    try {
      const response = await treatmentService.getTreatments({ page, limit });
      setTreatments(Array.isArray(response.data) ? response.data : []);
      setTotalTreatments(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(response.pagination?.page || 1);
      setPageSize(response.pagination?.limit || limit);
    } catch (err) {
      setError('Failed to load treatments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTreatments(currentPage, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (modalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const openModal = (treatment = null) => {
    setEditTreatment(treatment);
    setModalOpen(true);
    setError('');
    setFormError('');
  };

  const closeModal = () => {
    if (loading) return;
    setModalOpen(false);
    setEditTreatment(null);
    setError('');
    setFormError('');
  };

  const handleEdit = (treatment) => {
    openModal(treatment);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this treatment?')) return;
    setLoading(true);
    try {
      await treatmentService.deleteTreatment(id);
      fetchTreatments(currentPage, pageSize);
      setSuccess('Treatment deleted successfully!');
    } catch (err) {
      setError('Failed to delete treatment');
    }
    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing size
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Treatment Management</h1>
        {/* Removed Add Treatment button here to avoid duplicate */}
      </div>
      {/* Removed inline error/success messages, use toast instead */}
      <TreatmentsList
        treatments={treatments}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalTreatments={totalTreatments}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <TreatmentFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editTreatment}
        onSubmit={async (data) => {
          setLoading(true);
          setError('');
          setFormError('');
          // Clean data: remove empty/invalid optional fields
          const cleanData = { ...data };
          if (!cleanData.description) delete cleanData.description;
          if (!cleanData.category) delete cleanData.category;
          if (cleanData.duration === '' || isNaN(Number(cleanData.duration))) delete cleanData.duration;
          if (cleanData.price === '' || isNaN(Number(cleanData.price))) delete cleanData.price;
          try {
            if (editTreatment) {
              await treatmentService.updateTreatment(editTreatment._id, cleanData);
              toast.success('Treatment updated successfully!');
            } else {
              await treatmentService.createTreatment(cleanData);
              toast.success('Treatment added successfully!');
            }
            closeModal();
            fetchTreatments(currentPage, pageSize);
          } catch (err) {
            toast.error('Failed to save treatment');
          }
          setLoading(false);
        }}
        loading={loading}
      />
    </div>
  );
};

export default AdminTreatmentManagementPage; 