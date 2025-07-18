import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import AsyncSelect from 'react-select/async';
import staffService from '../../api/staff/staffService';

const initialForm = {
  employeeName: '',
  employeeId: '',
  month: '',
  year: '',
  amount: '',
  status: 'Pending',
};

const PayrollModal = ({ isOpen, onClose, onSubmit, payroll, mode = 'add' }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payroll && mode === 'edit') {
      setForm({ ...initialForm, ...payroll });
    } else {
      setForm(initialForm);
    }
  }, [payroll, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const loadStaffOptions = async (inputValue) => {
    try {
      const res = await staffService.getStaff({ search: inputValue, status: 'Active' });
      const staffList = Array.isArray(res.data) ? res.data : [];
      return staffList.map(staff => ({
        value: staff._id,
        label: staff.name,
        data: staff
      }));
    } catch {
      return [];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    const newErrors = {};
    if (!form.employeeId) newErrors.employeeName = 'Employee is required';
    if (!form.month) newErrors.month = 'Month required';
    if (!form.year) newErrors.year = 'Year required';
    if (!form.amount) newErrors.amount = 'Amount required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit Payroll' : 'Add Payroll'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadStaffOptions}
            value={form.employeeId ? { value: form.employeeId, label: form.employeeName } : null}
            onChange={option => {
              setForm(prev => ({
                ...prev,
                employeeId: option ? option.value : '',
                employeeName: option ? option.label : ''
              }));
            }}
            placeholder="Search for an employee..."
            isClearable
          />
          {errors.employeeName && <div className="text-xs text-red-500 mt-1">{errors.employeeName}</div>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Month</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.month && <div className="text-xs text-red-500 mt-1">{errors.month}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. 2024"
            />
            {errors.year && <div className="text-xs text-red-500 mt-1">{errors.year}</div>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.amount && <div className="text-xs text-red-500 mt-1">{errors.amount}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Processed">Processed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PayrollModal; 