import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthHeaders } from '../../utils/authUtils';

const attachmentService = {
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    // You may want to add appointmentId or other metadata if needed
    const response = await axios.post(`${API_URL}/appointments/attachments`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default attachmentService; 