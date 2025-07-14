import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFileMedical, FaEye, FaPrint, FaEdit, 
  FaTrash, FaSearch, FaFilter, FaSortAmountDown 
} from 'react-icons/fa';
import prescriptionService from '../../api/prescriptions/prescriptionService';

const PrescriptionList = ({ patientId, readOnly = false }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

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
    <div className="prescription-list">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="pl-8 pr-4 py-2 border rounded-md w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select
            className="border rounded-md px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          
          <button
            className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <FaSortAmountDown className="mr-1" />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
        
        {!readOnly && (
          <Link
            to={`/prescriptions/new?patientId=${patientId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaFileMedical className="mr-2" /> New Prescription
          </Link>
        )}
      </div>
      
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaFileMedical className="mx-auto text-gray-300 text-5xl mb-3" />
          <p className="text-gray-500">No prescriptions found</p>
          {!readOnly && (
            <Link
              to={`/prescriptions/new?patientId=${patientId}`}
              className="mt-3 inline-block text-blue-500 hover:text-blue-700"
            >
              Create a new prescription
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Diagnosis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Medications</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(prescription.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {prescription.diagnosis}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <ul className="list-disc list-inside">
                      {prescription.medications.map((med, index) => (
                        <li key={med.id || index} className="truncate max-w-xs">
                          {med.name} - {med.dosage}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {prescription.doctorName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {prescription.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/prescriptions/${prescription.id}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() => handlePrintPrescription(prescription)}
                        className="text-green-500 hover:text-green-700"
                        title="Print"
                      >
                        <FaPrint />
                      </button>
                      {!readOnly && (
                        <>
                          <Link
                            to={`/prescriptions/edit/${prescription.id}`}
                            className="text-yellow-500 hover:text-yellow-700"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDeletePrescription(prescription.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
