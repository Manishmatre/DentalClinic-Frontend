import client from '../api/client';

const emailService = {
  sendSupportEmail: async (userEmail, message) => {
    try {
      const response = await client.post('/api/support/email', {
        email: userEmail,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending support email:', error);
      throw error;
    }
  }
};

export default emailService;