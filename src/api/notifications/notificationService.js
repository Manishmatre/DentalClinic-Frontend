import client from '../client';

// Mock data for development
const mockNotifications = [
  {
    _id: '1',
    title: 'Appointment Reminder',
    message: 'You have an appointment scheduled for tomorrow at 10:00 AM',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'unread',
    priority: 'medium',
    type: 'appointment',
    link: '/admin/appointment-management'
  },
  {
    _id: '2',
    title: 'Profile Update',
    message: 'Your profile information has been updated successfully',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'read',
    priority: 'low',
    type: 'profile',
    link: '/admin/profile'
  },
  {
    _id: '3',
    title: 'New Message',
    message: 'You have a new message from Dr. Smith',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'unread',
    priority: 'medium',
    type: 'message',
    link: null
  },
  {
    _id: '4',
    title: 'Low Inventory Alert',
    message: 'Composite Resin (A2 Shade) is running low. Current stock: 5 units',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'unread',
    priority: 'high',
    type: 'inventory',
    link: '/admin/inventory'
  },
  {
    _id: '5',
    title: 'Dental Procedure Scheduled',
    message: 'Root Canal Treatment for John Doe has been scheduled for tomorrow at 2:00 PM',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'unread',
    priority: 'medium',
    type: 'dental_procedure',
    link: '/admin/dental-procedure-schedule'
  },
  {
    _id: '6',
    title: 'Inventory Item Expiring Soon',
    message: 'Local Anesthetic (Lidocaine 2%) will expire in 15 days',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'read',
    priority: 'high',
    type: 'inventory',
    link: '/admin/inventory'
  },
  {
    _id: '7',
    title: 'Procedure Inventory Check',
    message: 'Inventory check completed for upcoming Dental Crown procedure. All items available.',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    status: 'unread',
    priority: 'low',
    type: 'dental_procedure',
    link: '/admin/dental-procedures'
  }
];

const notificationService = {
  // Get notifications for current user
  async getNotifications() {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log('Using mock notification data in development mode');
        return mockNotifications;
      }
      
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
      // Return mock data in development mode even on error
      if (import.meta.env.DEV) {
        console.log('Returning mock notification data after API error');
        return mockNotifications;
      }
      return [];
    }
  },
  
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log(`Mock: Marking notification ${notificationId} as read`);
        // Return a mock success response
        return { success: true, message: 'Notification marked as read' };
      }
      
      const response = await client.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // In development mode, return a mock success response even on error
      if (import.meta.env.DEV) {
        console.log('Returning mock success response after API error');
        return { success: true, message: 'Notification marked as read (mock)' };
      }
      
      // In production, still throw the error for proper handling
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead() {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log('Mock: Marking all notifications as read');
        return { success: true, message: 'All notifications marked as read' };
      }
      
      const response = await client.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // In development mode, return a mock success response even on error
      if (import.meta.env.DEV) {
        console.log('Returning mock success response after API error');
        return { success: true, message: 'All notifications marked as read (mock)' };
      }
      
      throw error;
    }
  },
  
  // Create a new notification for a specific user
  async createNotification(data) {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log('Mock: Creating notification', data);
        return { success: true, message: 'Notification created successfully' };
      }
      
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
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log('Mock: Creating bulk notifications', data);
        return { success: true, message: 'Bulk notifications created successfully' };
      }
      
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
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log('Mock: Sending notifications to roles', { roles, data });
        return { success: true, message: 'Role notifications sent successfully' };
      }
      
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
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        console.log(`Mock: Deleting notification ${notificationId}`);
        return { success: true, message: 'Notification deleted successfully' };
      }
      
      const response = await client.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  // Dental-specific notification functions
  
  // Create a notification for low dental inventory
  async createLowInventoryNotification(itemName, currentStock, reorderLevel) {
    const data = {
      title: 'Low Inventory Alert',
      message: `${itemName} is running low. Current stock: ${currentStock} units (Reorder level: ${reorderLevel})`,
      priority: 'high',
      type: 'inventory',
      link: '/admin/inventory'
    };
    
    return this.createNotification(data);
  },
  
  // Create a notification for dental procedure scheduling
  async createProcedureScheduledNotification(procedureName, patientName, scheduledDate, dentistName) {
    const formattedDate = new Date(scheduledDate).toLocaleString();
    const data = {
      title: 'Dental Procedure Scheduled',
      message: `${procedureName} for ${patientName} has been scheduled for ${formattedDate} with ${dentistName}`,
      priority: 'medium',
      type: 'dental_procedure',
      link: '/admin/dental-procedure-schedule'
    };
    
    return this.createNotification(data);
  },
  
  // Create a notification for inventory item expiring soon
  async createInventoryExpiryNotification(itemName, daysUntilExpiry) {
    const data = {
      title: 'Inventory Item Expiring Soon',
      message: `${itemName} will expire in ${daysUntilExpiry} days`,
      priority: 'high',
      type: 'inventory',
      link: '/admin/inventory'
    };
    
    return this.createNotification(data);
  },
  
  // Create a notification for inventory check results
  async createInventoryCheckNotification(procedureName, isAvailable, missingItems = []) {
    let message = '';
    let priority = 'low';
    
    if (isAvailable) {
      message = `Inventory check completed for upcoming ${procedureName} procedure. All items available.`;
    } else {
      message = `Inventory check for ${procedureName} procedure shows missing items: ${missingItems.join(', ')}`;
      priority = 'high';
    }
    
    const data = {
      title: 'Procedure Inventory Check',
      message,
      priority,
      type: 'dental_procedure',
      link: '/admin/dental-procedures'
    };
    
    return this.createNotification(data);
  },
  
  // Notify dentist about upcoming procedures
  async notifyDentistAboutProcedure(dentistId, procedureName, patientName, scheduledDate) {
    const formattedDate = new Date(scheduledDate).toLocaleString();
    const data = {
      title: 'Upcoming Dental Procedure',
      message: `You have ${procedureName} for ${patientName} scheduled for ${formattedDate}`,
      priority: 'medium',
      type: 'dental_procedure',
      link: '/doctor/dental-management',
      userId: dentistId
    };
    
    return this.createNotification(data);
  }
};

export default notificationService;
