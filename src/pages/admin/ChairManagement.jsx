import React, { useEffect, useRef, useState } from 'react';
import ChairList from '../../components/dental/ChairList';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import chairService from '../../api/dental/chairService';
import ChairFormModal from '../../components/dental/ChairFormModal';
import { toast } from 'react-toastify';

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

const AdminChairManagementPage = () => {
  const [chairs, setChairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editChair, setEditChair] = useState(null);
  const [form, setForm] = useState({ name: '', status: 'available', location: '' });
  const [formError, setFormError] = useState('');
  const nameInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChairs, setTotalChairs] = useState(0);

  const fetchChairs = async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    try {
      const response = await chairService.getChairs({ page, limit });
      setChairs(Array.isArray(response.data) ? response.data : []);
      setTotalChairs(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(response.pagination?.page || 1);
      setPageSize(response.pagination?.limit || limit);
    } catch (err) {
      toast.error('Failed to load chairs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChairs(currentPage, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (modalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [modalOpen]);

  const openModal = (chair = null) => {
    setEditChair(chair);
    setForm(chair ? { name: chair.name, status: chair.status, location: chair.location } : { name: '', status: 'available', location: '' });
    setModalOpen(true);
    setFormError('');
  };

  const closeModal = () => {
    if (loading) return;
    setModalOpen(false);
    setEditChair(null);
    setForm({ name: '', status: 'available', location: '' });
    setFormError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'name' && formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      if (editChair) {
        await chairService.updateChair(editChair._id, form);
        toast.success('Chair updated successfully!');
      } else {
        await chairService.createChair(form);
        toast.success('Chair added successfully!');
      }
      closeModal();
      fetchChairs(currentPage, pageSize);
    } catch (err) {
      toast.error('Failed to save chair');
    }
    setLoading(false);
  };

  const handleEdit = (chair) => {
    openModal(chair);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chair?')) return;
    setLoading(true);
    try {
      await chairService.deleteChair(id);
      fetchChairs(currentPage, pageSize);
      toast.success('Chair deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete chair');
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
        <h1 className="text-2xl font-bold text-gray-900">Chair Management</h1>
        {/* Removed Add Chair button here to avoid duplicate */}
      </div>
      <ChairList
        chairs={chairs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalChairs={totalChairs}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <ChairFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editChair}
        onSubmit={async (data) => {
          setLoading(true);
          setFormError('');
          try {
            if (editChair) {
              await chairService.updateChair(editChair._id, data);
              toast.success('Chair updated successfully!');
            } else {
              await chairService.createChair(data);
              toast.success('Chair added successfully!');
            }
            closeModal();
            fetchChairs(currentPage, pageSize);
          } catch (err) {
            toast.error('Failed to save chair');
          }
          setLoading(false);
        }}
        loading={loading}
      />
    </div>
  );
};

export default AdminChairManagementPage; 