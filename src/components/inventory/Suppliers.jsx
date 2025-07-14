import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaSearch, FaFilter } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../../api/inventory/supplierService';
import { useToast } from '../../context/ToastContext';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import LoadingSpinner from '../ui/LoadingSpinner';

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const initialForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
};

const SupplierFormModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false, toast }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || { name: '', contactPerson: '', phone: '', email: '', address: '' },
  });

  React.useEffect(() => {
    reset(initialData || { name: '', contactPerson: '', phone: '', email: '', address: '' });
  }, [initialData, isOpen, reset]);

  const submitHandler = async (data) => {
    if (!data.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (onSubmit) await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Supplier' : 'Add Supplier'} size="sm">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <Input
              label="Name"
              required
              error={errors.name?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="contactPerson"
          control={control}
          render={({ field }) => (
            <Input
              label="Contact Person"
              {...field}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              label="Phone"
              {...field}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              label="Email"
              type="email"
              {...field}
            />
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Address"
              rows={2}
              {...field}
            />
          )}
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading || isSubmitting}>Cancel</Button>
          <Button type="submit" loading={loading || isSubmitting} disabled={loading || isSubmitting}>
            {initialData ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const toast = useToast();
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const getSortIcon = (field) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">⇅</span>;
    return sortDirection === 'asc' ? <span className="ml-1 text-blue-500">↑</span> : <span className="ml-1 text-blue-500">↓</span>;
  };

  // Check if user is authenticated before allowing supplier creation or update
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  const fetchSuppliers = async (page = 1, limit = pageSize) => {
    setLoading(true);
    try {
      const res = await getSuppliers({ page, limit, search: searchTerm, sortBy: sortField, sortOrder: sortDirection });
      if (!res || typeof res !== 'object' || ('error' in res && res.error)) {
        toast.error(res?.message || 'Failed to load suppliers');
        setSuppliers([]);
        setPagination({ page: 1, pages: 1, total: 0, limit });
        return;
      }
      setSuppliers(res.data);
      const safePagination = (res && typeof res.pagination === 'object' && res.pagination !== null && typeof res.pagination.page === 'number' && typeof res.pagination.pages === 'number')
        ? res.pagination
        : { page: 1, pages: 1, total: 0, limit };
      setPagination(safePagination);
    } catch (err) {
      toast.error('Failed to load suppliers');
      setSuppliers([]);
      setPagination({ page: 1, pages: 1, total: 0, limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(pagination.page, pageSize);
    // eslint-disable-next-line
  }, [pagination.page, searchTerm, pageSize, sortField, sortDirection]);

  const openAdd = () => {
    setEditSupplier(null);
    setForm(initialForm);
    setShowModal(true);
  };
  const openEdit = (sup) => {
    setEditSupplier(sup);
    setForm({
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
    });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('You must be logged in to add or update suppliers.');
      return;
    }
    try {
    if (editSupplier) {
        await updateSupplier(editSupplier._id, form);
        toast.success('Supplier updated successfully');
    } else {
        const result = await createSupplier(form);
        if (!result || typeof result !== 'object') {
          toast.error('No response from server. Please check your connection or backend.');
          return;
        }
        if (Object.prototype.hasOwnProperty.call(result, 'error') && result.error) {
          toast.error(result.message || 'Failed to save supplier');
          return;
        }
        toast.success('Supplier added successfully');
        closeModal();
        fetchSuppliers(1);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const result = await deleteSupplier(id);
      if (!result || typeof result !== 'object') {
        toast.error('No response from server. Please check your connection or backend.');
        return;
      }
      if (Object.prototype.hasOwnProperty.call(result, 'error') && result.error) {
        toast.error(result.message || 'Failed to delete supplier');
        return;
      }
      toast.success('Supplier deleted');
      fetchSuppliers(1);
    } catch (err) {
      toast.error('Failed to delete supplier');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Add search and filter logic
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Header row: search, filter, add, export, print */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <form onSubmit={e => e.preventDefault()} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <FaFilter />
            </button>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Placeholder for export/print buttons */}
          {/* <Button onClick={...} variant="secondary"><FaFilePdf className="mr-1" />Export PDF</Button> */}
          {/* <Button onClick={...} variant="secondary"><FaPrint className="mr-1" />Print</Button> */}
          <Button variant="primary" onClick={openAdd}>
            <FaPlus className="mr-2" />Add Supplier
          </Button>
        </div>
      </div>
      {/* Optional: filter dropdown (hidden for now) */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 border rounded-md">(Filter options coming soon)</div>
      )}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-8"><LoadingSpinner /></div>
        ) : (!Array.isArray(suppliers) || suppliers.length === 0) ? (
          <div className="text-center py-8 text-gray-500">No suppliers found.</div>
        ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>Name{getSortIcon('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('contactPerson')}>Contact Person{getSortIcon('contactPerson')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('phone')}>Phone{getSortIcon('phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>Email{getSortIcon('email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('address')}>Address{getSortIcon('address')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map(sup => (
                <tr key={sup._id}>
                <td className="px-6 py-4 whitespace-nowrap">{sup.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sup.contactPerson}</td>
                <td className="px-6 py-4 whitespace-nowrap">{sup.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sup.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sup.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button size="sm" variant="secondary" className="mr-2" onClick={() => openEdit(sup)}><FaEdit /></Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(sup._id)}><FaTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {/* Pagination Controls */}
        <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <select value={pageSize} onChange={handlePageSizeChange} className="border rounded px-2 py-1 text-sm">
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
              </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!pagination || typeof pagination.page !== 'number' || pagination.page <= 1}
              onClick={() => handlePageChange((pagination && typeof pagination.page === 'number') ? pagination.page - 1 : 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {(pagination && typeof pagination.page === 'number') ? pagination.page : 1} of {(pagination && typeof pagination.pages === 'number') ? pagination.pages : 1}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={!pagination || typeof pagination.page !== 'number' || typeof pagination.pages !== 'number' || pagination.page >= pagination.pages}
              onClick={() => handlePageChange((pagination && typeof pagination.page === 'number') ? pagination.page + 1 : 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      <SupplierFormModal
        isOpen={showModal}
        onClose={closeModal}
        initialData={editSupplier}
        onSubmit={async (data) => {
          try {
            let result;
            if (editSupplier) {
              result = await updateSupplier(editSupplier._id, data);
            } else {
              result = await createSupplier(data);
            }
            if (!result || typeof result !== 'object') {
              toast.error('No response from server. Please check your connection or backend.');
              return;
            }
            if (Object.prototype.hasOwnProperty.call(result, 'error') && result.error) {
              toast.error(result.message || 'Failed to save supplier');
              return;
            }
            toast.success(editSupplier ? 'Supplier updated successfully' : 'Supplier added successfully');
            closeModal();
            fetchSuppliers(1);
          } catch (error) {
            toast.error('An unexpected error occurred');
          }
        }}
        loading={loading}
        toast={toast}
      />
    </div>
  );
};

export default Suppliers; 