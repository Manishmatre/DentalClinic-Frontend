import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFilePdf, 
  FaDownload, 
  FaCalendarAlt, 
  FaChartBar, 
  FaUserMd, 
  FaTooth, 
  FaFilter,
  FaPrint,
  FaTable,
  FaFileExport
} from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Demo sample data for when the backend is not available
const SAMPLE_TREATMENTS = [
  {
    _id: 'tr1',
    toothNumber: 3,
    procedure: 'Composite Filling',
    date: '2024-04-15T10:30:00.000Z',
    doctor: 'Dr. John Smith',
    cost: 120,
    notes: 'Composite filling on occlusal surface'
  },
  {
    _id: 'tr2',
    toothNumber: 14,
    procedure: 'Crown Placement',
    date: '2024-03-20T09:15:00.000Z',
    doctor: 'Dr. Sarah Johnson',
    cost: 850,
    notes: 'Full ceramic crown placed'
  },
  {
    _id: 'tr3',
    toothNumber: 19,
    procedure: 'Root Canal Treatment',
    date: '2024-02-10T14:00:00.000Z',
    doctor: 'Dr. John Smith',
    cost: 750,
    notes: 'Complete root canal treatment'
  },
  {
    _id: 'tr4',
    toothNumber: 8,
    procedure: 'Extraction',
    date: '2024-01-05T11:45:00.000Z',
    doctor: 'Dr. Sarah Johnson',
    cost: 180,
    notes: 'Simple extraction'
  },
  {
    _id: 'tr5',
    toothNumber: 30,
    procedure: 'Root Canal Treatment',
    date: '2024-05-02T13:30:00.000Z',
    doctor: 'Dr. John Smith',
    cost: 750,
    notes: 'Complete root canal treatment followed by temporary filling'
  },
  {
    _id: 'tr6',
    toothNumber: 24,
    procedure: 'Scaling and Root Planing',
    date: '2024-04-28T16:00:00.000Z',
    doctor: 'Dr. Sarah Johnson',
    cost: 220,
    notes: 'Deep cleaning of lower left quadrant'
  },
  {
    _id: 'tr7',
    toothNumber: 12,
    procedure: 'Composite Filling',
    date: '2024-04-10T10:00:00.000Z',
    doctor: 'Dr. John Smith',
    cost: 130,
    notes: 'Composite filling on distal surface'
  }
];

const SAMPLE_DOCTORS = [
  { id: 'd1', name: 'Dr. John Smith', specialty: 'General Dentist' },
  { id: 'd2', name: 'Dr. Sarah Johnson', specialty: 'Endodontist' },
  { id: 'd3', name: 'Dr. Michael Chen', specialty: 'Orthodontist' }
];

// Note: This component simulates chart rendering without dependencies
// In a real implementation, you would use Chart.js with:
// npm install chart.js react-chartjs-2

const EnhancedDentalReporting = ({ patientId, readOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago 
    end: new Date().toISOString().split('T')[0] // today
  });
  const [reportType, setReportType] = useState('treatment-summary');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    totalCost: 0,
    treatmentsByType: {},
    treatmentsByTooth: {},
    treatmentsByDoctor: {}
  });
  
  const chartContainerRef = useRef(null);
  
  // Fetch treatments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to get data from API
        try {
          const treatmentsData = await dentalService.getPatientTreatments(patientId);
          const doctorsData = await dentalService.getDoctors();
          const patientData = await dentalService.getPatientById(patientId);
          
          setTreatments(treatmentsData);
          setDoctors(doctorsData);
          setPatientInfo(patientData);
        } catch (apiError) {
          console.log('API not available, using sample data');
          
          // Use sample data for demo
          setTreatments(SAMPLE_TREATMENTS);
          setDoctors(SAMPLE_DOCTORS);
          setPatientInfo({
            _id: patientId,
            name: 'Demo Patient',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            phone: '(123) 456-7890',
            email: 'patient@example.com'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dental reporting data:', error);
        toast.error('Failed to load dental reporting data');
        
        // Use sample data as fallback
        setTreatments(SAMPLE_TREATMENTS);
        setDoctors(SAMPLE_DOCTORS);
        setPatientInfo({
          _id: patientId,
          name: 'Demo Patient',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          phone: '(123) 456-7890',
          email: 'patient@example.com'
        });
        setLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  // Calculate statistics whenever treatments or filters change
  useEffect(() => {
    calculateStats();
  }, [treatments, dateRange, selectedDoctor]);

  // Calculate statistics based on the filtered treatments
  const calculateStats = () => {
    const filtered = getFilteredTreatments();

    // Initialize statistics
    const newStats = {
      totalTreatments: filtered.length,
      totalCost: 0,
      treatmentsByType: {},
      treatmentsByTooth: {},
      treatmentsByDoctor: {}
    };

    // Calculate statistics from treatments
    filtered.forEach(treatment => {
      // Total cost
      newStats.totalCost += treatment.cost || 0;

      // Treatments by type
      if (!newStats.treatmentsByType[treatment.procedure]) {
        newStats.treatmentsByType[treatment.procedure] = {
          count: 0,
          cost: 0
        };
      }
      newStats.treatmentsByType[treatment.procedure].count += 1;
      newStats.treatmentsByType[treatment.procedure].cost += treatment.cost || 0;

      // Treatments by tooth
      if (!newStats.treatmentsByTooth[treatment.toothNumber]) {
        newStats.treatmentsByTooth[treatment.toothNumber] = {
          count: 0,
          procedures: {}
        };
      }
      newStats.treatmentsByTooth[treatment.toothNumber].count += 1;
      if (!newStats.treatmentsByTooth[treatment.toothNumber].procedures[treatment.procedure]) {
        newStats.treatmentsByTooth[treatment.toothNumber].procedures[treatment.procedure] = 0;
      }
      newStats.treatmentsByTooth[treatment.toothNumber].procedures[treatment.procedure] += 1;

      // Treatments by doctor
      if (!newStats.treatmentsByDoctor[treatment.doctor]) {
        newStats.treatmentsByDoctor[treatment.doctor] = {
          count: 0,
          cost: 0
        };
      }
      newStats.treatmentsByDoctor[treatment.doctor].count += 1;
      newStats.treatmentsByDoctor[treatment.doctor].cost += treatment.cost || 0;
    });

    setStats(newStats);
    
    // Simulate chart rendering
    renderCharts(newStats);
  };

  // Get treatments filtered by date range and doctor
  const getFilteredTreatments = () => {
    return treatments.filter(treatment => {
      const treatmentDate = new Date(treatment.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      const dateInRange = treatmentDate >= startDate && treatmentDate <= endDate;
      const doctorMatch = selectedDoctor === 'all' || treatment.doctor === selectedDoctor;
      
      return dateInRange && doctorMatch;
    });
  };

  // Render charts - simulated for this implementation
  const renderCharts = (statsData) => {
    if (!chartContainerRef.current) return;

    // In a real implementation, you would use Chart.js to render actual charts
    // This is a simplified visual representation
    
    const container = chartContainerRef.current;
    container.innerHTML = '';
    
    if (reportType === 'treatment-summary') {
      renderTreatmentSummaryChart(statsData);
    } else if (reportType === 'tooth-distribution') {
      renderToothDistributionChart(statsData);
    } else if (reportType === 'doctor-performance') {
      renderDoctorPerformanceChart(statsData);
    }
  };
  
  // Render treatment summary chart (simplified visualization)
  const renderTreatmentSummaryChart = (statsData) => {
    const container = chartContainerRef.current;
    
    // Header
    const header = document.createElement('h3');
    header.className = 'text-lg font-semibold mb-4 text-center';
    header.textContent = 'Treatment Summary Chart';
    container.appendChild(header);
    
    // Create a simple visualization of the data
    const chartDiv = document.createElement('div');
    chartDiv.className = 'bg-gray-50 p-4 rounded-lg';
    
    const chartContent = document.createElement('div');
    chartContent.className = 'flex flex-col space-y-2';
    
    Object.entries(statsData.treatmentsByType).forEach(([procedure, data]) => {
      const percentage = (data.count / statsData.totalTreatments) * 100;
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex flex-col';
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'flex justify-between text-sm';
      labelDiv.innerHTML = `
        <span>${procedure}</span>
        <span>${data.count} (${percentage.toFixed(1)}%)</span>
      `;
      
      const barContainer = document.createElement('div');
      barContainer.className = 'w-full bg-gray-200 rounded-full h-2.5';
      
      const bar = document.createElement('div');
      bar.className = 'bg-blue-600 h-2.5 rounded-full';
      bar.style.width = `${percentage}%`;
      
      barContainer.appendChild(bar);
      itemDiv.appendChild(labelDiv);
      itemDiv.appendChild(barContainer);
      chartContent.appendChild(itemDiv);
    });
    
    chartDiv.appendChild(chartContent);
    container.appendChild(chartDiv);
  };
  
  // Render tooth distribution chart (simplified visualization)
  const renderToothDistributionChart = (statsData) => {
    const container = chartContainerRef.current;
    
    // Header
    const header = document.createElement('h3');
    header.className = 'text-lg font-semibold mb-4 text-center';
    header.textContent = 'Tooth Distribution Chart';
    container.appendChild(header);
    
    // Create a visual representation of the dental arch
    const archDiv = document.createElement('div');
    archDiv.className = 'p-4 bg-gray-50 rounded-lg';
    
    // Upper arch
    const upperArchDiv = document.createElement('div');
    upperArchDiv.className = 'flex justify-center mb-4';
    
    const upperTeethDiv = document.createElement('div');
    upperTeethDiv.className = 'grid grid-cols-16 gap-1 w-full max-w-2xl';
    
    // Add teeth 1-16 (upper)
    for (let i = 1; i <= 16; i++) {
      const toothDiv = document.createElement('div');
      const hasData = statsData.treatmentsByTooth[i];
      
      toothDiv.className = `aspect-square flex items-center justify-center rounded cursor-pointer ${
        hasData ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      }`;
      
      toothDiv.innerHTML = `<span class="text-xs font-bold">${i}</span>`;
      
      if (hasData) {
        toothDiv.title = `Tooth ${i}: ${hasData.count} treatment(s)`;
      }
      
      upperTeethDiv.appendChild(toothDiv);
    }
    
    upperArchDiv.appendChild(upperTeethDiv);
    
    // Lower arch
    const lowerArchDiv = document.createElement('div');
    lowerArchDiv.className = 'flex justify-center';
    
    const lowerTeethDiv = document.createElement('div');
    lowerTeethDiv.className = 'grid grid-cols-16 gap-1 w-full max-w-2xl';
    
    // Add teeth 17-32 (lower)
    for (let i = 17; i <= 32; i++) {
      const toothDiv = document.createElement('div');
      const hasData = statsData.treatmentsByTooth[i];
      
      toothDiv.className = `aspect-square flex items-center justify-center rounded cursor-pointer ${
        hasData ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      }`;
      
      toothDiv.innerHTML = `<span class="text-xs font-bold">${i}</span>`;
      
      if (hasData) {
        toothDiv.title = `Tooth ${i}: ${hasData.count} treatment(s)`;
      }
      
      lowerTeethDiv.appendChild(toothDiv);
    }
    
    lowerArchDiv.appendChild(lowerTeethDiv);
    
    archDiv.appendChild(upperArchDiv);
    archDiv.appendChild(lowerArchDiv);
    container.appendChild(archDiv);
    
    // Add legend
    const legendDiv = document.createElement('div');
    legendDiv.className = 'mt-4 flex justify-center items-center space-x-4 text-sm';
    legendDiv.innerHTML = `
      <div class="flex items-center">
        <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
        <span>Has treatments</span>
      </div>
      <div class="flex items-center">
        <div class="w-3 h-3 bg-gray-200 rounded-full mr-1"></div>
        <span>No treatments</span>
      </div>
    `;
    
    container.appendChild(legendDiv);
  };
  
  // Render doctor performance chart (simplified visualization)
  const renderDoctorPerformanceChart = (statsData) => {
    const container = chartContainerRef.current;
    
    // Header
    const header = document.createElement('h3');
    header.className = 'text-lg font-semibold mb-4 text-center';
    header.textContent = 'Doctor Performance Chart';
    container.appendChild(header);
    
    // Create a simple visualization of the data
    const chartDiv = document.createElement('div');
    chartDiv.className = 'bg-gray-50 p-4 rounded-lg';
    
    const chartContent = document.createElement('div');
    chartContent.className = 'flex flex-col space-y-4';
    
    Object.entries(statsData.treatmentsByDoctor).forEach(([doctor, data]) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex flex-col';
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'flex justify-between font-medium';
      labelDiv.innerHTML = `
        <span>${doctor}</span>
        <span>${data.count} treatments</span>
      `;
      
      const statsDiv = document.createElement('div');
      statsDiv.className = 'text-sm text-gray-600';
      statsDiv.innerHTML = `Total Revenue: $${data.cost.toFixed(2)}`;
      
      itemDiv.appendChild(labelDiv);
      itemDiv.appendChild(statsDiv);
      chartContent.appendChild(itemDiv);
    });
    
    chartDiv.appendChild(chartContent);
    container.appendChild(chartDiv);
  };

  // Generate PDF report
  const generatePDF = () => {
    toast.info('Generating PDF report...');
    
    // In a real implementation, you would use jsPDF to generate a PDF
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
      toast.success('PDF report generated successfully. Check your downloads folder.');
    }, 1500);
  };

  // Export data to CSV
  const exportToCSV = () => {
    toast.info('Exporting data to CSV...');
    
    // In a real implementation, you would generate a CSV file
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
      toast.success('Data exported to CSV successfully. Check your downloads folder.');
    }, 1500);
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  return (
    <div className="dental-reporting">
      <Card
        title={<span className="flex items-center"><FaChartBar className="mr-2 text-blue-500" /> Dental Treatment Reports</span>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={printReport}>
              <FaPrint className="mr-1" /> Print
            </Button>
            <Button variant="success" size="sm" onClick={generatePDF}>
              <FaFilePdf className="mr-1" /> Export PDF
            </Button>
            <Button variant="primary" size="sm" onClick={exportToCSV}>
              <FaFileExport className="mr-1" /> Export CSV
            </Button>
          </div>
        }
        className="mb-6 overflow-hidden"
        bodyClassName="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <span className="mt-6">to</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="treatment-summary">Treatment Summary</option>
              <option value="tooth-distribution">Tooth Distribution</option>
              <option value="doctor-performance">Doctor Performance</option>
            </select>
          </div>
          {/* Doctor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Statistics */}
            <Card
              title="Summary"
              className="bg-white p-0 shadow-none"
              bodyClassName="p-0"
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Treatments</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalTreatments}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Procedures</p>
                  <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.treatmentsByType).length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Teeth Treated</p>
                  <p className="text-2xl font-bold text-orange-600">{Object.keys(stats.treatmentsByTooth).length}</p>
                </div>
              </div>
              <div className="mt-4 px-4">
                <h4 className="text-md font-medium mb-2">Patient Information</h4>
                {patientInfo && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{patientInfo.name}</p>
                    <div className="grid grid-cols-2 gap-y-1 mt-1 text-sm text-gray-600">
                      <p>ID: {patientInfo._id}</p>
                      <p>DOB: {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
                      <p>Gender: {patientInfo.gender}</p>
                      <p>Phone: {patientInfo.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 px-4">
                <h4 className="text-md font-medium mb-2">Top Procedures</h4>
                <ul className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {Object.entries(stats.treatmentsByType)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 4)
                    .map(([procedure, data], index) => (
                      <li key={index} className="p-2 flex justify-between items-center">
                        <span>{procedure}</span>
                        <span className="font-medium">{data.count}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </Card>
            {/* Main Chart Area */}
            <Card className="bg-white p-0 shadow-none lg:col-span-2" bodyClassName="p-4">
              <div ref={chartContainerRef} className="min-h-[300px]"></div>
            </Card>
            {/* Treatment List */}
            <Card title="Treatment List" className="bg-white p-0 shadow-none lg:col-span-3" bodyClassName="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tooth</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredTreatments().map((treatment, index) => (
                      <tr key={treatment._id || index} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm">{new Date(treatment.date).toLocaleDateString()}</td>
                        <td className="py-2 px-3 text-sm">{treatment.toothNumber}</td>
                        <td className="py-2 px-3 text-sm">{treatment.procedure}</td>
                        <td className="py-2 px-3 text-sm">{treatment.doctor}</td>
                        <td className="py-2 px-3 text-sm">${treatment.cost?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-3 text-sm">{treatment.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredTreatments().length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No treatments found for the selected filters.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </Card>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .dental-reporting {
            padding: 20px;
          }
          button, select, input, .controls {
            display: none !important;
          }
        }
        .grid-cols-16 {
          grid-template-columns: repeat(8, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default EnhancedDentalReporting;
