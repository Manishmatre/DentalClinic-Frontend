import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import AsyncSelect from 'react-select/async';
import staffService from '../../api/staff/staffService';

const initialForm = {
  employeeName: '',
  employeeId: '',
  date: '',
  status: 'Present',
};

const AttendanceModal = ({ isOpen, onClose, onSubmit, attendance, mode = 'add' }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (attendance && mode === 'edit') {
      setForm({ ...initialForm, ...attendance });
    } else {
      setForm(initialForm);
    }
  }, [attendance, mode]);

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
    if (!form.date) newErrors.date = 'Date required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit Attendance' : 'Add Attendance'}>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.date && <div className="text-xs text-red-500 mt-1">{errors.date}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
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

export default AttendanceModal; 