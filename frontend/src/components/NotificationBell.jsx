import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ ADDED
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=20');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchNotifications();
  //   // Poll every 30 seconds
  //   const interval = setInterval(fetchNotifications, 30000);
  //   return () => clearInterval(interval);
  // }, [user]);


useEffect(() => {
  console.log('🔔 NotificationBell mounted / user changed');

  fetchNotifications();

  const interval = setInterval(() => {
    console.log('🔔 Polling notifications');
    fetchNotifications();
  }, 30000);

  return () => {
    console.log('🔕 NotificationBell interval cleared');
    clearInterval(interval);
  };
}, [user]);

  // ============================================
  // MARK AS READ
  // ============================================
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // ============================================
  // HANDLE NOTIFICATION CLICK (NEW)
  // ============================================
  const handleNotificationClick = (notification) => {
    // ✅ Navigate to project for chat notifications
    if (notification.type === 'chat' && notification.projectId) {
      navigate(`/projects/${notification.projectId}`);
      setIsOpen(false);
    }
  };

  // ============================================
  // DISMISS NOTIFICATION
  // ============================================
  const dismissNotification = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/dismiss`);
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );
      if (!notifications.find(n => n._id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  // ============================================
  // CLOSE DROPDOWN
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(prev => !prev);
        }}
        className="relative p-2 rounded-lg hover:bg-surface/50 transition-colors"
      >
        <svg className="w-5 h-5 text-muted hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 max-h-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
              <h3 className="font-body text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-light hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">🎉 No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  // ✅ Check if it's a chat notification
                  const isChat = notification.type === 'chat';
                  const isDeleted = notification.type === 'deleted';

                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-border/50 hover:bg-surface/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      } ${isDeleted ? 'bg-red-500/5 border-l-4 border-l-red-500' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-muted'} ${isDeleted ? 'text-red-400' : ''}`}>
                            {isDeleted ? '🗑️ ' : ''}
                            {isChat ? '💬 ' : ''}
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification._id);
                          }}
                          className="text-xs text-muted hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="text-xs text-primary-light hover:underline mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;