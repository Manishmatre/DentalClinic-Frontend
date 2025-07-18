import axios from '../axios';

function getClinicId() {
  // Try to get from user context/localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.clinicId) return typeof user.clinicId === 'object' ? user.clinicId._id || user.clinicId.id : user.clinicId;
  const clinicId = localStorage.getItem('clinicId');
  if (clinicId) return clinicId;
  return null;
}

const payrollService = {
  getPayrolls: async (params = {}) => {
    const clinicId = params.clinicId || getClinicId();
    const res = await axios.get('/payroll', { params: { ...params, clinicId } });
    return res.data;
  },
  addPayroll: async (data) => {
    const clinicId = data.clinicId || getClinicId();
    const res = await axios.post('/payroll', { ...data, clinicId });
    return res.data;
  },
  updatePayroll: async (id, data) => {
    const clinicId = data.clinicId || getClinicId();
    const res = await axios.put(`/payroll/${id}`, { ...data, clinicId });
    return res.data;
  },
  deletePayroll: async (id) => {
    const clinicId = getClinicId();
    const res = await axios.delete(`/payroll/${id}`, { data: { clinicId } });
    return res.data;
  },
  getAnalytics: async () => {
    const clinicId = getClinicId();
    const res = await axios.get('/payroll/analytics', { params: { clinicId } });
    return res.data;
  }
};

export default payrollService; 