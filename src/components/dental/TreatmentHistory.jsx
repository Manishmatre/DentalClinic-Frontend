import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import dentalService from '../../api/dental/dentalService';

const TreatmentHistory = ({ patientId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Treatment History</h2>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            All Time
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${filter === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('recent')}
          >
            Last 30 Days
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${filter === '6months' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('6months')}
          >
            Last 6 Months
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${filter === '1year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('1year')}
          >
            Last Year
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            className="w-full md:w-64 pl-8 pr-4 py-1 border rounded"
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-2 top-2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Treatment List */}
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
      
      {/* Export Button */}
      {filteredTreatments.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            onClick={() => {
              // Export functionality would go here
              toast.info('Export functionality will be implemented in the next phase');
            }}
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Export Treatment History
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentHistory;
