// const ChatRoom = require('../models/ChatRoom');
// const Message = require('../models/Message');
// const Notification = require('../models/Notification');
// const Allocation = require('../models/Allocation');
// const Project = require('../models/Project');
// const jwt = require('jsonwebtoken');


// const setupSocket = (io) => {
  
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
    
//     if (!token) {
//       return next(new Error('Authentication required'));
//     }

//     try {
//       const jwt = require('jsonwebtoken');
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       socket.userRole = decoded.role;
//       next();
//     } catch (error) {
//       next(new Error('Invalid token'));
//     }
//   });

//   // ✅ On connection
//   io.on('connection', (socket) => {
//     console.log(`✅ User ${socket.userId} connected`);

//     // ============================================
//     // 1. JOIN A CHAT ROOM
//     // ============================================
//     socket.on('joinRoom', async ({ chatRoomId }) => {
//       try {
//         // Check if user has access
//         const chatRoom = await ChatRoom.findById(chatRoomId);
//         if (!chatRoom) {
//           socket.emit('error', { message: 'Chat room not found' });
//           return;
//         }

//         if (!chatRoom.employees.some(id => id.toString() === socket.userId.toString())) {
//           socket.emit('error', { message: 'You do not have access to this chat' });
//           return;
//         }

//         // Leave all previous rooms
//         const rooms = Array.from(socket.rooms);
//         rooms.forEach(room => {
//           if (room !== socket.id) {
//             socket.leave(room);
//           }
//         });

//         // Join the new room
//         socket.join(`room-${chatRoomId}`);
//         socket.chatRoomId = chatRoomId;

//         // Mark all messages as read when user joins
//         await Message.updateMany(
//           {
//             chatRoomId,
//             readBy: { $ne: socket.userId }
//           },
//           {
//             $addToSet: { readBy: socket.userId }
//           }
//         );

//         // Notify others in the room
//         socket.to(`room-${chatRoomId}`).emit('userJoined', {
//           userId: socket.userId,
//           message: 'User joined the chat'
//         });

//         console.log(`User ${socket.userId} joined room ${chatRoomId}`);
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 2. SEND A MESSAGE
//     // ============================================
//     socket.on('sendMessage', async ({ chatRoomId, content, attachments }) => {
//       try {
//         // Check if user has access
//         const chatRoom = await ChatRoom.findById(chatRoomId);
//         if (!chatRoom || !chatRoom.employees.includes(socket.userId)) {
//           socket.emit('error', { message: 'You do not have access to this chat' });
//           return;
//         }

//         // Create and save message
//         const message = await Message.create({
//           chatRoomId,
//           senderId: socket.userId,
//           content,
//           attachments: attachments || [],
//           readBy: [socket.userId]
//         });

//         // Populate sender details
//         await message.populate('senderId', 'name email');
//         const project = await Project.findById(chatRoom.projectId).select('name');

//         const notifications = chatRoom.employees
//       .filter(id => id.toString() !== socket.userId.toString())
//       .map(employeeId => ({
//         employeeId,
//         projectId: chatRoom.projectId,
//         projectName: project?.name || 'Unknown Project',
//         message: `💬 ${message.senderId.name} sent a message in "${project?.name || 'Project'}": ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
//         type: 'chat',
//         daysRemaining: 0,
//         read: false,
//         dismissed: false,
//         chatMessageId: message._id // ✅ Store message ID for navigation
//       }));

//       if (notifications.length > 0) {
//       await Notification.insertMany(notifications);
//       console.log(`📬 Created ${notifications.length} chat notifications`);
//     }


//         // Update chat room
//         chatRoom.updatedAt = new Date();
//         await chatRoom.save();

//         // Emit to everyone in the room (including sender)
//         io.to(`room-${chatRoomId}`).emit('newMessage', message);

//         console.log(`Message sent in room ${chatRoomId} by ${socket.userId}`);
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 3. TYPING INDICATOR
//     // ============================================
//     socket.on('typing', ({ chatRoomId, isTyping }) => {
//       socket.to(`room-${chatRoomId}`).emit('userTyping', {
//         userId: socket.userId,
//         isTyping
//       });
//     });

//     // ============================================
//     // 4. MARK MESSAGE AS READ
//     // ============================================
//     socket.on('markRead', async ({ messageId }) => {
//       try {
//         const message = await Message.findById(messageId);
//         if (!message) {
//           socket.emit('error', { message: 'Message not found' });
//           return;
//         }

//         if (!message.readBy.includes(socket.userId)) {
//           message.readBy.push(socket.userId);
//           await message.save();
//         }

//         // Notify others in the room
//         socket.to(`room-${message.chatRoomId}`).emit('messageRead', {
//           messageId,
//           userId: socket.userId
//         });
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 5. MARK ALL AS READ
//     // ============================================
//     socket.on('markAllRead', async ({ chatRoomId }) => {
//       try {
//         await Message.updateMany(
//           {
//             chatRoomId,
//             readBy: { $ne: socket.userId }
//           },
//           {
//             $addToSet: { readBy: socket.userId }
//           }
//         );

//         socket.to(`room-${chatRoomId}`).emit('allRead', {
//           userId: socket.userId
//         });
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 6. EDIT A MESSAGE
//     // ============================================
//     socket.on('editMessage', async ({ messageId, content }) => {
//       try {
//         const message = await Message.findById(messageId);
//         if (!message) {
//           socket.emit('error', { message: 'Message not found' });
//           return;
//         }

//         // Only sender can edit
//         if (message.senderId.toString() !== socket.userId.toString()) {
//           socket.emit('error', { message: 'You can only edit your own messages' });
//           return;
//         }

//         // Can't edit after 15 minutes
//         const timeSinceSent = Date.now() - new Date(message.createdAt).getTime();
//         if (timeSinceSent > 15 * 60 * 1000) {
//           socket.emit('error', { message: 'Messages can only be edited within 15 minutes' });
//           return;
//         }

//         message.content = content;
//         message.isEdited = true;
//         message.editedAt = new Date();
//         await message.save();

//         io.to(`room-${message.chatRoomId}`).emit('messageEdited', {
//           messageId,
//           content,
//           editedAt: message.editedAt
//         });
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 7. DELETE A MESSAGE (Soft Delete)
//     // ============================================
//     socket.on('deleteMessage', async ({ messageId }) => {
//       try {
//         const message = await Message.findById(messageId);
//         if (!message) {
//           socket.emit('error', { message: 'Message not found' });
//           return;
//         }

//         // Only sender or admin can delete
//         const isAdmin = socket.userRole === 'admin' || socket.userRole === 'manager';
//         if (message.senderId.toString() !== socket.userId.toString() && !isAdmin) {
//           socket.emit('error', { message: 'You can only delete your own messages' });
//           return;
//         }

//         message.deletedAt = new Date();
//         message.content = '[This message was deleted]';
//         await message.save();

//         io.to(`room-${message.chatRoomId}`).emit('messageDeleted', {
//           messageId,
//           deletedAt: message.deletedAt
//         });
//       } catch (error) {
//         socket.emit('error', { message: error.message });
//       }
//     });

//     // ============================================
//     // 8. DISCONNECT
//     // ============================================
//     socket.on('disconnect', () => {
//       console.log(`❌ User ${socket.userId} disconnected`);
      
//       // Notify others in the room
//       if (socket.chatRoomId) {
//         socket.to(`room-${socket.chatRoomId}`).emit('userLeft', {
//           userId: socket.userId,
//           message: 'User left the chat'
//         });
//       }
//     });
//   });

//   return io;
// };

// module.exports = setupSocket;
















'use strict';

const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// ============================================
// Helper: check whether a user belongs to room
// ============================================
const hasRoomAccess = (chatRoom, userId) => {
  return chatRoom.employees.some(
    (employeeId) =>
      employeeId.toString() === userId.toString()
  );
};

// ============================================
// Helper: get authorized chat room
// ============================================
const getAuthorizedRoom = async (
  socket,
  chatRoomId
) => {
  const chatRoom = await ChatRoom.findOne({
    _id: chatRoomId,
    organizationId: socket.organizationId
  });

  if (!chatRoom) {
    return null;
  }

  if (!hasRoomAccess(chatRoom, socket.userId)) {
    return null;
  }

  return chatRoom;
};

const setupSocket = (io) => {
  // ============================================
  // SOCKET AUTHENTICATION
  // ============================================
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(
        new Error('Authentication required')
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get the current user from DB so the
      // organization context cannot be trusted
      // only from the JWT payload.
      const employee =
        await Employee.findById(decoded.id)
          .select('_id role organizationId')
          .lean();

      if (!employee) {
        return next(
          new Error('User no longer exists')
        );
      }

      if (!employee.organizationId) {
        return next(
          new Error(
            'No organization assigned to this account'
          )
        );
      }

      socket.userId = employee._id;
      socket.userRole = employee.role;
      socket.organizationId =
        employee.organizationId;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // ============================================
  // CONNECTION
  // ============================================
  io.on('connection', (socket) => {
    console.log(
      `✅ User ${socket.userId} connected`
    );

    // ============================================
    // 1. JOIN A CHAT ROOM
    // ============================================
    socket.on(
      'joinRoom',
      async ({ chatRoomId }) => {
        try {
          const chatRoom =
            await getAuthorizedRoom(
              socket,
              chatRoomId
            );

          if (!chatRoom) {
            // Managers/admins may need to join a room
            // before they are added as room members.
            // Keep existing behavior by checking the
            // organization first.
            const organizationRoom =
              await ChatRoom.findOne({
                _id: chatRoomId,
                organizationId:
                  socket.organizationId
              });

            if (!organizationRoom) {
              socket.emit('error', {
                message:
                  'Chat room not found'
              });
              return;
            }

            const isAdminOrManager =
              socket.userRole === 'admin' ||
              socket.userRole === 'manager';

            if (!isAdminOrManager) {
              socket.emit('error', {
                message:
                  'You do not have access to this chat'
              });
              return;
            }

            organizationRoom.employees.push(
              socket.userId
            );

            await organizationRoom.save();

            // Use the updated room below.
            socket.chatRoomId =
              chatRoomId;

            const rooms = Array.from(
              socket.rooms
            );

            rooms.forEach((room) => {
              if (room !== socket.id) {
                socket.leave(room);
              }
            });

            socket.join(
              `room-${chatRoomId}`
            );

            await Message.updateMany(
              {
                chatRoomId,
                organizationId:
                  socket.organizationId,
                readBy: {
                  $ne: socket.userId
                }
              },
              {
                $addToSet: {
                  readBy: socket.userId
                }
              }
            );

            socket
              .to(`room-${chatRoomId}`)
              .emit('userJoined', {
                userId: socket.userId,
                message:
                  'User joined the chat'
              });

            console.log(
              `User ${socket.userId} joined room ${chatRoomId}`
            );

            return;
          }

          // Leave all previous rooms.
          const rooms = Array.from(
            socket.rooms
          );

          rooms.forEach((room) => {
            if (room !== socket.id) {
              socket.leave(room);
            }
          });

          socket.join(
            `room-${chatRoomId}`
          );

          socket.chatRoomId =
            chatRoomId;

          // Mark all messages as read when user joins.
          await Message.updateMany(
            {
              chatRoomId,
              organizationId:
                socket.organizationId,
              readBy: {
                $ne: socket.userId
              }
            },
            {
              $addToSet: {
                readBy: socket.userId
              }
            }
          );

          socket
            .to(`room-${chatRoomId}`)
            .emit('userJoined', {
              userId: socket.userId,
              message:
                'User joined the chat'
            });

          console.log(
            `User ${socket.userId} joined room ${chatRoomId}`
          );
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 2. SEND A MESSAGE
    // ============================================
    socket.on(
      'sendMessage',
      async ({
        chatRoomId,
        content,
        attachments
      }) => {
        try {
          const chatRoom =
            await getAuthorizedRoom(
              socket,
              chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          const message =
            await Message.create({
              chatRoomId,
              organizationId:
                socket.organizationId,
              senderId: socket.userId,
              content,
              attachments:
                attachments || [],
              readBy: [socket.userId]
            });

          await message.populate(
            'senderId',
            'name email'
          );

          const project =
            await Project.findOne({
              _id: chatRoom.projectId,
              organizationId:
                socket.organizationId
            })
              .select('name')
              .lean();

          const notifications =
            chatRoom.employees
              .filter(
                (id) =>
                  id.toString() !==
                  socket.userId.toString()
              )
              .map((employeeId) => ({
                employeeId,
                projectId:
                  chatRoom.projectId,
                organizationId:
                  socket.organizationId,
                projectName:
                  project?.name ||
                  'Unknown Project',
                message: `💬 ${message.senderId.name} sent a message in "${project?.name || 'Project'}": ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                type: 'chat',
                daysRemaining: 0,
                read: false,
                dismissed: false,
                chatMessageId:
                  message._id
              }));

          if (notifications.length > 0) {
            await Notification.insertMany(
              notifications
            );

            console.log(
              `📬 Created ${notifications.length} chat notifications`
            );
          }

          chatRoom.updatedAt =
            new Date();

          await chatRoom.save();

          io.to(
            `room-${chatRoomId}`
          ).emit(
            'newMessage',
            message
          );

          console.log(
            `Message sent in room ${chatRoomId} by ${socket.userId}`
          );
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 3. TYPING INDICATOR
    // ============================================
    socket.on(
      'typing',
      async ({
        chatRoomId,
        isTyping
      }) => {
        try {
          const chatRoom =
            await getAuthorizedRoom(
              socket,
              chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          socket
            .to(`room-${chatRoomId}`)
            .emit(
              'userTyping',
              {
                userId: socket.userId,
                isTyping
              }
            );
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 4. MARK MESSAGE AS READ
    // ============================================
    socket.on(
      'markRead',
      async ({ messageId }) => {
        try {
          const message =
            await Message.findOne({
              _id: messageId,
              organizationId:
                socket.organizationId
            });

          if (!message) {
            socket.emit('error', {
              message:
                'Message not found'
            });
            return;
          }

          const chatRoom =
            await getAuthorizedRoom(
              socket,
              message.chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          if (
            !message.readBy.some(
              (id) =>
                id.toString() ===
                socket.userId.toString()
            )
          ) {
            message.readBy.push(
              socket.userId
            );

            await message.save();
          }

          socket
            .to(
              `room-${message.chatRoomId}`
            )
            .emit('messageRead', {
              messageId,
              userId:
                socket.userId
            });
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 5. MARK ALL AS READ
    // ============================================
    socket.on(
      'markAllRead',
      async ({ chatRoomId }) => {
        try {
          const chatRoom =
            await getAuthorizedRoom(
              socket,
              chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          await Message.updateMany(
            {
              chatRoomId,
              organizationId:
                socket.organizationId,
              readBy: {
                $ne: socket.userId
              }
            },
            {
              $addToSet: {
                readBy:
                  socket.userId
              }
            }
          );

          socket
            .to(`room-${chatRoomId}`)
            .emit('allRead', {
              userId:
                socket.userId
            });
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 6. EDIT A MESSAGE
    // ============================================
    socket.on(
      'editMessage',
      async ({
        messageId,
        content
      }) => {
        try {
          const message =
            await Message.findOne({
              _id: messageId,
              organizationId:
                socket.organizationId
            });

          if (!message) {
            socket.emit('error', {
              message:
                'Message not found'
            });
            return;
          }

          if (
            message.senderId.toString() !==
            socket.userId.toString()
          ) {
            socket.emit('error', {
              message:
                'You can only edit your own messages'
            });
            return;
          }

          const chatRoom =
            await getAuthorizedRoom(
              socket,
              message.chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          const timeSinceSent =
            Date.now() -
            new Date(
              message.createdAt
            ).getTime();

          if (
            timeSinceSent >
            15 * 60 * 1000
          ) {
            socket.emit('error', {
              message:
                'Messages can only be edited within 15 minutes'
            });
            return;
          }

          message.content =
            content;

          message.isEdited =
            true;

          message.editedAt =
            new Date();

          await message.save();

          io.to(
            `room-${message.chatRoomId}`
          ).emit(
            'messageEdited',
            {
              messageId,
              content,
              editedAt:
                message.editedAt
            }
          );
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 7. DELETE A MESSAGE
    // ============================================
    socket.on(
      'deleteMessage',
      async ({ messageId }) => {
        try {
          const message =
            await Message.findOne({
              _id: messageId,
              organizationId:
                socket.organizationId
            });

          if (!message) {
            socket.emit('error', {
              message:
                'Message not found'
            });
            return;
          }

          const isAdminOrManager =
            socket.userRole === 'admin' ||
            socket.userRole === 'manager';

          if (
            message.senderId.toString() !==
              socket.userId.toString() &&
            !isAdminOrManager
          ) {
            socket.emit('error', {
              message:
                'You can only delete your own messages'
            });
            return;
          }

          const chatRoom =
            await getAuthorizedRoom(
              socket,
              message.chatRoomId
            );

          if (!chatRoom) {
            socket.emit('error', {
              message:
                'You do not have access to this chat'
            });
            return;
          }

          message.deletedAt =
            new Date();

          message.content =
            '[This message was deleted]';

          await message.save();

          io.to(
            `room-${message.chatRoomId}`
          ).emit(
            'messageDeleted',
            {
              messageId,
              deletedAt:
                message.deletedAt
            }
          );
        } catch (error) {
          socket.emit('error', {
            message: error.message
          });
        }
      }
    );

    // ============================================
    // 8. DISCONNECT
    // ============================================
    socket.on(
      'disconnect',
      () => {
        console.log(
          `❌ User ${socket.userId} disconnected`
        );

        if (socket.chatRoomId) {
          socket
            .to(
              `room-${socket.chatRoomId}`
            )
            .emit('userLeft', {
              userId:
                socket.userId,
              message:
                'User left the chat'
            });
        }
      }
    );
  });

  return io;
};

module.exports = setupSocket;

