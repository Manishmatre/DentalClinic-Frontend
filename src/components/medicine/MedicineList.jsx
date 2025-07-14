import React, { useState, useMemo } from 'react';
import { FaSearch, FaEdit, FaTrash, FaCapsules, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Button from '../ui/Button';

const statusColors = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  true: 'Active',
  false: 'Inactive',
};

const MedicineList = ({
  medicines = [],
  loading = false,
  onEdit,
  onDelete,
  totalMedicines = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterActive, setFilterActive] = useState('all');

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredMedicines.map(m => m._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

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

  const filteredMedicines = useMemo(() => {
    let data = medicines;
    if (searchTerm) {
      data = data.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (filterActive !== 'all') {
      data = data.filter(m => String(m.isActive) === filterActive);
    }
    // Sort
    data = [...data].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [medicines, searchTerm, filterActive, sortField, sortDirection]);

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
                placeholder="Search medicines..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterActive}
              onChange={e => setFilterActive(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </form>
        </div>
        <Button
          onClick={() => onEdit(null)}
          variant="primary"
          size="md"
        >
          Add Medicine
        </Button>
      </div>
      {/* Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('name')}>
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('category')}>
                    Category {getSortIcon('category')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('defaultDosage')}>
                    Dosage {getSortIcon('defaultDosage')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('defaultFrequency')}>
                    Frequency {getSortIcon('defaultFrequency')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('defaultDuration')}>
                    Duration {getSortIcon('defaultDuration')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort('isActive')}>
                    Status {getSortIcon('isActive')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">No medicines found</td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(medicine._id)}
                        onChange={() => handleSelectRow(medicine._id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCapsules className="text-indigo-500 mr-2" />
                        <span className="font-medium text-gray-900">{medicine.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{medicine.category || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medicine.defaultDosage || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medicine.defaultFrequency || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medicine.defaultDuration || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[medicine.isActive]}`}>{statusLabels[medicine.isActive]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => onEdit(medicine)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                          title="Edit Medicine"
                        >
                          <FaEdit size={16} />
                          <span className="ml-1 hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(medicine._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                          title="Delete Medicine"
                        >
                          <FaTrash size={16} />
                          <span className="ml-1 hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    {/* Pagination */}
    {!loading && medicines.length > 0 && (
      <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between mt-4">
        <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
          <span>Showing </span>
          <select
            className="mx-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span> of {totalMedicines} medicines</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    )}
  </>
);
};

export default MedicineList; 