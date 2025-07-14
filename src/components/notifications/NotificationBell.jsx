import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaExclamationCircle, FaTooth, FaBoxOpen, FaCalendarAlt, FaUser, FaEnvelope, FaCog } from 'react-icons/fa';
import notificationService from '../../api/notifications/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkAsRead, onClose }) => {
  const { _id, title, message, status, priority, type, createdAt, link } = notification;
  const isUnread = status === 'unread';
  
  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-orange-500 border-orange-500';
      case 'urgent': return 'text-red-500 border-red-500';
      case 'low': return 'text-gray-500 border-gray-500';
      default: return 'text-indigo-600 border-indigo-600';
    }
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dental_procedure':
        return <FaTooth className="h-4 w-4" />;
      case 'inventory':
        return <FaBoxOpen className="h-4 w-4" />;
      case 'appointment':
        return <FaCalendarAlt className="h-4 w-4" />;
      case 'profile':
        return <FaUser className="h-4 w-4" />;
      case 'message':
        return <FaEnvelope className="h-4 w-4" />;
      case 'settings':
        return <FaCog className="h-4 w-4" />;
      default:
        return <FaBell className="h-4 w-4" />;
    }
  };

  // Handle click on notification
  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(_id);
    }
    
    // Navigate to link if provided
    if (link) {
      window.location.href = link;
    }
    
    onClose();
  };
  
  return (
    <div 
      className={`p-3 cursor-pointer border-l-4 ${isUnread ? `${getPriorityColor(priority)} bg-blue-50` : 'border-transparent bg-white'} hover:bg-gray-50`}
      onClick={handleClick}
    >
      <div className="flex space-x-3 items-start">
        <div className={`mt-1 ${getPriorityColor(priority).split(' ')[0]}`}>
          {getNotificationIcon(type)}
        </div>
        <div className="flex-1">
          <div className={`text-sm ${isUnread ? 'font-bold' : 'font-medium'}`}>
            {title}
          </div>
          <div className="text-xs text-gray-600 line-clamp-2">
            {message}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
            {isUnread && (
              <button 
                className="text-xs text-indigo-600 flex items-center hover:text-indigo-800 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(_id);
                }}
              >
                <FaCheck className="mr-1 h-3 w-3" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && 
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when bell is clicked
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = async (resetPage = true) => {
    try {
      setLoading(resetPage);
      if (!resetPage) setLoadingMore(true);
      
      const currentPage = resetPage ? 1 : page;
      const notifications = await notificationService.getNotifications();
      
      if (Array.isArray(notifications)) {
        if (resetPage) {
          setNotifications(notifications);
        } else {
          setNotifications(prev => [...prev, ...notifications]);
        }
        
        setHasMore(notifications.length === 10);
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      // For development, just count unread notifications from mock data
      if (import.meta.env.DEV) {
        const notifications = await notificationService.getNotifications();
        const unreadCount = notifications.filter(n => n.status === 'unread').length;
        setUnreadCount(unreadCount);
        return;
      }
      
      // For production, make API call to get unread count
      const response = await fetch('/api/notifications/unread-count');
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          status: 'read'
        }))
      );
      setUnreadCount(0);
      
      // Show success toast (using browser alert for now, can be replaced with a custom toast)
      alert('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, status: 'read' } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      alert('Failed to mark notification as read');
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    fetchNotifications(false);
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        className="relative p-2 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div 
          ref={notificationRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200"
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="text-xs flex items-center text-white hover:text-gray-200 focus:outline-none"
                onClick={handleMarkAllAsRead}
              >
                <FaCheckDouble className="mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FaBell className="h-8 w-8 mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              {hasMore ? (
                <button
                  className="w-full text-sm text-indigo-600 hover:text-indigo-800 py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-indigo-500 rounded-full mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    'Load more'
                  )}
                </button>
              ) : (
                <p className="text-xs text-center text-gray-500 py-1">
                  You've reached the end
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
