import client from '../axios';

const notificationService = {
  // Get notifications for current user
  async getNotifications() {
    try {
      const response = await client.get('/notifications');
      
      // Check response format and handle accordingly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected notification response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await client.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await client.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // Create a new notification for a specific user
  async createNotification(data) {
    try {
      const response = await client.post('/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  // Create notifications for multiple users (e.g., all doctors)
  async createBulkNotifications(data) {
    try {
      const response = await client.post('/notifications/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  },
  
  // Send role-specific notifications
  async notifyRoles(roles, data) {
    try {
      const response = await client.post('/notifications/roles', {
        roles,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error sending role notifications:', error);
      throw error;
    }
  },
  
  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const response = await client.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationService;
