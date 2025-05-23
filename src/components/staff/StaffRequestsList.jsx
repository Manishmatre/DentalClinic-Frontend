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
  FaExclamationTriangle
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

  useEffect(() => {
    fetchStaffRequests();
  }, [filter, refreshKey]);

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
      toast.error('Failed to load staff requests');
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
      setRefreshKey(prevKey => prevKey + 1);
      
      // Notify parent component that a request was processed with additional info
      if (onRequestProcessed) {
        onRequestProcessed({
          action: actionType,
          staffRequest: selectedRequest,
          staffCreated: actionType === 'approve' ? true : false
        });
      }
    } catch (err) {
      console.error(`Error ${actionType}ing staff request:`, err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(`Failed to ${actionType} staff request: ${err.response?.data?.message || err.message}`);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Staff Requests</h2>
        <div className="flex space-x-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={fetchStaffRequests}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
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
        <div className="space-y-4">
          {staffRequests.map((request) => (
            <Card key={request._id}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUser className="text-gray-500" />
                      <h3 className="font-medium text-lg">{request.name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-400" />
                        <span>{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-gray-400" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <FaUserMd className="text-gray-400" />
                        <span>Role: {request.role}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Requested: {formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    {request.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{request.message}</p>
                      </div>
                    )}
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(request)}
                        disabled={isLoading}
                        icon={<FaCheckCircle />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(request)}
                        disabled={isLoading}
                        icon={<FaTimesCircle />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
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
