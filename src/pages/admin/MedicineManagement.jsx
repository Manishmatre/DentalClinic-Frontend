import React, { useEffect, useRef, useState } from 'react';
import MedicineList from '../../components/medicine/MedicineList';
import medicineService from '../../api/medicineService';
import MedicineFormModal from '../../components/medicine/MedicineFormModal';
import { toast } from 'react-toastify';

const AdminMedicineManagementPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMedicines, setTotalMedicines] = useState(0);

  const fetchMedicines = async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    try {
      const response = await medicineService.getMedicines({ page, limit });
      setMedicines(Array.isArray(response.data) ? response.data : []);
      setTotalMedicines(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(response.pagination?.page || 1);
      setPageSize(response.pagination?.limit || limit);
    } catch (err) {
      toast.error('Failed to load medicines');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicines(currentPage, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const openModal = (medicine = null) => {
    setEditMedicine(medicine);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setModalOpen(false);
    setEditMedicine(null);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editMedicine) {
        await medicineService.updateMedicine(editMedicine._id, data);
        toast.success('Medicine updated successfully!');
      } else {
        await medicineService.createMedicine(data);
        toast.success('Medicine added successfully!');
      }
      closeModal();
      fetchMedicines(currentPage, pageSize);
    } catch (err) {
      toast.error('Failed to save medicine');
    }
    setLoading(false);
  };

  const handleEdit = (medicine) => {
    openModal(medicine);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    setLoading(true);
    try {
      await medicineService.deleteMedicine(id);
      fetchMedicines(currentPage, pageSize);
      toast.success('Medicine deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete medicine');
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
        <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
      </div>
      <MedicineList
        medicines={medicines}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalMedicines={totalMedicines}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <MedicineFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editMedicine}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default AdminMedicineManagementPage; 