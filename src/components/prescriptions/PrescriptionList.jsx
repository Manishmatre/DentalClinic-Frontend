import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFileMedical, FaEye, FaPrint, FaEdit, 
  FaTrash, FaSearch, FaFilter, FaSortAmountDown, FaChevronDown 
} from 'react-icons/fa';
import prescriptionService from '../../api/prescriptions/prescriptionService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useRef } from 'react';

const PrescriptionList = ({ patientId, readOnly = false }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getPatientPrescriptions(patientId);
      setPrescriptions(data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionService.deletePrescription(id);
        toast.success('Prescription deleted successfully');
        fetchPrescriptions();
      } catch (error) {
        toast.error('Failed to delete prescription');
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const handlePrintPrescription = (prescription) => {
    // Create a printable version of the prescription
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription #${prescription.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
            }
            .prescription-details {
              margin-bottom: 20px;
            }
            .prescription-details p {
              margin: 5px 0;
            }
            .medications {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .medications th, .medications td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .medications th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              text-align: right;
            }
            .doctor-signature {
              margin-top: 60px;
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              float: right;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dental Clinic Prescription</h1>
            <p>123 Dental Street, Cityville, State 12345</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          
          <div class="prescription-details">
            <p><strong>Prescription #:</strong> ${prescription.id}</p>
            <p><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
            <p><strong>Patient ID:</strong> ${prescription.patientId}</p>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
          </div>
          
          <h3>Medications</h3>
          <table class="medications">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications.map(med => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.quantity}</td>
                  <td>${med.instructions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div class="doctor-signature">
              <p>${prescription.doctorName}</p>
              <p>Doctor's Signature</p>
            </div>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Prescription</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Filter and sort prescriptions
  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      // Filter by search term
      const searchMatch = 
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filter by status
      const statusMatch = 
        filterStatus === 'all' || 
        prescription.status === filterStatus;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    });

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
          <FaFileMedical className="mr-2 text-blue-500" /> Prescriptions
        </h3>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search prescriptions..."
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
          {/* Status Dropdown */}
          <div className="relative ml-2" ref={statusDropdownRef}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center min-w-[120px] justify-between"
              onClick={() => setShowStatusDropdown((v) => !v)}
              type="button"
            >
              <FaFilter className="mr-2" />
              {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              <FaChevronDown className="ml-2" />
            </Button>
            {showStatusDropdown && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'all' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('all'); setShowStatusDropdown(false); }}
                >
                  All Status
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'active' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('active'); setShowStatusDropdown(false); }}
                >
                  Active
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterStatus === 'completed' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterStatus('completed'); setShowStatusDropdown(false); }}
                >
                  Completed
                </button>
              </div>
            )}
          </div>
          {/* Sort Button */}
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center ml-2"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <FaSortAmountDown className="mr-1" />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>
          {!readOnly && (
            <Button
              as={Link}
              to={`/prescriptions/new?patientId=${patientId}`}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaFileMedical className="mr-1" /> New Prescription
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        {/* Prescription List Table or Cards */}
        {filteredPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-gray-50 p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-indigo-700">{prescription.diagnosis}</span>
                    <span className="ml-4 text-xs text-gray-500">{new Date(prescription.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Doctor: {prescription.doctorName}</div>
                  <div className="text-xs text-gray-500 mb-1">Prescription #: {prescription.id}</div>
                  <div className="text-xs text-gray-500 mb-1">Status: {prescription.status}</div>
                  <div className="text-xs text-gray-500 mb-1">Medications: {prescription.medications.map(med => med.name).join(', ')}</div>
                  {prescription.notes && <div className="text-xs text-gray-500">Notes: {prescription.notes}</div>}
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0 md:ml-4">
                  <Button size="sm" variant="secondary" onClick={() => handlePrintPrescription(prescription)}><FaPrint className="mr-1" /> Print</Button>
                  {!readOnly && (
                    <>
                      <Link to={`/prescriptions/${prescription.id}/edit`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center"><FaEdit className="mr-1" /> Edit</Link>
                      <Button size="sm" variant="danger" onClick={() => handleDeletePrescription(prescription.id)}><FaTrash className="mr-1" /> Delete</Button>
                    </>
                  )}
                  <Link to={`/prescriptions/${prescription.id}`} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center"><FaEye className="mr-1" /> View</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No prescriptions found</div>
        )}
      </div>
    </Card>
  );
};

export default PrescriptionList;
