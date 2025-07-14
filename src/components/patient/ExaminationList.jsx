import React, { useState, useMemo } from 'react';
import { FaSearch, FaEdit, FaTrash, FaUserMd, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Button from '../ui/Button';

const ExaminationList = ({
  examinations = [],
  loading = false,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-300 ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500 ml-1" /> : <FaSortDown className="text-blue-500 ml-1" />;
  };

  const filteredExaminations = useMemo(() => {
    let data = examinations;
    if (searchTerm) {
      data = data.filter(e =>
        (e.doctor && e.doctor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.chiefComplaint && e.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.diagnosis && e.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    // Sort
    data = [...data].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'date') {
        aVal = new Date(a.createdAt || a.date || 0);
        bVal = new Date(b.createdAt || b.date || 0);
      } else {
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [examinations, searchTerm, sortField, sortDirection]);

  return (
    <>
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <form onSubmit={e => e.preventDefault()} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search examinations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
        <Button
          onClick={() => onEdit(null)}
          variant="primary"
          size="md"
        >
          Add Examination
        </Button>
      </div>
      {/* Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('date')}>
                    Date {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('doctor')}>
                    Doctor {getSortIcon('doctor')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('chiefComplaint')}>
                    Chief Complaint {getSortIcon('chiefComplaint')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('diagnosis')}>
                    Diagnosis {getSortIcon('diagnosis')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : filteredExaminations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No examinations found</td>
                </tr>
              ) : (
                filteredExaminations.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center"><FaUserMd className="text-indigo-500 mr-2" />{exam.doctor || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.chiefComplaint || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.diagnosis || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.plan || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button size="sm" variant="outline" onClick={() => onEdit(exam)} className="mr-2"><FaEdit /></Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(exam)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExaminationList; 