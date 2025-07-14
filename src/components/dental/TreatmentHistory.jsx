import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import dentalService from '../../api/dental/dentalService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FaPlus, FaFileExport, FaHistory, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';

const TreatmentHistory = ({ patientId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const data = await dentalService.getPatientTreatments(patientId);
        setTreatments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching treatments:', error);
        toast.error('Failed to load treatment history');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchTreatments();
    }
  }, [patientId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter treatments based on search term and filter
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = 
      treatment.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (treatment.notes && treatment.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (treatment.procedureCode && treatment.procedureCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    
    // Last 30 days
    if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && new Date(treatment.date) >= thirtyDaysAgo;
    }
    
    // Last 6 months
    if (filter === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return matchesSearch && new Date(treatment.date) >= sixMonthsAgo;
    }
    
    // Last year
    if (filter === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return matchesSearch && new Date(treatment.date) >= oneYearAgo;
    }
    
    return matchesSearch;
  });

  // Group treatments by date
  const groupedTreatments = filteredTreatments.reduce((groups, treatment) => {
    const date = new Date(treatment.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(treatment);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaHistory className="mr-2 text-blue-500" /> Treatment History
        </h3>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search treatments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
                tabIndex={-1}
              >
                ×
              </button>
            )}
          </div>
          {/* Filter Dropdown */}
          <div className="relative ml-2" ref={filterDropdownRef}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center min-w-[120px] justify-between"
              onClick={() => setShowFilterDropdown((v) => !v)}
              type="button"
            >
              <FaFilter className="mr-2" />
              {filter === 'all' ? 'All Time' :
                filter === 'recent' ? 'Last 30 Days' :
                filter === '6months' ? 'Last 6 Months' :
                filter === '1year' ? 'Last Year' : filter}
              <FaChevronDown className="ml-2" />
            </Button>
            {showFilterDropdown && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filter === 'all' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilter('all'); setShowFilterDropdown(false); }}
                >
                  All Time
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filter === 'recent' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilter('recent'); setShowFilterDropdown(false); }}
                >
                  Last 30 Days
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filter === '6months' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilter('6months'); setShowFilterDropdown(false); }}
                >
                  Last 6 Months
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filter === '1year' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilter('1year'); setShowFilterDropdown(false); }}
                >
                  Last Year
                </button>
              </div>
            )}
          </div>
          {/* Export Button */}
          {filteredTreatments.length > 0 && (
            <Button
              size="sm"
              variant="primary"
              className="flex items-center ml-2"
              onClick={() => toast.info('Export functionality will be implemented in the next phase')}
            >
              <FaFileExport className="mr-2" /> Export
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        {Object.keys(groupedTreatments).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedTreatments)
              .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
              .map(([date, dayTreatments]) => (
                <div key={date} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-md font-medium text-gray-700 mb-2">{date}</h3>
                  <div className="space-y-3">
                    {dayTreatments.map((treatment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="font-semibold">{treatment.procedure}</span>
                              {treatment.procedureCode && (
                                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                                  {treatment.procedureCode}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Tooth #{treatment.toothNumber} {treatment.quadrant ? `(${treatment.quadrant.replace('-', ' ')})` : ''}
                            </div>
                            {treatment.surfaces && treatment.surfaces.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Surfaces: {treatment.surfaces.join(', ')}
                              </div>
                            )}
                            {treatment.notes && (
                              <div className="text-sm mt-2">{treatment.notes}</div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(treatment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {treatment.performedBy && (
                          <div className="text-xs text-gray-500 mt-2">
                            Performed by: {treatment.performedBy.name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filter !== 'all' ? 'No treatments match your filters' : 'No treatment history available'}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TreatmentHistory;
