import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaUserMd, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import staffRequestService from '../../api/staff/staffRequestService';

const StaffRequestsList = ({ onRequestProcessed }) => {
  const [staffRequests, setStaffRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStaffRequests();
  }, [filter, refreshKey]);
  
  // Clear any success/error messages when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const fetchStaffRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = filter !== 'all' ? { status: filter } : {};
      
      console.log('Fetching staff requests with params:', params);
      console.log('Using filter:', filter);
      
      const response = await staffRequestService.getStaffRequests(params);
      console.log('Staff requests response:', response);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        console.log('Using response.data array format');
        setStaffRequests(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Using response.data.data array format');
        setStaffRequests(response.data.data);
      } else if (Array.isArray(response)) {
        console.log('Using direct array response format');
        setStaffRequests(response);
      } else {
        console.error('Unexpected response format:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null or undefined');
        setStaffRequests([]);
      }
    } catch (err) {
      console.error('Error fetching staff requests:', err);
      setError(err.response?.data?.message || 'Failed to load staff requests');
      toast.error('Failed to load staff requests. Please try again later.');
      setStaffRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setActionType('approve');
    setResponseMessage(`Your request to join as a ${request.role} has been approved. Welcome to our clinic!`);
    setShowResponseModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setActionType('reject');
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setIsLoading(true);
      console.log(`Processing staff request ${selectedRequest._id} with action: ${actionType}`);
      
      const response = await staffRequestService.processStaffRequest(
        selectedRequest._id,
        actionType,
        responseMessage
      );
      
      console.log('Staff request processing response:', response);
      
      // Show appropriate success message
      if (actionType === 'approve') {
        toast.success('Staff request approved successfully. Staff member added to staff list.');
      } else {
        toast.success('Staff request rejected successfully.');
      }
      
      setShowResponseModal(false);
      setSelectedRequest(null);
      setResponseMessage('');
      
      // Force refresh the list
      setRefreshKey(prev => prev + 1);
      
      // Notify parent component if needed with detailed information
      if (onRequestProcessed) {
        onRequestProcessed({
          action: actionType,
          requestId: selectedRequest._id,
          staffName: selectedRequest.name,
          staffRole: selectedRequest.role,
          responseMessage,
          success: true
        });
      }
    } catch (err) {
      console.error('Error processing staff request:', err);
      toast.error(err.response?.data?.message || 'Failed to process staff request. Please try again.');
      setShowResponseModal(false);
      
      // Notify parent of failure if callback exists
      if (onRequestProcessed) {
        onRequestProcessed({
          action: actionType,
          requestId: selectedRequest?._id,
          error: err.message || 'Unknown error occurred',
          success: false
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge color="yellow" text="Pending" />;
      case 'approved':
        return <Badge color="green" text="Approved" />;
      case 'rejected':
        return <Badge color="red" text="Rejected" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading && staffRequests.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="staff-requests-container">
      {/* Filter Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <Button
            variant={filter === 'pending' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-indigo-600' : 'bg-gray-200 text-gray-700'}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600' : 'bg-gray-200 text-gray-700'}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'rejected' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('rejected')}
            className={filter === 'rejected' ? 'bg-red-600' : 'bg-gray-200 text-gray-700'}
          >
            Rejected
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gray-700' : 'bg-gray-200 text-gray-700'}
          >
            All
          </Button>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          <FaInfoCircle className="mr-1" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      )}
      
      {!isLoading && staffRequests.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-gray-500">
            <FaExclamationTriangle className="mx-auto text-yellow-500 text-3xl mb-2" />
            <p>No staff requests found with status: <strong>{filter === 'all' ? 'Any' : filter}</strong>.</p>
            {filter !== 'all' && (
              <p className="mt-2">Try changing the filter to see all requests or check back later.</p>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setRefreshKey(prevKey => prevKey + 1);
                toast.info('Refreshing staff requests...');
              }}
            >
              Refresh List
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {staffRequests.map((request) => (
            <Card key={request._id} className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${request.status === 'pending' ? 'border-l-4 border-l-indigo-500' : request.status === 'approved' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <div className="p-0">
                <div className="bg-gradient-to-r from-gray-50 to-white p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <FaUserMd className="text-indigo-600 text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{request.name}</h3>
                            <div className="text-sm text-gray-500">{request.role} Applicant</div>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-700 border-b pb-1 mb-2">Contact Information</h4>
                          <div className="flex items-center space-x-2">
                            <FaEnvelope className="text-indigo-400" />
                            <span className="text-gray-700">{request.email}</span>
                          </div>
                          {request.phone && (
                            <div className="flex items-center space-x-2">
                              <FaPhone className="text-indigo-400" />
                              <span className="text-gray-700">{request.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-700 border-b pb-1 mb-2">Request Details</h4>
                          <div className="flex items-center space-x-2">
                            <FaUserMd className="text-indigo-400" />
                            <span className="text-gray-700">Applied for: <span className="font-medium">{request.role}</span></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-indigo-400" />
                            <span className="text-gray-700">Requested on: {formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                          <div className="flex items-start">
                            <FaInfoCircle className="text-blue-500 mt-1 mr-2" />
                            <div>
                              <h4 className="font-medium text-blue-700 mb-1">Applicant Message</h4>
                              <p className="text-sm text-gray-700">{request.message}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end space-x-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={isLoading}
                      icon={<FaCheckCircle />}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(request)}
                      disabled={isLoading}
                      icon={<FaTimesCircle />}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h3>
            <p className="mb-4">
              {actionType === 'approve'
                ? `Are you sure you want to approve ${selectedRequest.name} as a ${selectedRequest.role}?`
                : `Are you sure you want to reject ${selectedRequest.name}'s request?`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Message:
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows="3"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={actionType === 'approve' 
                  ? "Enter a welcome message (optional)" 
                  : "Enter a reason for rejection (optional)"}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowResponseModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'success' : 'danger'}
                onClick={handleProcessRequest}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRequestsList;
