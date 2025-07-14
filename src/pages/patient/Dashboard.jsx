import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../api/dashboard/dashboardService';
import { formatRevenueData } from '../../utils/chartUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import KpiCard from '../../components/dashboard/KpiCard';
import ChartCard from '../../components/dashboard/ChartCard';
import LineChart from '../../components/dashboard/LineChart';
import { toast } from 'react-toastify';
import { 
  FaCalendarCheck, 
  FaFileInvoiceDollar, 
  FaHistory, 
  FaPrescription, 
  FaTooth, 
  FaUserCog,
  FaChartLine
} from 'react-icons/fa';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    medicalSummary: null,
    billing: {
      pendingAmount: 0,
      paidAmount: 0,
      nextPayment: null,
      paymentHistory: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch patient dashboard data using our service
      const data = await dashboardService.getPatientDashboardData(user._id);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prepare chart data for treatment progress
  const getTreatmentProgressChartData = () => {
    if (!dashboardData.medicalSummary?.treatmentProgress) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.medicalSummary.treatmentProgress.map(item => 
        new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        label: 'Treatment Progress',
        data: dashboardData.medicalSummary.treatmentProgress.map(item => item.value),
        borderColor: '#00a4bd',
        backgroundColor: 'rgba(0, 164, 189, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#00a4bd'
      }]
    };
  };

  // Format payment history for chart
  const getPaymentHistoryChartData = () => {
    if (!dashboardData.billing?.paymentHistory?.length) return { labels: [], datasets: [] };
    
    const paymentData = dashboardData.billing.paymentHistory.map(payment => ({
      date: payment.date,
      value: payment.amount
    }));
    
    return formatRevenueData(paymentData, 'month');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <Alert
          variant="error"
          title="Error Loading Dashboard"
          message={error}
        />
        <div className="mt-4">
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  const { appointments, medicalSummary, billing } = dashboardData;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaTooth className="mr-2 text-indigo-600" /> 
            DentalOS.AI Patient Portal
          </h1>
          <p className="text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => navigate('/patient/appointments/book')}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Upcoming Appointments"
          value={appointments.length}
          icon={<FaCalendarCheck />}
          color="primary"
          onClick={() => navigate('/patient/appointments')}
        />

        <KpiCard
          title="Ongoing Treatments"
          value={medicalSummary?.ongoingTreatments?.length || 0}
          icon={<FaChartLine />}
          color="dental"
          onClick={() => navigate('/patient/medical-history')}
        />

        <KpiCard
          title="Pending Payment"
          value={billing?.pendingAmount.toLocaleString() || 0}
          unit="₹"
          icon={<FaFileInvoiceDollar />}
          color="warning"
          onClick={() => navigate('/patient/billing')}
        />

        <KpiCard
          title="Total Paid"
          value={billing?.paidAmount.toLocaleString() || 0}
          unit="₹"
          icon={<FaFileInvoiceDollar />}
          color="success"
          onClick={() => navigate('/patient/billing')}
        />
      </div>

      {/* Treatment Progress Chart */}
      {medicalSummary?.ongoingTreatments?.length > 0 && (
        <ChartCard 
          title="Treatment Progress" 
          actions={
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate('/patient/medical-history')}
            >
              View Details
            </Button>
          }
        >
          <LineChart data={getTreatmentProgressChartData()} height={250} />
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900">
              Current Treatment: {medicalSummary.ongoingTreatments[0].name}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Next Step: {medicalSummary.ongoingTreatments[0].nextStep}
            </p>
          </div>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments">
          {appointments.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
              <Button 
                variant="primary"
                onClick={() => navigate('/patient/appointments/book')}
              >
                Book an Appointment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.slice(0, 3).map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patient/appointments/${appointment._id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dr. {appointment.doctorId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length > 3 && (
                <div className="p-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    View all {appointments.length} appointments
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Medical Summary Card */}
        <Card title="Medical Summary">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Visit</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {medicalSummary?.lastVisit 
                    ? new Date(medicalSummary.lastVisit).toLocaleDateString()
                    : 'No previous visits'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Next Follow-up</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {medicalSummary?.nextFollowUp 
                    ? new Date(medicalSummary.nextFollowUp).toLocaleDateString()
                    : 'Not scheduled'}
                </div>
              </div>
            </div>

            {medicalSummary?.pastTreatments?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Recent Treatments</label>
                <ul className="space-y-2">
                  {medicalSummary.pastTreatments.slice(0, 2).map((treatment, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">{treatment.name}</div>
                      <div className="text-gray-500 flex justify-between">
                        <span>{treatment.doctor}</span>
                        <span>{new Date(treatment.date).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {medicalSummary?.allergies?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Allergies</label>
                <div className="mt-1 text-sm text-gray-900 flex flex-wrap gap-1">
                  {medicalSummary.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/patient/medical-history')}
            >
              View Full Medical History
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment History Chart */}
      {billing?.paymentHistory?.length > 0 && (
        <ChartCard 
          title="Payment History" 
          actions={
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate('/patient/billing')}
            >
              View All
            </Button>
          }
        >
          <LineChart data={getPaymentHistoryChartData()} height={250} />
        </ChartCard>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Billing & Payments"
          value="View"
          icon={<FaFileInvoiceDollar />}
          color="primary"
          onClick={() => navigate('/patient/billing')}
          className="cursor-pointer"
        />

        <KpiCard
          title="Prescriptions"
          value="Access"
          icon={<FaPrescription />}
          color="dental"
          onClick={() => navigate('/patient/prescriptions')}
          className="cursor-pointer"
        />

        <KpiCard
          title="Profile Settings"
          value="Update"
          icon={<FaUserCog />}
          color="info"
          onClick={() => navigate('/patient/profile-settings')}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PatientDashboard;