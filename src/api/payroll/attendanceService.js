import axios from '../axios';

function getClinicId() {
  // Try to get from user context/localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.clinicId) return typeof user.clinicId === 'object' ? user.clinicId._id || user.clinicId.id : user.clinicId;
  const clinicId = localStorage.getItem('clinicId');
  if (clinicId) return clinicId;
  return null;
}

const attendanceService = {
  getAttendance: async (params = {}) => {
    const clinicId = params.clinicId || getClinicId();
    const res = await axios.get('/attendance', { params: { ...params, clinicId } });
    return res.data;
  },
  addAttendance: async (data) => {
    const clinicId = data.clinicId || getClinicId();
    const res = await axios.post('/attendance', { ...data, clinicId });
    return res.data;
  },
  updateAttendance: async (id, data) => {
    const clinicId = data.clinicId || getClinicId();
    const res = await axios.put(`/attendance/${id}`, { ...data, clinicId });
    return res.data;
  },
  deleteAttendance: async (id) => {
    const clinicId = getClinicId();
    const res = await axios.delete(`/attendance/${id}`, { data: { clinicId } });
    return res.data;
  },
  getAnalytics: async () => {
    const clinicId = getClinicId();
    const res = await axios.get('/attendance/analytics', { params: { clinicId } });
    return res.data;
  },
  punch: async (data) => {
    const clinicId = data.clinicId || getClinicId();
    const res = await axios.post('/attendance/punch', { ...data, clinicId });
    return res.data;
  },
  getCalendar: async (params = {}) => {
    const clinicId = params.clinicId || getClinicId();
    const res = await axios.get('/attendance/calendar', { params: { ...params, clinicId } });
    return res.data;
  },
  getDailyPunchLog: async (employeeId, date) => {
    const clinicId = getClinicId();
    const res = await axios.get(`/attendance/daily/${employeeId}/${date}`, { params: { clinicId } });
    return res.data;
  }
};

export default attendanceService; 