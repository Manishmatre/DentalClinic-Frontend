import React, { useEffect, useRef, useState } from 'react';
import ChairList from './ChairList';
import ChairFormModal from './ChairFormModal';

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

const ChairManagement = () => {
  const [chairs, setChairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editChair, setEditChair] = useState(null);
  const [form, setForm] = useState({ name: '', status: 'available', location: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const nameInputRef = useRef(null);

  const fetchChairs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chairs', { credentials: 'include' });
      const data = await res.json();
      setChairs(data);
    } catch (err) {
      setError('Failed to load chairs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChairs();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (modalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [modalOpen]);

  const openModal = (chair = null) => {
    setEditChair(chair);
    setForm(chair ? { name: chair.name, status: chair.status, location: chair.location } : { name: '', status: 'available', location: '' });
    setModalOpen(true);
    setError('');
    setFormError('');
  };

  const closeModal = () => {
    if (loading) return; // Prevent closing while loading
    setModalOpen(false);
    setEditChair(null);
    setForm({ name: '', status: 'available', location: '' });
    setError('');
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
    setError('');
    try {
      const method = editChair ? 'PUT' : 'POST';
      const url = editChair ? `/api/chairs/${editChair._id}` : '/api/chairs';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save chair');
      closeModal();
      fetchChairs();
      setSuccess(editChair ? 'Chair updated successfully!' : 'Chair added successfully!');
    } catch (err) {
      setError('Failed to save chair');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chair?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/chairs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete chair');
      fetchChairs();
      setSuccess('Chair deleted successfully!');
    } catch (err) {
      setError('Failed to delete chair');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded shadow relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-10 h-10 animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chair Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => openModal()}>Add Chair</button>
      </div>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <ChairList chairs={chairs} loading={loading} onEdit={openModal} onDelete={handleDelete} />
      <ChairFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editChair}
        onSubmit={async (data) => {
          setLoading(true);
          setError('');
          setFormError('');
          try {
            const method = editChair ? 'PUT' : 'POST';
            const url = editChair ? `/api/chairs/${editChair._id}` : '/api/chairs';
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to save chair');
            closeModal();
            fetchChairs();
            setSuccess(editChair ? 'Chair updated successfully!' : 'Chair added successfully!');
          } catch (err) {
            setError('Failed to save chair');
          }
          setLoading(false);
        }}
        loading={loading}
      />
    </div>
  );
};

export default ChairManagement; 