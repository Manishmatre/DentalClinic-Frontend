import React, { useState, useEffect } from 'react';
import { FaFileMedical, FaDownload, FaEye, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import { patientService } from '../../services/patientService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const MedicalRecordsTab = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, [patientId]);

  const fetchMedicalRecords = async () => {
    try {
      const data = await patientService.getMedicalRecords(patientId);
      setRecords(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewer(true);
  };

  const handleDownloadRecord = async (record) => {
    try {
      const response = await patientService.downloadMedicalRecord(record._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading record:', error);
      toast.error('Failed to download record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Records List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {records.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div
                key={record._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FaFileMedical className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {record.title}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <p className="flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="mr-2" />
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </p>
                          <p className="flex items-center text-sm text-gray-500">
                            <FaUserMd className="mr-2" />
                            Dr. {record.doctor.firstName} {record.doctor.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewRecord(record)}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                      title="View Record"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadRecord(record)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Download Record"
                    >
                      <FaDownload className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No medical records found
          </div>
        )}
      </div>

      {/* Record Viewer Modal */}
      {showViewer && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRecord.title}
                </h2>
                <button
                  onClick={() => setShowViewer(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {format(new Date(selectedRecord.date), 'MMM d, yyyy')}
                  </p>
                  <p className="flex items-center">
                    <FaUserMd className="mr-2" />
                    Dr. {selectedRecord.doctor.firstName} {selectedRecord.doctor.lastName}
                  </p>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{selectedRecord.description}</p>
                </div>
                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRecord.attachments.map((attachment) => (
                        <div
                          key={attachment._id}
                          className="flex items-center space-x-2 p-2 border rounded-md"
                        >
                          <FaFileMedical className="h-5 w-5 text-indigo-600" />
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                          <button
                            onClick={() => handleDownloadRecord(attachment)}
                            className="ml-auto text-indigo-600 hover:text-indigo-800"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsTab; 