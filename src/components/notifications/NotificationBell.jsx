import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Badge, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverHeader, 
  PopoverBody, 
  PopoverFooter,
  Text,
  Flex,
  Button,
  useDisclosure,
  VStack,
  HStack,
  Divider,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaBell, FaCheck, FaCheckDouble, FaExclamationCircle } from 'react-icons/fa';
import notificationService from '../../api/notifications/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkAsRead, onClose }) => {
  const { _id, title, message, status, priority, type, createdAt, link } = notification;
  const isUnread = status === 'unread';
  
  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'orange.500';
      case 'urgent': return 'red.500';
      case 'low': return 'gray.500';
      default: return 'blue.500';
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
    <Box 
      p={3} 
      _hover={{ bg: 'gray.50' }}
      cursor="pointer"
      onClick={handleClick}
      bg={isUnread ? 'blue.50' : 'white'}
      borderLeft="3px solid"
      borderColor={isUnread ? getPriorityColor(priority) : 'transparent'}
    >
      <HStack spacing={3} align="flex-start">
        <Box 
          mt={1}
          color={getPriorityColor(priority)}
        >
          <FaBell />
        </Box>
        <Box flex="1">
          <Text fontWeight={isUnread ? 'bold' : 'medium'} fontSize="sm">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {message}
          </Text>
          <HStack mt={1} spacing={2}>
            <Text fontSize="xs" color="gray.500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </Text>
            {isUnread && (
              <Button 
                size="xs" 
                leftIcon={<FaCheck />}
                colorScheme="blue"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(_id);
                }}
              >
                Mark as read
              </Button>
            )}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

const NotificationBell = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const triggerRef = useRef(null);
  const toast = useToast();

  // Fetch notifications on mount and when bell is clicked
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
        if (!resetPage) setPage(currentPage + 1);
        else setPage(2);
      } else {
        console.warn('Unexpected notification response format:', notifications);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      
      if (Array.isArray(notifications)) {
        setUnreadCount(notifications.filter(n => n.status === 'unread').length);
      } else {
        console.warn('Unexpected notification response format:', notifications);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          status: 'read'
        }))
      );
      setUnreadCount(0);
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, status: 'read' } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    fetchNotifications(false);
  };

  return (
    <Box>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-end"
        closeOnBlur={true}
        trigger="click"
        gutter={0}
      >
        <PopoverTrigger>
          <Box ref={triggerRef}>
            <IconButton
              aria-label="Notifications"
              icon={<FaBell />}
              onClick={onOpen}
              variant="ghost"
              fontSize="20px"
              _hover={{ bg: 'gray.100' }}
              _active={{ bg: 'gray.200' }}
              position="relative"
            >
              {unreadCount > 0 && (
                <Badge
                  color="white"
                  bg="red.500"
                  borderRadius="full"
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  fontSize="0.8em"
                  padding="0 6px"
                  minW="18px"
                  minH="18px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </IconButton>
          </Box>
        </PopoverTrigger>

        <PopoverContent
          width="350px"
          maxH="500px"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
          _focus={{ outline: 'none' }}
        >
          <PopoverHeader fontWeight="bold" borderBottom="1px solid" borderColor="gray.200">
            <Flex justify="space-between" align="center">
              <Text>Notifications</Text>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  leftIcon={<FaCheckDouble />}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </Flex>
          </PopoverHeader>

          <PopoverBody p={0} maxH="380px" overflowY="auto">
            {loading ? (
              <Flex justify="center" align="center" h="100px">
                <Spinner />
              </Flex>
            ) : notifications.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={8}>
                <FaBell size="32px" color="gray" />
                <Text mt={2} color="gray.500">
                  No notifications
                </Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onClose={onClose}
                  />
                ))}
              </VStack>
            )}
          </PopoverBody>

          {notifications.length > 0 && (
            <PopoverFooter borderTop="1px solid" borderColor="gray.200" p={2}>
              {hasMore ? (
                <Button
                  width="100%"
                  size="sm"
                  variant="ghost"
                  onClick={handleLoadMore}
                  isLoading={loadingMore}
                >
                  Load more
                </Button>
              ) : (
                <Text fontSize="xs" textAlign="center" color="gray.500">
                  You've reached the end
                </Text>
              )}
            </PopoverFooter>
          )}
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default NotificationBell;
