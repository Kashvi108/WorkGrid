import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ projectId, chatRoomId: initialChatRoomId }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(initialChatRoomId);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================
  // 1. GET OR CREATE CHAT ROOM
  // ============================================
  useEffect(() => {
    const getChatRoom = async () => {
      try {
        const res = await api.get(`/chat/room/${projectId}`);
        console.log('✅ Chat room fetched:', res.data);
        setChatRoomId(res.data._id);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to load chat:', err.response?.data || err.message);
        // ✅ Don't show error for employees who aren't allocated
        if (err.response?.status === 403) {
          setError('You are not allocated to this project');
        } else {
          setError('Failed to load chat');
        }
        setLoading(false);
      }
    };

    if (projectId) {
      getChatRoom();
    }
  }, [projectId, initialChatRoomId]);

  // ============================================
  // 2. FETCH MESSAGES
  // ============================================
  const fetchMessages = async (pageNum = 1) => {
    if (!chatRoomId) return;

    try {
      const res = await api.get(`/chat/messages/${chatRoomId}?page=${pageNum}&limit=30`);
      
      if (pageNum === 1) {
        setMessages(res.data.messages);
      } else {
        setMessages(prev => [...res.data.messages, ...prev]);
      }
      
      setHasMore(res.data.totalPages > pageNum);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRoomId) {
      fetchMessages(1);
    }
  }, [chatRoomId]);

  // ============================================
  // 3. SOCKET.IO SETUP
  // ============================================
  useEffect(() => {
    if (!chatRoomId || !user) return;

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const SOCKET_URL = API_URL.replace('/api', '');
    
    console.log('🔌 Connecting to Socket.io at:', SOCKET_URL);
    
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected!');
      socketInstance.emit('joinRoom', { chatRoomId });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError('Failed to connect to chat server');
    });

    // ============================================
    // 4. SOCKET EVENT LISTENERS
    // ============================================

    socketInstance.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      if (message.senderId._id !== userId) {
        socketInstance.emit('markRead', { messageId: message._id });
      }
    });

    socketInstance.on('userJoined', ({ userId: joinedUserId }) => {
      setOnlineUsers(prev => [...prev, joinedUserId]);
    });

    socketInstance.on('userLeft', ({ userId: leftUserId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== leftUserId));
    });

    socketInstance.on('userTyping', ({ userId: typingUserId, isTyping: typing }) => {
      setTypingUsers(prev => {
        if (typing) {
          return prev.includes(typingUserId) ? prev : [...prev, typingUserId];
        } else {
          return prev.filter(id => id !== typingUserId);
        }
      });
    });

    socketInstance.on('messageRead', ({ messageId, userId: readByUserId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId && !msg.readBy.includes(readByUserId)
            ? { ...msg, readBy: [...msg.readBy, readByUserId] }
            : msg
        )
      );
    });

    socketInstance.on('messageEdited', ({ messageId, content, editedAt }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, content, isEdited: true, editedAt }
            : msg
        )
      );
    });

    socketInstance.on('messageDeleted', ({ messageId, deletedAt }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, content: '[This message was deleted]', deletedAt }
            : msg
        )
      );
    });

    socketInstance.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('connect_error');
      socketInstance.off('newMessage');
      socketInstance.off('userJoined');
      socketInstance.off('userLeft');
      socketInstance.off('userTyping');
      socketInstance.off('messageRead');
      socketInstance.off('messageEdited');
      socketInstance.off('messageDeleted');
      socketInstance.off('error');
      socketInstance.disconnect();
    };
  }, [chatRoomId, user, userId]);

  // ============================================
  // 5. SCROLL TO BOTTOM
  // ============================================
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================
  // 6. SEND MESSAGE
  // ============================================
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !socket) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    socket.emit('sendMessage', {
      chatRoomId,
      content,
      attachments: []
    });

    setSending(false);
    inputRef.current?.focus();
  };

  // ============================================
  // 7. TYPING INDICATOR
  // ============================================
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { chatRoomId, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { chatRoomId, isTyping: false });
    }, 2000);
  };

  // ============================================
  // 8. DELETE MESSAGE
  // ============================================
  const handleDeleteMessage = (messageId) => {
    if (!socket) return;
    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('deleteMessage', { messageId });
    }
  };

  // ============================================
  // 9. FORMAT FUNCTIONS
  // ============================================
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const isToday = msgDate.toDateString() === now.toDateString();
    const isYesterday = msgDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return msgDate.toLocaleDateString();
  };

  // ============================================
  // 10. LOAD MORE MESSAGES
  // ============================================
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  // ============================================
  // 11. RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-surface rounded-2xl border border-border">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-surface rounded-2xl border border-border">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">💬 Project Chat</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted">{onlineUsers.length} online</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full text-center text-xs text-muted hover:text-primary transition-colors py-2"
          >
            Load older messages
          </button>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => {
            const isOwn = msg.senderId?._id === userId;
            const isDeleted = msg.deletedAt !== null && msg.deletedAt !== undefined;
            const showDate = index === 0 || formatDate(msg.createdAt) !== formatDate(messages[index - 1]?.createdAt);

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs text-muted bg-surface-container-high px-3 py-1 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <p className="text-xs text-muted font-medium mb-0.5">
                        {msg.senderId?.name || 'Unknown'}
                      </p>
                    )}

                    <div className="relative">
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-surface-container-high text-on-surface rounded-bl-none'
                        } ${isDeleted ? 'italic opacity-60' : ''}`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        {msg.isEdited && !isDeleted && (
                          <span className="text-xs opacity-50 ml-1">(edited)</span>
                        )}
                      </div>

                      {!isDeleted && isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-500/20 text-muted hover:text-red-400"
                          title="Delete message"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 mt-0.5 text-xs text-muted ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {isOwn && !isDeleted && (
                        <span>
                          {msg.readBy?.length > 1 ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="text-xs ml-1">Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3 border-t border-border bg-surface/50">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;