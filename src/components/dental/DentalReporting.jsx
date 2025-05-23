import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFilePdf, 
  FaDownload, 
  FaCalendarAlt, 
  FaChartBar, 
  FaUserMd, 
  FaTooth, 
  FaFilter
} from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';

// Note: Chart.js and jsPDF need to be installed
// npm install chart.js jspdf jspdf-autotable

const DentalReporting = ({ patientId, clinicId }) => {
  const [loading, setLoading] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('treatment-summary');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    treatmentsByType: {},
    treatmentsByTooth: {},
    treatmentsByDoctor: {}
  });
  
  // Chart references will be used when Chart.js is installed
  // const treatmentChartRef = useRef(null);
  // const toothChartRef = useRef(null);
  // const doctorChartRef = useRef(null);
  
  // Fetch treatments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch treatments for patient or clinic
        let treatmentsData;
        if (patientId) {
          treatmentsData = await dentalService.getPatientTreatments(patientId);
        } else if (clinicId) {
          treatmentsData = await dentalService.getClinicTreatments(clinicId, dateRange);
        } else {
          toast.error('Missing patient ID or clinic ID');
          setLoading(false);
          return;
        }
        
        // Fetch doctors for filter
        const doctorsData = await dentalService.getDoctors();
        setDoctors(doctorsData);
        
        setTreatments(treatmentsData);
        processData(treatmentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load report data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, clinicId, dateRange]);
  
  // Process data for reports
  const processData = (treatmentsData) => {
    // Filter by date range if specified
    let filteredTreatments = treatmentsData;
    if (dateRange.start) {
      filteredTreatments = filteredTreatments.filter(
        t => new Date(t.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filteredTreatments = filteredTreatments.filter(
        t => new Date(t.date) <= endDate
      );
    }
    
    // Filter by doctor if specified
    if (selectedDoctor !== 'all') {
      filteredTreatments = filteredTreatments.filter(
        t => t.performedBy && t.performedBy.id === selectedDoctor
      );
    }
    
    // Calculate statistics
    const treatmentsByType = {};
    const treatmentsByTooth = {};
    const treatmentsByDoctor = {};
    
    filteredTreatments.forEach(treatment => {
      // Count by procedure type
      const procedure = treatment.procedure || 'Unknown';
      treatmentsByType[procedure] = (treatmentsByType[procedure] || 0) + 1;
      
      // Count by tooth
      const tooth = treatment.toothNumber || 'Unknown';
      treatmentsByTooth[tooth] = (treatmentsByTooth[tooth] || 0) + 1;
      
      // Count by doctor
      const doctor = treatment.performedBy ? 
        (treatment.performedBy.name || 'Unknown') : 'Unknown';
      treatmentsByDoctor[doctor] = (treatmentsByDoctor[doctor] || 0) + 1;
    });
    
    setStats({
      totalTreatments: filteredTreatments.length,
      treatmentsByType,
      treatmentsByTooth,
      treatmentsByDoctor
    });
    
    // Update charts
    updateCharts(treatmentsByType, treatmentsByTooth, treatmentsByDoctor);
  };
  
  // Update chart visualizations - will be implemented when Chart.js is installed
  const updateCharts = (treatmentsByType, treatmentsByTooth, treatmentsByDoctor) => {
    // Charts will be implemented when Chart.js is installed
    console.log('Chart data ready:', { treatmentsByType, treatmentsByTooth, treatmentsByDoctor });
  };
  
  // Handle date range change
  const handleDateRangeChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };
  
  // Generate PDF report - will be implemented when jsPDF is installed
  const generatePDF = () => {
    toast.info('PDF generation requires jsPDF package. Please install it with: npm install jspdf jspdf-autotable');
    
    // For now, we'll just show the data that would go into the PDF
    console.log('Report data ready for PDF:', {
      patient: patientId ? 'Patient-specific report' : 'Clinic-wide report',
      dateRange,
      stats,
      treatments: treatments.length > 0 ? `${treatments.length} treatments` : 'No treatments'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold">Dental Treatment Reports</h2>
        <button
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          onClick={generatePDF}
        >
          <FaFilePdf className="mr-2" />
          Export PDF Report
        </button>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaCalendarAlt className="inline mr-1" /> Start Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange(e, 'start')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaCalendarAlt className="inline mr-1" /> End Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange(e, 'end')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaUserMd className="inline mr-1" /> Provider
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">All Providers</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaChartBar className="inline mr-1" /> Report Type
          </label>
          <select
            className="w-full p-2 border rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="treatment-summary">Treatment Summary</option>
            <option value="tooth-analysis">Tooth Analysis</option>
            <option value="provider-performance">Provider Performance</option>
          </select>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded shadow-sm">
          <div className="flex items-center mb-2">
            <FaChartBar className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">Total Treatments</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.totalTreatments}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded shadow-sm">
          <div className="flex items-center mb-2">
            <FaTooth className="text-green-500 mr-2" />
            <h3 className="text-lg font-medium">Unique Teeth Treated</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {Object.keys(stats.treatmentsByTooth).filter(t => t !== 'Unknown').length}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded shadow-sm">
          <div className="flex items-center mb-2">
            <FaUserMd className="text-purple-500 mr-2" />
            <h3 className="text-lg font-medium">Providers Involved</h3>
          </div>
          <p className="text-3xl font-bold text-purple-700">
            {Object.keys(stats.treatmentsByDoctor).length}
          </p>
        </div>
      </div>
      
      {/* Charts - Will be displayed when Chart.js is installed */}
      <div className="mb-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          {reportType === 'treatment-summary' && 'Treatment Type Distribution'}
          {reportType === 'tooth-analysis' && 'Treatments by Tooth Number'}
          {reportType === 'provider-performance' && 'Provider Treatment Distribution'}
        </h3>
        <div className="bg-white p-4 rounded shadow-sm text-center" style={{ height: '300px' }}>
          <div className="flex items-center justify-center h-full">
            <div>
              <FaChartBar className="text-gray-400 text-5xl mx-auto mb-4" />
              <p className="text-gray-500">Charts require Chart.js</p>
              <p className="text-sm text-gray-400 mt-2">Install with: npm install chart.js</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Treatment List */}
      {patientId && (
        <div>
          <h3 className="text-lg font-medium mb-4">Treatment History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Tooth #</th>
                  <th className="py-2 px-4 border-b text-left">Procedure</th>
                  <th className="py-2 px-4 border-b text-left">Provider</th>
                  <th className="py-2 px-4 border-b text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {treatments.length > 0 ? (
                  treatments.map((treatment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">
                        {new Date(treatment.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {treatment.toothNumber || 'N/A'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {treatment.procedure}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {treatment.performedBy ? treatment.performedBy.name : 'Unknown'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {treatment.notes || ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      No treatments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalReporting;
